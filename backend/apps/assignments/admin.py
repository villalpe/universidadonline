from django.contrib import admin

from .models import WeeklyModule, Assignment, Submission, SubmissionFile


@admin.register(WeeklyModule)
class WeeklyModuleAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "virtual_classroom",
        "week_number",
        "title",
        "start_date",
        "end_date",
        "is_published",
    )
    search_fields = ("title", "virtual_classroom__name", "virtual_classroom__code")
    list_filter = ("is_published", "virtual_classroom")


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "weekly_module",
        "due_date",
        "max_score",
        "allow_text_submission",
        "is_published",
    )
    search_fields = ("title", "weekly_module__title", "weekly_module__virtual_classroom__name")
    list_filter = ("is_published", "allow_text_submission")


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "assignment",
        "student",
        "submitted_at",
        "status",
        "attempt_number",
    )
    search_fields = (
        "assignment__title",
        "student__student_code",
        "student__user__first_name",
        "student__user__last_name",
    )
    list_filter = ("status",)


@admin.register(SubmissionFile)
class SubmissionFileAdmin(admin.ModelAdmin):
    list_display = ("id", "submission", "original_name", "mime_type", "size")
    search_fields = ("original_name", "submission__assignment__title")