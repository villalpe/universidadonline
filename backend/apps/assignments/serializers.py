from rest_framework import serializers

from apps.classrooms.models import ClassroomEnrollment
from .models import WeeklyModule, Assignment, Submission, SubmissionFile, SubmissionPrecheck


class WeeklyModuleSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source="virtual_classroom.name", read_only=True)
    video_file_url = serializers.SerializerMethodField()

    class Meta:
        model = WeeklyModule
        fields = [
            "id",
            "virtual_classroom",
            "classroom_name",
            "week_number",
            "title",
            "description",
            "video_file",
            "video_url",
            "video_file_url",
            "start_date",
            "end_date",
            "is_published",
            "created_at",
            "updated_at",
        ]

    def get_video_file_url(self, obj):
        request = self.context.get("request")
        if obj.video_file and request:
            return request.build_absolute_uri(obj.video_file.url)
        if obj.video_file:
            return obj.video_file.url
        return None

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError(
                {"end_date": "La fecha de fin no puede ser menor que la fecha de inicio."}
            )

        return attrs


class AssignmentSerializer(serializers.ModelSerializer):
    weekly_module_title = serializers.CharField(source="weekly_module.title", read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id",
            "weekly_module",
            "weekly_module_title",
            "title",
            "instructions",
            "due_date",
            "max_score",
            "allow_text_submission",
            "is_published",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        weekly_module = attrs.get("weekly_module", getattr(self.instance, "weekly_module", None))
        due_date = attrs.get("due_date", getattr(self.instance, "due_date", None))
        max_score = attrs.get("max_score", getattr(self.instance, "max_score", None))

        if max_score is not None and max_score <= 0:
            raise serializers.ValidationError(
                {"max_score": "La puntuación máxima debe ser mayor a cero."}
            )

        if weekly_module and due_date:
            due_date_only = due_date.date()
            if due_date_only < weekly_module.start_date or due_date_only > weekly_module.end_date:
                raise serializers.ValidationError(
                    {"due_date": "La fecha límite debe estar dentro del rango del módulo semanal."}
                )

        return attrs


class SubmissionFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = SubmissionFile
        fields = [
            "id",
            "submission",
            "file",
            "file_url",
            "original_name",
            "mime_type",
            "size",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "file_url",
            "mime_type",
            "size",
            "created_at",
            "updated_at",
        ]

    def validate_file(self, value):
        name = (getattr(value, "name", "") or "").lower()
        allowed_ext = (".pdf", ".docx")
        if not name.endswith(allowed_ext):
            raise serializers.ValidationError("Solo se permiten archivos PDF o DOCX.")
        return value

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        if obj.file:
            return obj.file.url
        return None


class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    assignment_title = serializers.CharField(source="assignment.title", read_only=True)
    files = SubmissionFileSerializer(many=True, read_only=True)
    precheck = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = [
            "id",
            "assignment",
            "assignment_title",
            "student",
            "student_name",
            "text_submission",
            "submitted_at",
            "status",
            "attempt_number",
            "files",
            "precheck",
            "created_at",
            "updated_at",
        ]

    def get_student_name(self, obj):
        if hasattr(obj.student, "user") and obj.student.user:
            return obj.student.user.get_full_name() or obj.student.user.username
        return ""

    def get_precheck(self, obj):
        pre = getattr(obj, "precheck", None)
        if not pre:
            return None

        return {
            "has_title": pre.has_title,
            "has_conclusion": pre.has_conclusion,
            "has_bibliography": pre.has_bibliography,
            "paragraph_count": pre.paragraph_count,
            "word_count": pre.word_count,
            "score": pre.score,
            "passed": pre.passed,
            "feedback": pre.feedback,
        }


class SubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = [
            "id",
            "assignment",
            "text_submission",
            "status",
            # "attempt_number",
        ]

    def validate(self, attrs):
        request = self.context.get("request")
        assignment = attrs.get("assignment")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Usuario no autenticado.")

        user = request.user
        if not hasattr(user, "student_profile"):
            raise serializers.ValidationError("Solo un alumno puede crear entregas.")

        student_profile = user.student_profile
        classroom = assignment.weekly_module.virtual_classroom

        is_enrolled = ClassroomEnrollment.objects.filter(
            student=student_profile,
            virtual_classroom=classroom,
            status=ClassroomEnrollment.Status.ACTIVE,
        ).exists()

        if not is_enrolled:
            raise serializers.ValidationError(
                {"assignment": "El alumno no está inscrito activamente en el salón virtual de esta tarea."}
            )

        if not assignment.is_published:
            raise serializers.ValidationError(
                {"assignment": "No se puede entregar una tarea no publicada."}
            )

        if not assignment.allow_text_submission and attrs.get("text_submission"):
            raise serializers.ValidationError(
                {"text_submission": "Esta tarea no permite entregas en texto."}
            )

        return attrs