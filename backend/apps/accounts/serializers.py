from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Role, StudentProfile, TeacherProfile
from apps.classrooms.models import VirtualClassroom, ClassroomEnrollment
from apps.assignments.models import Assignment, Submission
from apps.grading.models import GradeRecord, AcademicHistory

User = get_user_model()


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "code", "name", "description"]


class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "phone",
            "role",
            "is_active",
            "created_at",
            "updated_at",
        ]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        source="role",
    )

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "password",
            "first_name",
            "last_name",
            "phone",
            "role_id",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        return user


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "student_code",
            "career",
            "study_plan",
            "enrollment_date",
            "status",
            "birth_date",
            "address",
            "created_at",
            "updated_at",
        ]


class StudentProfileCreateSerializer(serializers.ModelSerializer):
    user = UserCreateSerializer()

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "student_code",
            "career",
            "study_plan",
            "enrollment_date",
            "status",
            "birth_date",
            "address",
        ]

    def validate(self, attrs):
        user_data = attrs.get("user", {})
        role = user_data.get("role")

        if not role or role.code != "student":
            raise serializers.ValidationError(
                {"user": "El usuario para un alumno debe tener rol 'student'."}
            )
        return attrs

    def create(self, validated_data):
        user_data = validated_data.pop("user")
        password = user_data.pop("password")
        user = User.objects.create_user(password=password, **user_data)
        student_profile = StudentProfile.objects.create(user=user, **validated_data)
        return student_profile


class TeacherProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TeacherProfile
        fields = [
            "id",
            "user",
            "employee_code",
            "specialty",
            "hire_date",
            "created_at",
            "updated_at",
        ]


class TeacherProfileCreateSerializer(serializers.ModelSerializer):
    user = UserCreateSerializer()

    class Meta:
        model = TeacherProfile
        fields = [
            "id",
            "user",
            "employee_code",
            "specialty",
            "hire_date",
        ]

    def validate(self, attrs):
        user_data = attrs.get("user", {})
        role = user_data.get("role")

        if not role or role.code != "teacher":
            raise serializers.ValidationError(
                {"user": "El usuario para un profesor debe tener rol 'teacher'."}
            )
        return attrs

    def create(self, validated_data):
        user_data = validated_data.pop("user")
        password = user_data.pop("password")
        user = User.objects.create_user(password=password, **user_data)
        teacher_profile = TeacherProfile.objects.create(user=user, **validated_data)
        return teacher_profile
    
    
class MyStudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    career_name = serializers.CharField(source="career.name", read_only=True)
    study_plan_name = serializers.CharField(source="study_plan.name", read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "student_code",
            "career",
            "career_name",
            "study_plan",
            "study_plan_name",
            "enrollment_date",
            "status",
            "birth_date",
            "address",
            "created_at",
            "updated_at",
        ]


class MyTeacherProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TeacherProfile
        fields = [
            "id",
            "user",
            "employee_code",
            "specialty",
            "hire_date",
            "created_at",
            "updated_at",
        ]


class MyClassroomSerializer(serializers.ModelSerializer):
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
        ]


class MyAssignmentSerializer(serializers.ModelSerializer):
    weekly_module_title = serializers.CharField(source="weekly_module.title", read_only=True)
    classroom_name = serializers.CharField(source="weekly_module.virtual_classroom.name", read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id",
            "weekly_module",
            "weekly_module_title",
            "classroom_name",
            "title",
            "instructions",
            "due_date",
            "max_score",
            "allow_text_submission",
            "is_published",
        ]


class MySubmissionSerializer(serializers.ModelSerializer):
    assignment_title = serializers.CharField(source="assignment.title", read_only=True)
    files_count = serializers.IntegerField(source="files.count", read_only=True)

    class Meta:
        model = Submission
        fields = [
            "id",
            "assignment",
            "assignment_title",
            "text_submission",
            "submitted_at",
            "status",
            "attempt_number",
            "files_count",
            "created_at",
            "updated_at",
        ]


class MyGradeRecordSerializer(serializers.ModelSerializer):
    assignment_title = serializers.CharField(source="assignment.title", read_only=True)
    classroom_name = serializers.CharField(source="virtual_classroom.name", read_only=True)
    graded_by_name = serializers.CharField(source="graded_by.user.get_full_name", read_only=True)

    class Meta:
        model = GradeRecord
        fields = [
            "id",
            "assignment",
            "assignment_title",
            "virtual_classroom",
            "classroom_name",
            "submission",
            "score",
            "feedback",
            "graded_by",
            "graded_by_name",
            "graded_at",
        ]


class MyAcademicHistorySerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    academic_period_name = serializers.CharField(source="academic_period.name", read_only=True)

    class Meta:
        model = AcademicHistory
        fields = [
            "id",
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