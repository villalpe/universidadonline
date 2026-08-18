from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Role, User, StudentProfile, TeacherProfile


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "name")
    search_fields = ("code", "name")


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("id", "email", "username", "first_name", "last_name", "role", "is_active")
    search_fields = ("email", "username", "first_name", "last_name")
    list_filter = ("role", "is_active", "is_staff", "is_superuser")

    fieldsets = BaseUserAdmin.fieldsets + (
        ("Información adicional", {"fields": ("phone", "role", "created_at", "updated_at")}),
    )
    readonly_fields = ("created_at", "updated_at")


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "student_code", "user", "career", "study_plan", "status")
    search_fields = ("student_code", "user__email", "user__first_name", "user__last_name")
    list_filter = ("status", "career")


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "employee_code", "user", "specialty")
    search_fields = ("employee_code", "user__email", "user__first_name", "user__last_name")