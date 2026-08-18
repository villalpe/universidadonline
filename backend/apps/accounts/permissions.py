from rest_framework.permissions import BasePermission


class IsAdminUserRole(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_superuser
                or (request.user.role and request.user.role.code == "admin")
            )
        )


class IsTeacherUserRole(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role
            and request.user.role.code == "teacher"
        )


class IsStudentUserRole(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role
            and request.user.role.code == "student"
        )