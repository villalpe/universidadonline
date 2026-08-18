from decimal import Decimal

from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminUserRole, IsStudentUserRole
from .models import ChargeConcept, StudentCharge, StudentPayment
from .serializers import (
    ChargeConceptSerializer,
    StudentChargeSerializer,
    StudentPaymentSerializer,
)


def recalculate_charge_status(charge):
    total_paid = charge.total_paid

    if total_paid <= Decimal("0.00"):
        charge.status = StudentCharge.Status.PENDING
    elif total_paid < charge.amount:
        charge.status = StudentCharge.Status.PARTIAL
    elif total_paid >= charge.amount:
        charge.status = StudentCharge.Status.PAID

    charge.save(update_fields=["status", "updated_at"])


class ChargeConceptViewSet(viewsets.ModelViewSet):
    queryset = ChargeConcept.objects.all()
    serializer_class = ChargeConceptSerializer
    permission_classes = [IsAdminUserRole]
    filterset_fields = ["category", "active"]
    search_fields = ["code", "name"]


class StudentChargeViewSet(viewsets.ModelViewSet):
    queryset = StudentCharge.objects.select_related(
        "student__user",
        "concept",
        "academic_period",
    ).all()
    serializer_class = StudentChargeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["student", "concept", "academic_period", "status"]
    search_fields = [
        "reference",
        "student__student_code",
        "student__user__first_name",
        "student__user__last_name",
        "concept__name",
    ]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or (user.role and user.role.code == "admin"):
            return self.queryset

        if user.role and user.role.code == "student" and hasattr(user, "student_profile"):
            return self.queryset.filter(student=user.student_profile)

        return StudentCharge.objects.none()

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]

    def perform_create(self, serializer):
        charge = serializer.save()

        if charge.status != StudentCharge.Status.CANCELLED:
            recalculate_charge_status(charge)

    def perform_update(self, serializer):
        charge = serializer.save()

        if charge.status != StudentCharge.Status.CANCELLED:
            recalculate_charge_status(charge)


class StudentPaymentViewSet(viewsets.ModelViewSet):
    queryset = StudentPayment.objects.select_related(
        "student__user",
        "charge",
    ).all()
    serializer_class = StudentPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["student", "charge", "method", "status"]
    search_fields = [
        "student__student_code",
        "student__user__first_name",
        "student__user__last_name",
        "charge__reference",
        "transaction_reference",
    ]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or (user.role and user.role.code == "admin"):
            return self.queryset

        if user.role and user.role.code == "student" and hasattr(user, "student_profile"):
            return self.queryset.filter(student=user.student_profile)

        return StudentPayment.objects.none()

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]

    def perform_create(self, serializer):
        payment = serializer.save()
        recalculate_charge_status(payment.charge)

    def perform_update(self, serializer):
        old_charge = self.get_object().charge
        payment = serializer.save()
        recalculate_charge_status(old_charge)
        recalculate_charge_status(payment.charge)

    def perform_destroy(self, instance):
        charge = instance.charge
        instance.delete()
        recalculate_charge_status(charge)


class MyStatementView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudentUserRole]

    def get(self, request):
        student = request.user.student_profile
        charges = StudentCharge.objects.filter(student=student).select_related(
            "concept",
            "academic_period",
        )
        payments = StudentPayment.objects.filter(student=student).select_related("charge")

        total_charges = sum((charge.amount for charge in charges), Decimal("0.00"))
        total_payments = sum(
            (payment.amount for payment in payments if payment.status == StudentPayment.Status.COMPLETED),
            Decimal("0.00"),
        )
        balance = total_charges - total_payments

        return Response(
            {
                "student_id": student.id,
                "student_code": student.student_code,
                "student_name": student.user.get_full_name(),
                "total_charges": total_charges,
                "total_payments": total_payments,
                "balance": balance,
                "charges": StudentChargeSerializer(charges, many=True).data,
                "payments": StudentPaymentSerializer(payments, many=True).data,
            }
        )