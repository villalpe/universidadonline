from django.db import models

from apps.common.models import TimeStampedModel


class Career(TimeStampedModel):
    code = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration_months = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)

    class Meta:
        db_table = "careers"
        verbose_name = "Carrera"
        verbose_name_plural = "Carreras"
        ordering = ["name"]

    def __str__(self):
        return self.name


class StudyPlan(TimeStampedModel):
    career = models.ForeignKey(
        Career,
        on_delete=models.PROTECT,
        related_name="study_plans",
    )
    code = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=255)
    version = models.CharField(max_length=50)
    effective_date = models.DateField()
    active = models.BooleanField(default=True)

    class Meta:
        db_table = "study_plans"
        verbose_name = "Plan de estudios"
        verbose_name_plural = "Planes de estudio"
        ordering = ["career__name", "name"]

    def __str__(self):
        return f"{self.career.name} - {self.name} ({self.version})"


class Subject(TimeStampedModel):
    code = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    credits = models.PositiveIntegerField(default=0)
    weekly_hours = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)

    class Meta:
        db_table = "subjects"
        verbose_name = "Materia"
        verbose_name_plural = "Materias"
        ordering = ["name"]

    def __str__(self):
        return self.name


class StudyPlanSubject(TimeStampedModel):
    study_plan = models.ForeignKey(
        StudyPlan,
        on_delete=models.CASCADE,
        related_name="plan_subjects",
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.PROTECT,
        related_name="subject_plans",
    )
    cycle_number = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=1)
    mandatory = models.BooleanField(default=True)
    passing_grade = models.DecimalField(max_digits=5, decimal_places=2, default=70.00)

    class Meta:
        db_table = "study_plan_subjects"
        verbose_name = "Materia por plan"
        verbose_name_plural = "Materias por plan"
        ordering = ["study_plan", "cycle_number", "order"]
        unique_together = ("study_plan", "subject")

    def __str__(self):
        return f"{self.study_plan} - {self.subject}"


class AcademicPeriod(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Borrador"
        ACTIVE = "active", "Activo"
        CLOSED = "closed", "Cerrado"

    code = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    enrollment_start = models.DateField()
    enrollment_end = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    class Meta:
        db_table = "academic_periods"
        verbose_name = "Periodo académico"
        verbose_name_plural = "Periodos académicos"
        ordering = ["-start_date"]

    def __str__(self):
        return self.name