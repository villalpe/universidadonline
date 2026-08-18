from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import Role, StudentProfile, TeacherProfile
from apps.academics.models import Career, StudyPlan, Subject, AcademicPeriod
from apps.classrooms.models import VirtualClassroom
from apps.assignments.models import WeeklyModule, Assignment

User = get_user_model()


class SubmissionRulesTestCase(APITestCase):
    def setUp(self):
        self.teacher_role = Role.objects.create(code="teacher", name="Profesor")
        self.student_role = Role.objects.create(code="student", name="Alumno")

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
        self.subject = Subject.objects.create(
            code="MAT101",
            name="Matemáticas I",
            credits=8,
            weekly_hours=5,
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

        teacher_user = User.objects.create_user(
            email="teacher@test.com",
            password="Password123",
            role=self.teacher_role,
        )
        teacher = TeacherProfile.objects.create(user=teacher_user, employee_code="T001")

        self.classroom = VirtualClassroom.objects.create(
            code="MAT1-A",
            name="Matemáticas I - A",
            subject=self.subject,
            academic_period=self.period,
            study_plan=self.study_plan,
            main_teacher=teacher,
            max_students=30,
            start_date="2026-01-10",
            end_date="2026-04-20",
            status="active",
        )
        self.module = WeeklyModule.objects.create(
            virtual_classroom=self.classroom,
            week_number=1,
            title="Semana 1",
            start_date="2026-01-10",
            end_date="2026-01-16",
            is_published=True,
        )
        self.assignment = Assignment.objects.create(
            weekly_module=self.module,
            title="Tarea 1",
            instructions="Instrucciones",
            due_date="2026-01-15T23:59:00Z",
            max_score=100,
            allow_text_submission=True,
            is_published=True,
        )

        student_user = User.objects.create_user(
            email="student@test.com",
            password="Password123",
            role=self.student_role,
        )
        self.student = StudentProfile.objects.create(
            user=student_user,
            student_code="A001",
            career=self.career,
            study_plan=self.study_plan,
            status="active",
        )
        self.client.force_authenticate(user=student_user)

    def test_student_cannot_submit_if_not_enrolled(self):
        response = self.client.post(
            "/api/v1/submissions/",
            {
                "assignment": self.assignment.id,
                "text_submission": "Mi entrega",
                "status": "submitted",
                "attempt_number": 1,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)