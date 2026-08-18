from django.contrib import admin

from .models import Career, StudyPlan, Subject, StudyPlanSubject, AcademicPeriod


@admin.register(Career)
class CareerAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "name", "duration_months", "active")
    search_fields = ("code", "name")
    list_filter = ("active",)


@admin.register(StudyPlan)
class StudyPlanAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "name", "career", "version", "active")
    search_fields = ("code", "name", "career__name")
    list_filter = ("active", "career")


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "name", "credits", "weekly_hours", "active")
    search_fields = ("code", "name")
    list_filter = ("active",)


@admin.register(StudyPlanSubject)
class StudyPlanSubjectAdmin(admin.ModelAdmin):
    list_display = ("id", "study_plan", "subject", "cycle_number", "order", "mandatory", "passing_grade")
    search_fields = ("study_plan__name", "subject__name")
    list_filter = ("mandatory", "cycle_number")


@admin.register(AcademicPeriod)
class AcademicPeriodAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "name", "start_date", "end_date", "status")
    search_fields = ("code", "name")
    list_filter = ("status",)