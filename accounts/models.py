
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        SUPERVISOR = "SUPERVISOR", "Supervisor"
        INSPECTOR = "INSPECTOR", "Inspector"
        PRODUCTION = "PRODUCTION", "Production Operator"
        DISPATCH = "DISPATCH", "Dispatch Staff"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.INSPECTOR,
    )

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
