from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ChargeConceptViewSet,
    StudentChargeViewSet,
    StudentPaymentViewSet,
    MyStatementView,
)

router = DefaultRouter()
router.register(r"finance/concepts", ChargeConceptViewSet, basename="finance-concept")
router.register(r"finance/charges", StudentChargeViewSet, basename="finance-charge")
router.register(r"finance/payments", StudentPaymentViewSet, basename="finance-payment")

urlpatterns = [
    path("auth/my/statement/", MyStatementView.as_view(), name="my-statement"),
    path("", include(router.urls)),
]