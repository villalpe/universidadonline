from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    MeView,
    RoleViewSet,
    UserViewSet,
    StudentProfileViewSet,
    TeacherProfileViewSet,
    MyProfileView,
    MyClassroomsView,
    MyAssignmentsView,
    MySubmissionsView,
    MyGradesView,
    MyAcademicHistoryView,
    TeacherClassroomsView,
    TeacherAssignmentsView,
    TeacherSubmissionsView,
    TeacherGradebookView,
)

router = DefaultRouter()
router.register(r"roles", RoleViewSet, basename="role")
router.register(r"users", UserViewSet, basename="user")
router.register(r"students", StudentProfileViewSet, basename="student")
router.register(r"teachers", TeacherProfileViewSet, basename="teacher")

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),

    # Student endpoints
    path("my/profile/", MyProfileView.as_view(), name="my-profile"),
    path("my/classrooms/", MyClassroomsView.as_view(), name="my-classrooms"),
    path("my/assignments/", MyAssignmentsView.as_view(), name="my-assignments"),
    path("my/submissions/", MySubmissionsView.as_view(), name="my-submissions"),
    path("my/grades/", MyGradesView.as_view(), name="my-grades"),
    path("my/academic-history/", MyAcademicHistoryView.as_view(), name="my-academic-history"),

    # Teacher endpoints
    path("teacher/classrooms/", TeacherClassroomsView.as_view(), name="teacher-classrooms"),
    path("teacher/assignments/", TeacherAssignmentsView.as_view(), name="teacher-assignments"),
    path("teacher/submissions/", TeacherSubmissionsView.as_view(), name="teacher-submissions"),
    path("teacher/gradebook/", TeacherGradebookView.as_view(), name="teacher-gradebook"),

    path("", include(router.urls)),
]