from django.db import models

from apps.common.models import TimeStampedModel


class VirtualClassroom(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Borrador"
        ACTIVE = "active", "Activo"
        CLOSED = "closed", "Cerrado"
        CANCELLED = "cancelled", "Cancelado"

    code = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=255)
    subject = models.ForeignKey(
        "academics.Subject",
        on_delete=models.PROTECT,
        related_name="virtual_classrooms",
    )
    academic_period = models.ForeignKey(
        "academics.AcademicPeriod",
        on_delete=models.PROTECT,
        related_name="virtual_classrooms",
    )
    study_plan = models.ForeignKey(
        "academics.StudyPlan",
        on_delete=models.PROTECT,
        related_name="virtual_classrooms",
        null=True,
        blank=True,
    )
    main_teacher = models.ForeignKey(
        "accounts.TeacherProfile",
        on_delete=models.PROTECT,
        related_name="main_classrooms",
        null=True,
        blank=True,
    )
    max_students = models.PositiveIntegerField(default=30)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    description = models.TextField(blank=True)

    class Meta:
        db_table = "virtual_classrooms"
        verbose_name = "Salón virtual"
        verbose_name_plural = "Salones virtuales"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.code} - {self.name}"


class TeacherAssignment(TimeStampedModel):
    class RoleInClass(models.TextChoices):
        MAIN = "main", "Profesor titular"
        ASSISTANT = "assistant", "Asistente"
        REVIEWER = "reviewer", "Revisor"

    teacher = models.ForeignKey(
        "accounts.TeacherProfile",
        on_delete=models.PROTECT,
        related_name="classroom_assignments",
    )
    virtual_classroom = models.ForeignKey(
        VirtualClassroom,
        on_delete=models.CASCADE,
        related_name="teacher_assignments",
    )
    role_in_class = models.CharField(
        max_length=20,
        choices=RoleInClass.choices,
        default=RoleInClass.MAIN,
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "teacher_assignments"
        verbose_name = "Asignación de profesor"
        verbose_name_plural = "Asignaciones de profesores"
        unique_together = ("teacher", "virtual_classroom")

    def __str__(self):
        return f"{self.teacher} -> {self.virtual_classroom}"


class ClassroomEnrollment(TimeStampedModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Activo"
        DROPPED = "dropped", "Baja"
        COMPLETED = "completed", "Completado"

    student = models.ForeignKey(
        "accounts.StudentProfile",
        on_delete=models.PROTECT,
        related_name="classroom_enrollments",
    )
    virtual_classroom = models.ForeignKey(
        VirtualClassroom,
        on_delete=models.CASCADE,
        related_name="student_enrollments",
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    final_grade = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
    )

    class Meta:
        db_table = "classroom_enrollments"
        verbose_name = "Inscripción a salón virtual"
        verbose_name_plural = "Inscripciones a salones virtuales"
        unique_together = ("student", "virtual_classroom")

    def __str__(self):
        return f"{self.student} -> {self.virtual_classroom}"