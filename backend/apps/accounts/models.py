from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.common.models import TimeStampedModel
from .managers import UserManager


class Role(TimeStampedModel):
    class Codes(models.TextChoices):
        ADMIN = "admin", "Administrador"
        TEACHER = "teacher", "Profesor"
        STUDENT = "student", "Alumno"

    code = models.CharField(max_length=30, unique=True, choices=Codes.choices)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "roles"
        verbose_name = "Rol"
        verbose_name_plural = "Roles"

    def __str__(self):
        return self.name


class User(AbstractUser, TimeStampedModel):
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        related_name="users",
        null=True,
        blank=True,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        db_table = "users"
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self):
        return self.get_full_name() or self.email


class StudentProfile(TimeStampedModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Activo"
        INACTIVE = "inactive", "Inactivo"
        GRADUATED = "graduated", "Graduado"
        SUSPENDED = "suspended", "Suspendido"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )
    student_code = models.CharField(max_length=50, unique=True)
    enrollment_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    birth_date = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    career = models.ForeignKey(
        "academics.Career",
        on_delete=models.PROTECT,
        related_name="students",
        null=True,
        blank=True,
    )
    study_plan = models.ForeignKey(
        "academics.StudyPlan",
        on_delete=models.PROTECT,
        related_name="students",
        null=True,
        blank=True,
    )

    class Meta:
        db_table = "student_profiles"
        verbose_name = "Perfil de alumno"
        verbose_name_plural = "Perfiles de alumnos"

    def __str__(self):
        return f"{self.student_code} - {self.user}"


class TeacherProfile(TimeStampedModel):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="teacher_profile",
    )
    employee_code = models.CharField(max_length=50, unique=True)
    specialty = models.CharField(max_length=255, blank=True)
    hire_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "teacher_profiles"
        verbose_name = "Perfil de profesor"
        verbose_name_plural = "Perfiles de profesores"

    def __str__(self):
        return f"{self.employee_code} - {self.user}"