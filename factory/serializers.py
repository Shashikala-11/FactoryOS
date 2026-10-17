from rest_framework import serializers
from .models import Factory, Department


class FactorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Factory
        fields = [
            "id",
            "name",
            "code",
            "address",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class DepartmentSerializer(serializers.ModelSerializer):
    factory_name = serializers.CharField(
        source="factory.name",
        read_only=True,
    )

    class Meta:
        model = Department
        fields = [
            "id",
            "factory",
            "factory_name",
            "name",
            "code",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
