from rest_framework import permissions, viewsets, parsers
from django.db.models import Max
from rest_framework.exceptions import PermissionDenied

from .models import WeeklyModule, Assignment, Submission, SubmissionFile, SubmissionPrecheck
from .services.pdf_precheck import run_pdf_precheck
from .serializers import (
    WeeklyModuleSerializer,
    AssignmentSerializer,
    SubmissionSerializer,
    SubmissionCreateSerializer,
    SubmissionFileSerializer,
)


class WeeklyModuleViewSet(viewsets.ModelViewSet):
    queryset = WeeklyModule.objects.select_related("virtual_classroom").all()
    serializer_class = WeeklyModuleSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or (user.role and user.role.code == "admin"):
            return self.queryset

        if user.role and user.role.code == "teacher" and hasattr(user, "teacher_profile"):
            return self.queryset.filter(
                virtual_classroom__teacher_assignments__teacher=user.teacher_profile
            ).distinct()

        if user.role and user.role.code == "student" and hasattr(user, "student_profile"):
            return self.queryset.filter(
                virtual_classroom__student_enrollments__student=user.student_profile,
                virtual_classroom__student_enrollments__status="active",
                is_published=True,
            ).distinct()

        return WeeklyModule.objects.none()

    def perform_create(self, serializer):
        user = self.request.user

        if not (user.role and user.role.code == "student" and hasattr(user, "student_profile")):
            raise PermissionDenied("Solo los alumnos pueden crear entregas.")

        student = user.student_profile
        assignment = serializer.validated_data["assignment"]

        last_submission = (
            Submission.objects.filter(assignment=assignment, student=student)
            .order_by("-attempt_number")
            .first()
        )
        next_attempt = 1 if not last_submission else last_submission.attempt_number + 1

        serializer.save(
            student=student,
            attempt_number=next_attempt,
        )

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()
        virtual_classroom = serializer.validated_data.get(
            "virtual_classroom", instance.virtual_classroom
        )

        if virtual_classroom.status in ["closed", "cancelled"]:
            raise PermissionDenied("No se pueden editar módulos en salones cerrados o cancelados.")

        if user.is_superuser or (user.role and user.role.code == "admin"):
            serializer.save()
            return

        if user.role and user.role.code == "teacher" and hasattr(user, "teacher_profile"):
            is_assigned = virtual_classroom.teacher_assignments.filter(
                teacher=user.teacher_profile
            ).exists()

            if not is_assigned:
                raise PermissionDenied(
                    "No puedes editar módulos de salones virtuales que no tienes asignados."
                )

            serializer.save()
            return

        raise PermissionDenied("No tienes permisos para editar módulos semanales.")

    def perform_destroy(self, instance):
        user = self.request.user

        if user.is_superuser or (user.role and user.role.code == "admin"):
            instance.delete()
            return

        if user.role and user.role.code == "teacher" and hasattr(user, "teacher_profile"):
            is_assigned = instance.virtual_classroom.teacher_assignments.filter(
                teacher=user.teacher_profile
            ).exists()

            if not is_assigned:
                raise PermissionDenied(
                    "No puedes eliminar módulos de salones virtuales que no tienes asignados."
                )

            instance.delete()
            return

        raise PermissionDenied("No tienes permisos para eliminar módulos semanales.")


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.select_related(
        "weekly_module",
        "weekly_module__virtual_classroom",
    ).all()
    serializer_class = AssignmentSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or (user.role and user.role.code == "admin"):
            return self.queryset

        if user.role and user.role.code == "teacher" and hasattr(user, "teacher_profile"):
            return self.queryset.filter(
                weekly_module__virtual_classroom__teacher_assignments__teacher=user.teacher_profile
            ).distinct()

        if user.role and user.role.code == "student" and hasattr(user, "student_profile"):
            return self.queryset.filter(
                weekly_module__virtual_classroom__student_enrollments__student=user.student_profile,
                weekly_module__virtual_classroom__student_enrollments__status="active",
                weekly_module__is_published=True,
                is_published=True,
            ).distinct()

        return Assignment.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        weekly_module = serializer.validated_data["weekly_module"]
        virtual_classroom = weekly_module.virtual_classroom

        if user.is_superuser or (user.role and user.role.code == "admin"):
            serializer.save()
            return

        if user.role and user.role.code == "teacher" and hasattr(user, "teacher_profile"):
            is_assigned = virtual_classroom.teacher_assignments.filter(
                teacher=user.teacher_profile
            ).exists()

            if not is_assigned:
                raise PermissionDenied(
                    "No puedes crear tareas en módulos de salones virtuales que no tienes asignados."
                )

            serializer.save()
            return

        raise PermissionDenied("No tienes permisos para crear tareas.")

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()
        weekly_module = serializer.validated_data.get("weekly_module", instance.weekly_module)
        virtual_classroom = weekly_module.virtual_classroom

        if user.is_superuser or (user.role and user.role.code == "admin"):
            serializer.save()
            return

        if user.role and user.role.code == "teacher" and hasattr(user, "teacher_profile"):
            is_assigned = virtual_classroom.teacher_assignments.filter(
                teacher=user.teacher_profile
            ).exists()

            if not is_assigned:
                raise PermissionDenied(
                    "No puedes editar tareas de módulos de salones virtuales que no tienes asignados."
                )

            serializer.save()
            return

        raise PermissionDenied("No tienes permisos para editar tareas.")

    def perform_destroy(self, instance):
        user = self.request.user

        if user.is_superuser or (user.role and user.role.code == "admin"):
            instance.delete()
            return

        if user.role and user.role.code == "teacher" and hasattr(user, "teacher_profile"):
            is_assigned = instance.weekly_module.virtual_classroom.teacher_assignments.filter(
                teacher=user.teacher_profile
            ).exists()

            if not is_assigned:
                raise PermissionDenied(
                    "No puedes eliminar tareas de módulos de salones virtuales que no tienes asignados."
                )

            instance.delete()
            return

        raise PermissionDenied("No tienes permisos para eliminar tareas.")


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.select_related(
        "assignment",
        "assignment__weekly_module",
        "assignment__weekly_module__virtual_classroom",
        "student__user",
    ).prefetch_related("files", "precheck").all()

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or (user.role and user.role.code == "admin"):
            return self.queryset

        if user.role and user.role.code == "student" and hasattr(user, "student_profile"):
            return self.queryset.filter(student=user.student_profile)

        if user.role and user.role.code == "teacher" and hasattr(user, "teacher_profile"):
            return self.queryset.filter(
                assignment__weekly_module__virtual_classroom__teacher_assignments__teacher=user.teacher_profile
            ).distinct()

        return Submission.objects.none()

    def get_serializer_class(self):
        if self.action == "create":
            return SubmissionCreateSerializer
        return SubmissionSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
            user = self.request.user

            if not (user.role and user.role.code == "student" and hasattr(user, "student_profile")):
                raise PermissionDenied("Solo los alumnos pueden crear entregas.")

            student = user.student_profile
            assignment = serializer.validated_data["assignment"]

            last_attempt = (
                Submission.objects.filter(assignment=assignment, student=student)
                .aggregate(max_attempt=Max("attempt_number"))["max_attempt"]
                or 0
            )

            serializer.save(
                student=student,
                attempt_number=last_attempt + 1,
            )


class SubmissionFileViewSet(viewsets.ModelViewSet):
    queryset = SubmissionFile.objects.select_related(
        "submission",
        "submission__student__user",
    ).all()
    serializer_class = SubmissionFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or (user.role and user.role.code == "admin"):
            return self.queryset

        if user.role and user.role.code == "student" and hasattr(user, "student_profile"):
            return self.queryset.filter(submission__student=user.student_profile)

        if user.role and user.role.code == "teacher" and hasattr(user, "teacher_profile"):
            return self.queryset.filter(
                submission__assignment__weekly_module__virtual_classroom__teacher_assignments__teacher=user.teacher_profile
            ).distinct()

        return SubmissionFile.objects.none()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        user = self.request.user
        submission = serializer.validated_data.get("submission")

        if not submission:
            raise PermissionDenied("Debes indicar la entrega asociada al archivo.")

        # Alumno: solo puede subir a su propia entrega
        if user.role and user.role.code == "student" and hasattr(user, "student_profile"):
            if submission.student != user.student_profile:
                raise PermissionDenied("No puedes subir archivos a entregas de otro alumno.")

            submission_file = serializer.save()
            self._run_pdf_precheck_if_needed(submission_file)
            return

        # Admin: permitido
        if user.is_superuser or (user.role and user.role.code == "admin"):
            submission_file = serializer.save()
            self._run_pdf_precheck_if_needed(submission_file)
            return

        raise PermissionDenied("No tienes permisos para subir archivos a esta entrega.")

    def _run_pdf_precheck_if_needed(self, submission_file: SubmissionFile):
        file_name = (submission_file.file.name or "").lower()
        mime_type = (submission_file.mime_type or "").lower()

        is_pdf = mime_type == "application/pdf" or file_name.endswith(".pdf")
        is_docx = (
            mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            or file_name.endswith(".docx")
        )

        if not (is_pdf or is_docx):
            return

        result = run_pdf_precheck(submission_file.file.path)
        SubmissionPrecheck.objects.update_or_create(
            submission=submission_file.submission,
            defaults={
                "source_file": submission_file,
                **result,
            },
        )