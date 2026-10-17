
from django.contrib import admin

from .models import (
    InspectionTemplate,
    InspectionParameter,
    InspectionRecord,
    InspectionMeasurement,
)


class InspectionParameterInline(admin.TabularInline):
    model = InspectionParameter
    extra = 1


@admin.register(InspectionTemplate)
class InspectionTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "created_by", "created_at")
    search_fields = ("name",)
    list_filter = ("is_active",)
    inlines = [InspectionParameterInline]


@admin.register(InspectionRecord)
class InspectionRecordAdmin(admin.ModelAdmin):
    list_display = (
        "id", "material", "template", "inspector", "status", "created_at"
    )
    list_filter = ("status", "template")
    search_fields = ("material__code", "inspector__username")
    readonly_fields = ("created_at", "updated_at")


@admin.register(InspectionMeasurement)
class InspectionMeasurementAdmin(admin.ModelAdmin):
    list_display = (
        "record", "parameter", "measured_value", "is_pass", "measured_at"
    )
    list_filter = ("is_pass",)
    readonly_fields = ("is_pass", "measured_at")
