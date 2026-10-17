
from django.conf import settings
from django.db import models


class Material(models.Model):

    class VerificationStatus(models.TextChoices):
        PENDING = "PENDING", "Pending Verification"
        VERIFIED = "VERIFIED", "Verified"
        REJECTED = "REJECTED", "Rejected"
        QUARANTINED = "QUARANTINED", "Quarantined"

    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    supplier_name = models.CharField(max_length=200)
    batch_number = models.CharField(max_length=100)
    mtc_reference = models.CharField(
        max_length=150,
        blank=True,
    )

    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_materials",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["supplier_name", "batch_number", "code"],
                name="unique_material_supplier_batch_code",
            )
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"
