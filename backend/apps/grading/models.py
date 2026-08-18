from django.db import models

from apps.common.models import TimeStampedModel


class GradeRecord(TimeStampedModel):
    student = models.ForeignKey(
        "accounts.StudentProfile",
        on_delete=models.PROTECT,
        related_name="grade_records",
    )
    virtual_classroom = models.ForeignKey(
        "classrooms.VirtualClassroom",
        on_delete=models.PROTECT,
        related_name="grade_records",
    )
    assignment = models.ForeignKey(
        "assignments.Assignment",
        on_delete=models.PROTECT,
        related_name="grade_records",
    )
    submission = models.OneToOneField(
        "assignments.Submission",
        on_delete=models.PROTECT,
        related_name="grade_record",
        null=True,
        blank=True,
    )
    score = models.DecimalField(max_digits=6, decimal_places=2)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(
        "accounts.TeacherProfile",
        on_delete=models.PROTECT,
        related_name="graded_records",
        null=True,
        blank=True,
    )
    graded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "grade_records"
        verbose_name = "Registro de calificación"
        verbose_name_plural = "Registros de calificaciones"
        ordering = ["-graded_at", "-created_at"]
        unique_together = ("student", "virtual_classroom", "assignment")

    def __str__(self):
        return f"{self.student} - {self.assignment} - {self.score}"


class AcademicHistory(TimeStampedModel):
    class Status(models.TextChoices):
        IN_PROGRESS = "in_progress", "En progreso"
        PASSED = "passed", "Aprobada"
        FAILED = "failed", "Reprobada"
        DROPPED = "dropped", "Baja"

    student = models.ForeignKey(
        "accounts.StudentProfile",
        on_delete=models.PROTECT,
        related_name="academic_history",
    )
    subject = models.ForeignKey(
        "academics.Subject",
        on_delete=models.PROTECT,
        related_name="academic_history",
    )
    academic_period = models.ForeignKey(
        "academics.AcademicPeriod",
        on_delete=models.PROTECT,
        related_name="academic_history",
    )
    final_grade = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.IN_PROGRESS,
    )
    observations = models.TextField(blank=True)

    class Meta:
        db_table = "academic_history"
        verbose_name = "Historial académico"
        verbose_name_plural = "Historial académico"
        ordering = ["-created_at"]
        unique_together = ("student", "subject", "academic_period")

    def __str__(self):
        return f"{self.student} - {self.subject} - {self.academic_period}"