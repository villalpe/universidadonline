from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import Role, StudentProfile
from apps.academics.models import Career, StudyPlan, AcademicPeriod
from apps.finance.models import ChargeConcept, StudentCharge, StudentPayment

User = get_user_model()


class FinanceRulesTestCase(APITestCase):
    def setUp(self):
        self.admin_role = Role.objects.create(code="admin", name="Administrador")
        self.student_role = Role.objects.create(code="student", name="Alumno")

        self.admin = User.objects.create_user(
            email="admin@test.com",
            password="Password123",
            role=self.admin_role,
        )
        self.client.force_authenticate(user=self.admin)

        self.career = Career.objects.create(
            code="ISC",
            name="Ingeniería en Sistemas",
            duration_months=36,
            active=True,
        )
        self.study_plan = StudyPlan.objects.create(
            career=self.career,
            code="ISC-2026",
            name="Plan 2026",
            version="1.0",
            effective_date="2026-01-01",
            active=True,
        )
        self.period = AcademicPeriod.objects.create(
            code="2026-1",
            name="Periodo 2026-1",
            start_date="2026-01-01",
            end_date="2026-04-30",
            enrollment_start="2025-12-01",
            enrollment_end="2025-12-31",
            status="active",
        )

        user = User.objects.create_user(
            email="student@test.com",
            password="Password123",
            role=self.student_role,
        )
        self.student = StudentProfile.objects.create(
            user=user,
            student_code="A001",
            career=self.career,
            study_plan=self.study_plan,
            status="active",
        )

        self.concept = ChargeConcept.objects.create(
            code="COL",
            name="Colegiatura",
            category="tuition",
            default_amount=2500,
            active=True,
        )
        self.charge = StudentCharge.objects.create(
            student=self.student,
            concept=self.concept,
            academic_period=self.period,
            reference="CHG-001",
            amount=2500,
            status="pending",
        )
        StudentPayment.objects.create(
            student=self.student,
            charge=self.charge,
            payment_date=timezone.now(),
            amount=2000,
            method="transfer",
            status="completed",
        )

    def test_should_not_allow_overpayment(self):
        response = self.client.post(
            "/api/v1/finance/payments/",
            {
                "student": self.student.id,
                "charge": self.charge.id,
                "payment_date": timezone.now().isoformat(),
                "amount": 600,
                "method": "transfer",
                "status": "completed",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)