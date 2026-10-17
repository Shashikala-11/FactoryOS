from rest_framework import serializers
from .models import (
    InspectionTemplate,
    InspectionParameter,
    InspectionRecord,
    InspectionMeasurement,
)


class InspectionParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionParameter
        fields = "__all__"


class InspectionTemplateSerializer(serializers.ModelSerializer):
    parameters = InspectionParameterSerializer(many=True, read_only=True)
    created_by_username = serializers.CharField(
        source="created_by.username", read_only=True
    )

    class Meta:
        model = InspectionTemplate
        fields = [
            "id", "name", "description", "is_active",
            "created_by", "created_by_username",
            "created_at", "parameters",
        ]
        read_only_fields = ["created_by", "created_at"]


class InspectionMeasurementSerializer(serializers.ModelSerializer):
    is_pass = serializers.BooleanField(read_only=True)

    class Meta:
        model = InspectionMeasurement
        fields = "__all__"
        read_only_fields = ["is_pass", "measured_at"]

    def validate(self, attrs):
        record = attrs.get("record", getattr(self.instance, "record", None))
        parameter = attrs.get(
            "parameter", getattr(self.instance, "parameter", None)
        )

        if record and parameter and parameter.template_id != record.template_id:
            raise serializers.ValidationError(
                "The parameter must belong to the inspection's template."
            )

        if record and record.status != InspectionRecord.Status.IN_PROGRESS:
            raise serializers.ValidationError(
                "Measurements can only be submitted while inspection is in progress."
            )

        return attrs


class InspectionRecordSerializer(serializers.ModelSerializer):
    measurements = InspectionMeasurementSerializer(many=True, read_only=True)
    material_code = serializers.CharField(source="material.code", read_only=True)
    template_name = serializers.CharField(source="template.name", read_only=True)
    inspector_username = serializers.CharField(
        source="inspector.username", read_only=True
    )

    class Meta:
        model = InspectionRecord
        fields = [
            "id", "material", "material_code",
            "template", "template_name",
            "inspector", "inspector_username",
            "status", "notes", "created_at", "updated_at",
            "measurements",
        ]
        read_only_fields = [
            "inspector", "status", "created_at", "updated_at"
        ]