from decimal import Decimal

from django.db import models

from apps.common.models import TimeStampedModel


class ChargeConcept(TimeStampedModel):
    class Category(models.TextChoices):
        ENROLLMENT = "enrollment", "Inscripción"
        TUITION = "tuition", "Colegiatura"
        EXAM = "exam", "Examen"
        PENALTY = "penalty", "Recargo"
        OTHER = "other", "Otro"

    code = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=30, choices=Category.choices)
    description = models.TextField(blank=True)
    default_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    active = models.BooleanField(default=True)

    class Meta:
        db_table = "finance_charge_concepts"
        verbose_name = "Concepto de cobro"
        verbose_name_plural = "Conceptos de cobro"
        ordering = ["name"]

    def __str__(self):
        return f"{self.code} - {self.name}"


class StudentCharge(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        PARTIAL = "partial", "Parcial"
        PAID = "paid", "Pagado"
        CANCELLED = "cancelled", "Cancelado"

    student = models.ForeignKey(
        "accounts.StudentProfile",
        on_delete=models.PROTECT,
        related_name="charges",
    )
    concept = models.ForeignKey(
        ChargeConcept,
        on_delete=models.PROTECT,
        related_name="student_charges",
    )
    academic_period = models.ForeignKey(
        "academics.AcademicPeriod",
        on_delete=models.PROTECT,
        related_name="student_charges",
        null=True,
        blank=True,
    )
    reference = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    class Meta:
        db_table = "finance_student_charges"
        verbose_name = "Cargo al alumno"
        verbose_name_plural = "Cargos a alumnos"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reference} - {self.student}"

    @property
    def total_paid(self):
        total = self.payments.filter(status=StudentPayment.Status.COMPLETED).aggregate(
            total=models.Sum("amount")
        )["total"]
        return total or Decimal("0.00")

    @property
    def balance(self):
        return (self.amount or Decimal("0.00")) - self.total_paid


class StudentPayment(TimeStampedModel):
    class Method(models.TextChoices):
        CASH = "cash", "Efectivo"
        CARD = "card", "Tarjeta"
        TRANSFER = "transfer", "Transferencia"
        ONLINE = "online", "Pago en línea"
        OTHER = "other", "Otro"

    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        COMPLETED = "completed", "Completado"
        FAILED = "failed", "Fallido"
        CANCELLED = "cancelled", "Cancelado"

    student = models.ForeignKey(
        "accounts.StudentProfile",
        on_delete=models.PROTECT,
        related_name="payments",
    )
    charge = models.ForeignKey(
        StudentCharge,
        on_delete=models.PROTECT,
        related_name="payments",
    )
    payment_date = models.DateTimeField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=Method.choices)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.COMPLETED,
    )
    transaction_reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "finance_student_payments"
        verbose_name = "Pago de alumno"
        verbose_name_plural = "Pagos de alumnos"
        ordering = ["-payment_date", "-created_at"]

    def __str__(self):
        return f"{self.student} - {self.amount} - {self.payment_date}"