from rest_framework import serializers

from apps.classrooms.models import ClassroomEnrollment
from .models import GradeRecord, AcademicHistory


class GradeRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.get_full_name", read_only=True)
    classroom_name = serializers.CharField(source="virtual_classroom.name", read_only=True)
    assignment_title = serializers.CharField(source="assignment.title", read_only=True)
    graded_by_name = serializers.CharField(source="graded_by.user.get_full_name", read_only=True)

    class Meta:
        model = GradeRecord
        fields = [
            "id",
            "student",
            "student_name",
            "virtual_classroom",
            "classroom_name",
            "assignment",
            "assignment_title",
            "submission",
            "score",
            "feedback",
            "graded_by",
            "graded_by_name",
            "graded_at",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        student = attrs.get("student", getattr(self.instance, "student", None))
        virtual_classroom = attrs.get("virtual_classroom", getattr(self.instance, "virtual_classroom", None))
        assignment = attrs.get("assignment", getattr(self.instance, "assignment", None))
        submission = attrs.get("submission", getattr(self.instance, "submission", None))
        score = attrs.get("score", getattr(self.instance, "score", None))

        if score is not None:
            if score < 0:
                raise serializers.ValidationError({"score": "La calificación no puede ser negativa."})
            if assignment and score > assignment.max_score:
                raise serializers.ValidationError(
                    {"score": "La calificación no puede ser mayor a la puntuación máxima de la tarea."}
                )

        if assignment and assignment.weekly_module.virtual_classroom_id != virtual_classroom.id:
            raise serializers.ValidationError(
                {"virtual_classroom": "La tarea no pertenece al salón virtual indicado."}
            )

        is_enrolled = ClassroomEnrollment.objects.filter(
            student=student,
            virtual_classroom=virtual_classroom,
        ).exists()
        if not is_enrolled:
            raise serializers.ValidationError(
                {"student": "El alumno no pertenece a este salón virtual."}
            )

        if submission:
            if submission.assignment_id != assignment.id:
                raise serializers.ValidationError(
                    {"submission": "La entrega no corresponde a la tarea indicada."}
                )
            if submission.student_id != student.id:
                raise serializers.ValidationError(
                    {"submission": "La entrega no corresponde al alumno indicado."}
                )

        return attrs


class AcademicHistorySerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.get_full_name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    academic_period_name = serializers.CharField(source="academic_period.name", read_only=True)

    class Meta:
        model = AcademicHistory
        fields = [
            "id",
            "student",
            "student_name",
            "subject",
            "subject_name",
            "academic_period",
            "academic_period_name",
            "final_grade",
            "status",
            "observations",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        final_grade = attrs.get("final_grade", getattr(self.instance, "final_grade", None))

        if final_grade is not None and final_grade < 0:
            raise serializers.ValidationError(
                {"final_grade": "La calificación final no puede ser negativa."}
            )

        return attrs