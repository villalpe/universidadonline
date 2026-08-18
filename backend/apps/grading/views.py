from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from .models import GradeRecord, AcademicHistory
from .serializers import GradeRecordSerializer, AcademicHistorySerializer


class GradeRecordViewSet(viewsets.ModelViewSet):
    queryset = GradeRecord.objects.select_related(
        "student__user",
        "virtual_classroom",
        "assignment",
        "submission",
        "graded_by__user",
    ).all()
    serializer_class = GradeRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["student", "virtual_classroom", "assignment", "graded_by"]
    search_fields = [
        "student__student_code",
        "student__user__first_name",
        "student__user__last_name",
        "assignment__title",
        "virtual_classroom__name",
    ]

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

        return GradeRecord.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        virtual_classroom = serializer.validated_data["virtual_classroom"]

        if user.is_superuser or (user.role and user.role.code == "admin"):
            serializer.save(graded_at=timezone.now())
            return

        if user.role and user.role.code == "teacher" and hasattr(user, "teacher_profile"):
            teacher_profile = user.teacher_profile
            assigned = virtual_classroom.teacher_assignments.filter(
                teacher=teacher_profile
            ).exists()

            if not assigned:
                raise PermissionDenied("No puedes calificar salones virtuales que no tienes asignados.")

            serializer.save(graded_by=teacher_profile, graded_at=timezone.now())
            return

        raise PermissionDenied("No tienes permisos para registrar calificaciones.")


class AcademicHistoryViewSet(viewsets.ModelViewSet):
    queryset = AcademicHistory.objects.select_related(
        "student__user",
        "subject",
        "academic_period",
    ).all()
    serializer_class = AcademicHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["student", "subject", "academic_period", "status"]
    search_fields = [
        "student__student_code",
        "student__user__first_name",
        "student__user__last_name",
        "subject__name",
        "academic_period__name",
    ]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or (user.role and user.role.code == "admin"):
            return self.queryset

        if user.role and user.role.code == "student" and hasattr(user, "student_profile"):
            return self.queryset.filter(student=user.student_profile)

        if user.role and user.role.code == "teacher" and hasattr(user, "teacher_profile"):
            return self.queryset.filter(
                subject__virtual_classrooms__teacher_assignments__teacher=user.teacher_profile
            ).distinct()

        return AcademicHistory.objects.none()