from rest_framework import serializers

from .models import VirtualClassroom, TeacherAssignment, ClassroomEnrollment


class VirtualClassroomSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    academic_period_name = serializers.CharField(source="academic_period.name", read_only=True)
    main_teacher_name = serializers.CharField(source="main_teacher.user.get_full_name", read_only=True)

    class Meta:
        model = VirtualClassroom
        fields = [
            "id",
            "code",
            "name",
            "subject",
            "subject_name",
            "academic_period",
            "academic_period_name",
            "study_plan",
            "main_teacher",
            "main_teacher_name",
            "max_students",
            "start_date",
            "end_date",
            "status",
            "description",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))
        max_students = attrs.get("max_students", getattr(self.instance, "max_students", None))

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError(
                {"end_date": "La fecha de fin no puede ser menor que la fecha de inicio."}
            )

        if max_students is not None and max_students <= 0:
            raise serializers.ValidationError(
                {"max_students": "El cupo máximo debe ser mayor a cero."}
            )

        return attrs


class TeacherAssignmentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source="teacher.user.get_full_name", read_only=True)
    classroom_name = serializers.CharField(source="virtual_classroom.name", read_only=True)

    class Meta:
        model = TeacherAssignment
        fields = [
            "id",
            "teacher",
            "teacher_name",
            "virtual_classroom",
            "classroom_name",
            "role_in_class",
            "assigned_at",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        teacher = attrs.get("teacher", getattr(self.instance, "teacher", None))
        virtual_classroom = attrs.get("virtual_classroom", getattr(self.instance, "virtual_classroom", None))

        existing = TeacherAssignment.objects.filter(
            teacher=teacher,
            virtual_classroom=virtual_classroom,
        )
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)

        if existing.exists():
            raise serializers.ValidationError(
                "El profesor ya está asignado a este salón virtual."
            )

        return attrs


class ClassroomEnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.get_full_name", read_only=True)
    student_code = serializers.CharField(source="student.student_code", read_only=True)
    classroom_name = serializers.CharField(source="virtual_classroom.name", read_only=True)

    class Meta:
        model = ClassroomEnrollment
        fields = [
            "id",
            "student",
            "student_name",
            "student_code",
            "virtual_classroom",
            "classroom_name",
            "enrolled_at",
            "status",
            "final_grade",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        student = attrs.get("student", getattr(self.instance, "student", None))
        virtual_classroom = attrs.get("virtual_classroom", getattr(self.instance, "virtual_classroom", None))

        existing = ClassroomEnrollment.objects.filter(
            student=student,
            virtual_classroom=virtual_classroom,
        )
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)

        if existing.exists():
            raise serializers.ValidationError(
                "El alumno ya está inscrito en este salón virtual."
            )

        if virtual_classroom.status in [
            VirtualClassroom.Status.CLOSED,
            VirtualClassroom.Status.CANCELLED,
        ]:
            raise serializers.ValidationError(
                {"virtual_classroom": "No se puede inscribir alumnos en un salón cerrado o cancelado."}
            )

        active_enrollments = ClassroomEnrollment.objects.filter(
            virtual_classroom=virtual_classroom,
            status=ClassroomEnrollment.Status.ACTIVE,
        )
        if self.instance and self.instance.status == ClassroomEnrollment.Status.ACTIVE:
            active_enrollments = active_enrollments.exclude(pk=self.instance.pk)

        if active_enrollments.count() >= virtual_classroom.max_students:
            raise serializers.ValidationError(
                {"virtual_classroom": "El salón virtual ya alcanzó su cupo máximo."}
            )

        if student.study_plan and virtual_classroom.study_plan:
            if student.study_plan_id != virtual_classroom.study_plan_id:
                raise serializers.ValidationError(
                    {"student": "El alumno no pertenece al mismo plan de estudios del salón virtual."}
                )

        return attrs