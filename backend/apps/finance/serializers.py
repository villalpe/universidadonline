from decimal import Decimal

from rest_framework import serializers

from .models import ChargeConcept, StudentCharge, StudentPayment


class ChargeConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChargeConcept
        fields = [
            "id",
            "code",
            "name",
            "category",
            "description",
            "default_amount",
            "active",
            "created_at",
            "updated_at",
        ]

    def validate_default_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("El monto por defecto no puede ser negativo.")
        return value


class StudentChargeSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_code = serializers.CharField(source="student.student_code", read_only=True)
    concept_name = serializers.CharField(source="concept.name", read_only=True)
    academic_period_name = serializers.CharField(source="academic_period.name", read_only=True)
    total_paid = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = StudentCharge
        fields = [
            "id",
            "student",
            "student_name",
            "student_code",
            "concept",
            "concept_name",
            "academic_period",
            "academic_period_name",
            "reference",
            "description",
            "amount",
            "due_date",
            "status",
            "total_paid",
            "balance",
            "created_at",
            "updated_at",
        ]

    def get_student_name(self, obj):
        if hasattr(obj.student, "user") and obj.student.user:
            return obj.student.user.get_full_name() or obj.student.user.username
        return ""

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("El monto del cargo debe ser mayor a cero.")
        return value


class StudentPaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_code = serializers.CharField(source="student.student_code", read_only=True)
    charge_reference = serializers.CharField(source="charge.reference", read_only=True)

    class Meta:
        model = StudentPayment
        fields = [
            "id",
            "student",
            "student_name",
            "student_code",
            "charge",
            "charge_reference",
            "payment_date",
            "amount",
            "method",
            "status",
            "transaction_reference",
            "notes",
            "created_at",
            "updated_at",
        ]

    def get_student_name(self, obj):
        if hasattr(obj.student, "user") and obj.student.user:
            return obj.student.user.get_full_name() or obj.student.user.username
        return ""

    def validate(self, attrs):
        student = attrs.get("student", getattr(self.instance, "student", None))
        charge = attrs.get("charge", getattr(self.instance, "charge", None))
        amount = attrs.get("amount", getattr(self.instance, "amount", None))
        status = attrs.get("status", getattr(self.instance, "status", None))

        if amount is not None and amount <= 0:
            raise serializers.ValidationError({"amount": "El pago debe ser mayor a cero."})

        if charge and student and charge.student_id != student.id:
            raise serializers.ValidationError(
                {"charge": "El cargo no pertenece al alumno indicado."}
            )

        if charge and charge.status == StudentCharge.Status.CANCELLED:
            raise serializers.ValidationError(
                {"charge": "No se pueden registrar pagos sobre un cargo cancelado."}
            )

        if charge and charge.status == StudentCharge.Status.PAID and status == StudentPayment.Status.COMPLETED:
            raise serializers.ValidationError(
                {"charge": "El cargo ya se encuentra pagado."}
            )

        if charge and amount and status == StudentPayment.Status.COMPLETED:
            previous_completed = charge.payments.filter(status=StudentPayment.Status.COMPLETED)
            if self.instance:
                previous_completed = previous_completed.exclude(pk=self.instance.pk)

            total_previous = sum(
                (payment.amount for payment in previous_completed),
                Decimal("0.00"),
            )
            if total_previous + amount > charge.amount:
                raise serializers.ValidationError(
                    {"amount": "El pago excede el saldo pendiente del cargo."}
                )

        return attrs