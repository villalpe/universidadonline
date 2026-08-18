from rest_framework import permissions, viewsets

from apps.accounts.permissions import IsAdminUserRole
from .models import VirtualClassroom, TeacherAssignment, ClassroomEnrollment
from .serializers import (
    VirtualClassroomSerializer,
    TeacherAssignmentSerializer,
    ClassroomEnrollmentSerializer,
)


class VirtualClassroomViewSet(viewsets.ModelViewSet):
    queryset = VirtualClassroom.objects.select_related(
        "subject",
        "academic_period",
        "study_plan",
        "main_teacher__user",
    ).all()
    serializer_class = VirtualClassroomSerializer
    filterset_fields = ["status", "academic_period", "subject", "study_plan", "main_teacher"]
    search_fields = ["code", "name", "subject__name"]
    ordering_fields = ["created_at", "start_date", "end_date", "name"]

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or (user.role and user.role.code == "admin"):
            return self.queryset

        if user.role and user.role.code == "teacher" and hasattr(user, "teacher_profile"):
            return self.queryset.filter(
                teacher_assignments__teacher=user.teacher_profile
            ).distinct()

        if user.role and user.role.code == "student" and hasattr(user, "student_profile"):
            return self.queryset.filter(
                student_enrollments__student=user.student_profile
            ).distinct()

        return VirtualClassroom.objects.none()


class TeacherAssignmentViewSet(viewsets.ModelViewSet):
    queryset = TeacherAssignment.objects.select_related(
        "teacher__user",
        "virtual_classroom",
    ).all()
    serializer_class = TeacherAssignmentSerializer
    filterset_fields = ["role_in_class", "teacher", "virtual_classroom"]
    search_fields = ["teacher__user__first_name", "teacher__user__last_name", "virtual_classroom__name"]

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or (user.role and user.role.code == "admin"):
            return self.queryset

        if user.role and user.role.code == "teacher" and hasattr(user, "teacher_profile"):
            return self.queryset.filter(teacher=user.teacher_profile)

        return TeacherAssignment.objects.none()


class ClassroomEnrollmentViewSet(viewsets.ModelViewSet):
    queryset = ClassroomEnrollment.objects.select_related(
        "student__user",
        "virtual_classroom",
    ).all()
    serializer_class = ClassroomEnrollmentSerializer
    filterset_fields = ["status", "student", "virtual_classroom"]
    search_fields = [
        "student__student_code",
        "student__user__first_name",
        "student__user__last_name",
        "virtual_classroom__name",
    ]

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or (user.role and user.role.code == "admin"):
            return self.queryset

        if user.role and user.role.code == "teacher" and hasattr(user, "teacher_profile"):
            return self.queryset.filter(
                virtual_classroom__teacher_assignments__teacher=user.teacher_profile
            ).distinct()

        if user.role and user.role.code == "student" and hasattr(user, "student_profile"):
            return self.queryset.filter(student=user.student_profile)

        return ClassroomEnrollment.objects.none()