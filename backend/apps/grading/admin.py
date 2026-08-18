from django.contrib import admin

from .models import GradeRecord, AcademicHistory


@admin.register(GradeRecord)
class GradeRecordAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "student",
        "virtual_classroom",
        "assignment",
        "score",
        "graded_by",
        "graded_at",
    )
    search_fields = (
        "student__student_code",
        "student__user__first_name",
        "student__user__last_name",
        "assignment__title",
        "virtual_classroom__name",
    )
    list_filter = ("virtual_classroom", "graded_by")


@admin.register(AcademicHistory)
class AcademicHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "student",
        "subject",
        "academic_period",
        "final_grade",
        "status",
    )
    search_fields = (
        "student__student_code",
        "student__user__first_name",
        "student__user__last_name",
        "subject__name",
        "academic_period__name",
    )
    list_filter = ("status", "academic_period", "subject")