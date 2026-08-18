from rest_framework.routers import DefaultRouter

from .views import GradeRecordViewSet, AcademicHistoryViewSet

router = DefaultRouter()
router.register(r"grade-records", GradeRecordViewSet, basename="grade-record")
router.register(r"academic-history", AcademicHistoryViewSet, basename="academic-history")

urlpatterns = router.urls