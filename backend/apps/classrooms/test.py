from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import Role, StudentProfile, TeacherProfile
from apps.academics.models import Career, StudyPlan, Subject, AcademicPeriod
from apps.classrooms.models import VirtualClassroom, ClassroomEnrollment

User = get_user_model()


class ClassroomEnrollmentRulesTestCase(APITestCase):
    def setUp(self):
        self.admin_role = Role.objects.create(code="admin", name="Administrador")
        self.teacher_role = Role.objects.create(code="teacher", name="Profesor")
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
        self.teacher = TeacherProfile.objects.create(
            user=teacher_user,
            employee_code="T001",
        )

        self.classroom = VirtualClassroom.objects.create(
            code="MAT1-A",
            name="Matemáticas I - A",
            subject=self.subject,
            academic_period=self.period,
            study_plan=self.study_plan,
            main_teacher=self.teacher,
            max_students=1,
            start_date="2026-01-10",
            end_date="2026-04-20",
            status="active",
        )

    def _create_student_profile(self, index):
        user = User.objects.create_user(
            email=f"student{index}@test.com",
            password="Password123",
            role=self.student_role,
        )
        return StudentProfile.objects.create(
            user=user,
            student_code=f"A00{index}",
            career=self.career,
            study_plan=self.study_plan,
            status="active",
        )

    def test_classroom_should_not_allow_enrollment_when_full(self):
        student1 = self._create_student_profile(1)
        student2 = self._create_student_profile(2)

        ClassroomEnrollment.objects.create(
            student=student1,
            virtual_classroom=self.classroom,
            status="active",
        )

        response = self.client.post(
            "/api/v1/classroom-enrollments/",
            {
                "student": student2.id,
                "virtual_classroom": self.classroom.id,
                "status": "active",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)