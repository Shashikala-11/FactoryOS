
from django.contrib import admin

from .models import Material


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "name",
        "supplier_name",
        "batch_number",
        "verification_status",
        "created_at",
    )
    search_fields = (
        "code",
        "name",
        "supplier_name",
        "batch_number",
        "mtc_reference",
    )
    list_filter = ("verification_status", "created_at")
    readonly_fields = ("created_at", "updated_at")
