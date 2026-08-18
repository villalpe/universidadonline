from rest_framework.routers import DefaultRouter

from .views import (
    WeeklyModuleViewSet,
    AssignmentViewSet,
    SubmissionViewSet,
    SubmissionFileViewSet,
)

router = DefaultRouter()
router.register(r"weekly-modules", WeeklyModuleViewSet, basename="weekly-module")
router.register(r"assignments", AssignmentViewSet, basename="assignment")
router.register(r"submissions", SubmissionViewSet, basename="submission")
router.register(r"submission-files", SubmissionFileViewSet, basename="submission-file")

urlpatterns = router.urls