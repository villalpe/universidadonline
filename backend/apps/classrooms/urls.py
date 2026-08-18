from rest_framework.routers import DefaultRouter

from .views import (
    VirtualClassroomViewSet,
    TeacherAssignmentViewSet,
    ClassroomEnrollmentViewSet,
)

router = DefaultRouter()
router.register(r"virtual-classrooms", VirtualClassroomViewSet, basename="virtual-classroom")
router.register(r"teacher-assignments", TeacherAssignmentViewSet, basename="teacher-assignment")
router.register(r"classroom-enrollments", ClassroomEnrollmentViewSet, basename="classroom-enrollment")

urlpatterns = router.urls