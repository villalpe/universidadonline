from django.db import models

from apps.common.models import TimeStampedModel


def submission_file_upload_path(instance, filename):
    assignment_id = instance.submission.assignment_id
    student_id = instance.submission.student_id
    return f"assignments/submissions/assignment_{assignment_id}/student_{student_id}/{filename}"


class WeeklyModule(TimeStampedModel):
    virtual_classroom = models.ForeignKey(
        "classrooms.VirtualClassroom",
        on_delete=models.CASCADE,
        related_name="weekly_modules",
    )
    week_number = models.PositiveIntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # NUEVO: contenido multimedia para clase
    video_file = models.FileField(
        upload_to="classrooms/modules/videos/",
        null=True,
        blank=True
    )
    video_url = models.URLField(
        max_length=500,
        null=True,
        blank=True
    )

    start_date = models.DateField()
    end_date = models.DateField()
    is_published = models.BooleanField(default=False)    

    class Meta:
        db_table = "weekly_modules"
        verbose_name = "Módulo semanal"
        verbose_name_plural = "Módulos semanales"
        ordering = ["virtual_classroom", "week_number"]
        unique_together = ("virtual_classroom", "week_number")

    def __str__(self):
        return f"{self.virtual_classroom} - Semana {self.week_number}"


class Assignment(TimeStampedModel):
    weekly_module = models.ForeignKey(
        WeeklyModule,
        on_delete=models.CASCADE,
        related_name="assignments",
    )
    title = models.CharField(max_length=255)
    instructions = models.TextField()
    due_date = models.DateTimeField()
    max_score = models.DecimalField(max_digits=6, decimal_places=2, default=100.00)
    allow_text_submission = models.BooleanField(default=True)
    is_published = models.BooleanField(default=False)

    class Meta:
        db_table = "assignments"
        verbose_name = "Tarea"
        verbose_name_plural = "Tareas"
        ordering = ["due_date", "id"]

    def __str__(self):
        return self.title


class Submission(TimeStampedModel):
    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Entregada"
        LATE = "late", "Tardía"
        REVIEWED = "reviewed", "Revisada"
        GRADED = "graded", "Calificada"

    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name="submissions",
    )
    student = models.ForeignKey(
        "accounts.StudentProfile",
        on_delete=models.PROTECT,
        related_name="submissions",
    )
    text_submission = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUBMITTED,
    )
    attempt_number = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = "submissions"
        verbose_name = "Entrega"
        verbose_name_plural = "Entregas"
        ordering = ["-submitted_at"]
        unique_together = ("assignment", "student", "attempt_number")

    def __str__(self):
        return f"{self.student} - {self.assignment}"


class SubmissionFile(TimeStampedModel):
    submission = models.ForeignKey(
        Submission,
        on_delete=models.CASCADE,
        related_name="files",
    )
    file = models.FileField(upload_to=submission_file_upload_path)
    original_name = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100, blank=True)
    size = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "submission_files"
        verbose_name = "Archivo de entrega"
        verbose_name_plural = "Archivos de entrega"

    def __str__(self):
        return self.original_name

class SubmissionPrecheck(TimeStampedModel):
    submission = models.OneToOneField(
        Submission,
        on_delete=models.CASCADE,
        related_name="precheck",
    )
    source_file = models.ForeignKey(
        SubmissionFile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="prechecks",
    )
    has_title = models.BooleanField(default=False)
    has_conclusion = models.BooleanField(default=False)
    has_bibliography = models.BooleanField(default=False)
    paragraph_count = models.PositiveIntegerField(default=0)
    word_count = models.PositiveIntegerField(default=0)
    score = models.PositiveIntegerField(default=0)
    passed = models.BooleanField(default=False)
    feedback = models.TextField(blank=True)

    class Meta:
        db_table = "submission_prechecks"
        verbose_name = "Prevalidación de entrega"
        verbose_name_plural = "Prevalidaciones de entregas"

    def __str__(self):
        return f"Precheck {self.submission_id} - {'OK' if self.passed else 'Pendiente'}"        