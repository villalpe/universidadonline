from rest_framework.routers import DefaultRouter

from .views import (
    CareerViewSet,
    StudyPlanViewSet,
    SubjectViewSet,
    StudyPlanSubjectViewSet,
    AcademicPeriodViewSet,
)

router = DefaultRouter()
router.register(r"careers", CareerViewSet, basename="career")
router.register(r"study-plans", StudyPlanViewSet, basename="study-plan")
router.register(r"subjects", SubjectViewSet, basename="subject")
router.register(r"study-plan-subjects", StudyPlanSubjectViewSet, basename="study-plan-subject")
router.register(r"academic-periods", AcademicPeriodViewSet, basename="academic-period")

urlpatterns = router.urls