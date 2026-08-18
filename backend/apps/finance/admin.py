from django.contrib import admin

from .models import ChargeConcept, StudentCharge, StudentPayment


@admin.register(ChargeConcept)
class ChargeConceptAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "name", "category", "default_amount", "active")
    search_fields = ("code", "name")
    list_filter = ("category", "active")


@admin.register(StudentCharge)
class StudentChargeAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "reference",
        "student",
        "concept",
        "academic_period",
        "amount",
        "status",
        "due_date",
    )
    search_fields = (
        "reference",
        "student__student_code",
        "student__user__first_name",
        "student__user__last_name",
        "concept__name",
    )
    list_filter = ("status", "concept", "academic_period")


@admin.register(StudentPayment)
class StudentPaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "student",
        "charge",
        "payment_date",
        "amount",
        "method",
        "status",
        "transaction_reference",
    )
    search_fields = (
        "student__student_code",
        "student__user__first_name",
        "student__user__last_name",
        "transaction_reference",
        "charge__reference",
    )
    list_filter = ("method", "status")