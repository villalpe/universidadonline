from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated


from apps.classrooms.models import VirtualClassroom
from apps.assignments.models import Assignment, Submission
from apps.grading.models import GradeRecord, AcademicHistory
from apps.assignments.serializers import SubmissionSerializer
from apps.grading.serializers import GradeRecordSerializer
from .models import Role, StudentProfile, TeacherProfile
from .permissions import IsAdminUserRole, IsTeacherUserRole, IsStudentUserRole
from .serializers import (
    RoleSerializer,
    UserSerializer,
    UserCreateSerializer,
    StudentProfileSerializer,
    StudentProfileCreateSerializer,
    TeacherProfileSerializer,
    TeacherProfileCreateSerializer,
    MyStudentProfileSerializer,
    MyTeacherProfileSerializer,
    MyClassroomSerializer,
    MyAssignmentSerializer,
    MySubmissionSerializer,
    MyGradeRecordSerializer,
    MyAcademicHistorySerializer,
)

User = get_user_model()


class MeView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related("role").all()
    permission_classes = [IsAdminUserRole]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer


class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.select_related(
        "user", "career", "study_plan"
    ).all()
    permission_classes = [IsAdminUserRole]

    def get_serializer_class(self):
        if self.action == "create":
            return StudentProfileCreateSerializer
        return StudentProfileSerializer


class TeacherProfileViewSet(viewsets.ModelViewSet):
    queryset = TeacherProfile.objects.select_related("user").all()
    permission_classes = [IsAdminUserRole]

    def get_serializer_class(self):
        if self.action == "create":
            return TeacherProfileCreateSerializer
        return TeacherProfileSerializer
    
class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role and user.role.code == "student" and hasattr(user, "student_profile"):
            serializer = MyStudentProfileSerializer(user.student_profile)
            return Response(serializer.data)

        if user.role and user.role.code == "teacher" and hasattr(user, "teacher_profile"):
            serializer = MyTeacherProfileSerializer(user.teacher_profile)
            return Response(serializer.data)

        serializer = UserSerializer(user)
        return Response(serializer.data)


class MyClassroomsView(APIView):
    permission_classes = [IsAuthenticated, IsStudentUserRole]

    def get(self, request):
        student_profile = request.user.student_profile
        classrooms = VirtualClassroom.objects.filter(
            student_enrollments__student=student_profile
        ).select_related(
            "subject",
            "academic_period",
            "study_plan",
            "main_teacher__user",
        ).distinct()

        serializer = MyClassroomSerializer(classrooms, many=True)
        return Response(serializer.data)


class MyAssignmentsView(APIView):
    permission_classes = [IsAuthenticated, IsStudentUserRole]

    def get(self, request):
        student_profile = request.user.student_profile
        assignments = Assignment.objects.filter(
            weekly_module__virtual_classroom__student_enrollments__student=student_profile,
            is_published=True,
        ).select_related(
            "weekly_module",
            "weekly_module__virtual_classroom",
        ).distinct()

        serializer = MyAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)


class MySubmissionsView(APIView):
    permission_classes = [IsAuthenticated, IsStudentUserRole]

    def get(self, request):
        student_profile = request.user.student_profile
        submissions = Submission.objects.filter(
            student=student_profile
        ).select_related(
            "assignment"
        ).prefetch_related("files")

        serializer = MySubmissionSerializer(submissions, many=True)
        return Response(serializer.data)


class MyGradesView(APIView):
    permission_classes = [IsAuthenticated, IsStudentUserRole]

    def get(self, request):
        student_profile = request.user.student_profile
        grades = GradeRecord.objects.filter(
            student=student_profile
        ).select_related(
            "assignment",
            "virtual_classroom",
            "graded_by__user",
        )

        serializer = MyGradeRecordSerializer(grades, many=True)
        return Response(serializer.data)


class MyAcademicHistoryView(APIView):
    permission_classes = [IsAuthenticated, IsStudentUserRole]

    def get(self, request):
        student_profile = request.user.student_profile
        history = AcademicHistory.objects.filter(
            student=student_profile
        ).select_related(
            "subject",
            "academic_period",
        )

        serializer = MyAcademicHistorySerializer(history, many=True)
        return Response(serializer.data)


class TeacherClassroomsView(APIView):
    permission_classes = [IsAuthenticated, IsTeacherUserRole]

    def get(self, request):
        teacher_profile = request.user.teacher_profile
        classrooms = VirtualClassroom.objects.filter(
            teacher_assignments__teacher=teacher_profile
        ).select_related(
            "subject",
            "academic_period",
            "study_plan",
            "main_teacher__user",
        ).distinct()

        serializer = MyClassroomSerializer(classrooms, many=True)
        return Response(serializer.data)


class TeacherAssignmentsView(APIView):
    permission_classes = [IsAuthenticated, IsTeacherUserRole]

    def get(self, request):
        teacher_profile = request.user.teacher_profile
        assignments = Assignment.objects.filter(
            weekly_module__virtual_classroom__teacher_assignments__teacher=teacher_profile
        ).select_related(
            "weekly_module",
            "weekly_module__virtual_classroom",
        ).distinct()

        serializer = MyAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)


class TeacherSubmissionsView(APIView):
    permission_classes = [IsAuthenticated, IsTeacherUserRole]

    def get(self, request):
        teacher_profile = request.user.teacher_profile
        submissions = Submission.objects.filter(
            assignment__weekly_module__virtual_classroom__teacher_assignments__teacher=teacher_profile
        ).select_related(
            "assignment",
            "student__user",
        ).prefetch_related("files").distinct()

        serializer = SubmissionSerializer(submissions, many=True, context={"request": request})
        return Response(serializer.data)


class TeacherGradebookView(APIView):
    permission_classes = [IsAuthenticated, IsTeacherUserRole]

    def get(self, request):
        teacher_profile = request.user.teacher_profile
        grades = GradeRecord.objects.filter(
            virtual_classroom__teacher_assignments__teacher=teacher_profile
        ).select_related(
            "student__user",
            "assignment",
            "virtual_classroom",
            "graded_by__user",
        ).distinct()

        serializer = GradeRecordSerializer(grades, many=True)
        return Response(serializer.data)    