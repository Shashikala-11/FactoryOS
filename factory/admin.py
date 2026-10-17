
from django.contrib import admin
from .models import Factory, Department


@admin.register(Factory)
class FactoryAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "is_active", "created_at")
    search_fields = ("name", "code")
    list_filter = ("is_active",)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "factory", "is_active")
    search_fields = ("name", "code", "factory__name")
    list_filter = ("factory", "is_active")
