from django.contrib import admin

from .models import VirtualClassroom, TeacherAssignment, ClassroomEnrollment


@admin.register(VirtualClassroom)
class VirtualClassroomAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "code",
        "name",
        "subject",
        "academic_period",
        "main_teacher",
        "max_students",
        "status",
    )
    search_fields = ("code", "name", "subject__name")
    list_filter = ("status", "academic_period", "subject")


@admin.register(TeacherAssignment)
class TeacherAssignmentAdmin(admin.ModelAdmin):
    list_display = ("id", "teacher", "virtual_classroom", "role_in_class", "assigned_at")
    search_fields = (
        "teacher__user__first_name",
        "teacher__user__last_name",
        "virtual_classroom__name",
        "virtual_classroom__code",
    )
    list_filter = ("role_in_class",)


@admin.register(ClassroomEnrollment)
class ClassroomEnrollmentAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "virtual_classroom", "status", "final_grade", "enrolled_at")
    search_fields = (
        "student__user__first_name",
        "student__user__last_name",
        "student__student_code",
        "virtual_classroom__name",
        "virtual_classroom__code",
    )
    list_filter = ("status",)