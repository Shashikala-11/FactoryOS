
from rest_framework import serializers

from .models import Material


class MaterialSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True,
    )

    class Meta:
        model = Material
        fields = [
            "id",
            "code",
            "name",
            "description",
            "supplier_name",
            "batch_number",
            "mtc_reference",
            "verification_status",
            "created_by",
            "created_by_username",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "verification_status",
            "created_by",
            "created_by_username",
            "created_at",
            "updated_at",
        ]
