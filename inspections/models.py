
from django.conf import settings
from django.db import models


class InspectionTemplate(models.Model):
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="inspection_templates",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class InspectionParameter(models.Model):
    template = models.ForeignKey(
        InspectionTemplate,
        on_delete=models.CASCADE,
        related_name="parameters",
    )
    name = models.CharField(max_length=150)
    unit = models.CharField(max_length=30, default="mm")
    min_value = models.DecimalField(
        max_digits=12, decimal_places=3, null=True, blank=True
    )
    max_value = models.DecimalField(
        max_digits=12, decimal_places=3, null=True, blank=True
    )
    is_required = models.BooleanField(default=True)

    class Meta:
        ordering = ["id"]
        constraints = [
            models.UniqueConstraint(
                fields=["template", "name"],
                name="unique_parameter_name_per_template",
            ),
        ]

    def __str__(self):
        return f"{self.template.name} - {self.name}"


class InspectionRecord(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        PASSED = "PASSED", "Passed"
        FAILED = "FAILED", "Failed"
        PENDING_REVIEW = "PENDING_REVIEW", "Pending Review"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        QUARANTINED = "QUARANTINED", "Quarantined"

    material = models.ForeignKey(
        "materials.Material",
        on_delete=models.PROTECT,
        related_name="inspections",
    )
    template = models.ForeignKey(
        InspectionTemplate,
        on_delete=models.PROTECT,
        related_name="records",
    )
    inspector = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="inspection_records",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.IN_PROGRESS,
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Inspection #{self.pk} - {self.status}"


class InspectionMeasurement(models.Model):
    record = models.ForeignKey(
        InspectionRecord,
        on_delete=models.CASCADE,
        related_name="measurements",
    )
    parameter = models.ForeignKey(
        InspectionParameter,
        on_delete=models.PROTECT,
        related_name="measurements",
    )
    measured_value = models.DecimalField(
        max_digits=12,
        decimal_places=3,
    )
    is_pass = models.BooleanField(default=False)
    remarks = models.TextField(blank=True)
    measured_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["record", "parameter"],
                name="unique_parameter_per_inspection",
            ),
        ]

    def save(self, *args, **kwargs):
        parameter = self.parameter

        self.is_pass = (
            (parameter.min_value is None
             or self.measured_value >= parameter.min_value)
            and
            (parameter.max_value is None
             or self.measured_value <= parameter.max_value)
        )

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.parameter.name}: {self.measured_value}"
