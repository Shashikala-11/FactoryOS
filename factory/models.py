
from django.db import models


class Factory(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=30, unique=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"


class Department(models.Model):
    factory = models.ForeignKey(
        Factory,
        on_delete=models.PROTECT,
        related_name="departments",
    )
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=30)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["factory", "code"],
                name="unique_department_code_per_factory",
            ),
            models.UniqueConstraint(
                fields=["factory", "name"],
                name="unique_department_name_per_factory",
            ),
        ]

    def __str__(self):
        return f"{self.name} - {self.factory.code}"
