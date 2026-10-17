from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from accounts.models import User
from accounts.permissions import IsFactoryAdmin, IsInspector
from .models import (
    InspectionTemplate,
    InspectionParameter,
    InspectionRecord,
    InspectionMeasurement,
)
from .serializers import (
    InspectionTemplateSerializer,
    InspectionParameterSerializer,
    InspectionRecordSerializer,
    InspectionMeasurementSerializer,
)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError, PermissionDenied
from accounts.permissions import IsSupervisor




class InspectionTemplateViewSet(viewsets.ModelViewSet):
    queryset = InspectionTemplate.objects.prefetch_related("parameters").all()
    serializer_class = InspectionTemplateSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["post"], permission_classes=[IsSupervisor])
    def review(self, request, pk=None):
        record = self.get_object()

        if record.inspector_id == request.user.id:
            raise PermissionDenied(
                "Inspectors cannot approve their own inspections."
            )

        decision = request.data.get("decision")
        notes = request.data.get("notes", "")

        if record.status not in [
            InspectionRecord.Status.PENDING_REVIEW,
            InspectionRecord.Status.FAILED,
        ]:
            raise ValidationError(
                "Only completed inspections awaiting review or failed inspections can be reviewed."
            )

        if decision == "approve":
            if record.status == InspectionRecord.Status.FAILED:
                raise ValidationError(
                    "Failed inspections cannot be approved. Reject or quarantine them."
                )
            record.status = InspectionRecord.Status.APPROVED

        elif decision == "reject":
            record.status = InspectionRecord.Status.REJECTED

        elif decision == "quarantine":
            record.status = InspectionRecord.Status.QUARANTINED

        else:
            raise ValidationError(
                "Decision must be approve, reject, or quarantine."
            )

        if notes:
            record.notes = (
                f"{record.notes}\nSupervisor review: {notes}".strip()
            )

        record.save()
        return Response(InspectionRecordSerializer(record).data)

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsFactoryAdmin()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class InspectionParameterViewSet(viewsets.ModelViewSet):
    queryset = InspectionParameter.objects.select_related("template").all()
    serializer_class = InspectionParameterSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsFactoryAdmin()]
        return super().get_permissions()


class InspectionRecordViewSet(viewsets.ModelViewSet):
    queryset = InspectionRecord.objects.select_related(
        "material", "template", "inspector"
    ).prefetch_related("measurements").all()
    serializer_class = InspectionRecordSerializer
    permission_classes = [IsAuthenticated]


    @action(detail=True, methods=["post"], permission_classes=[IsSupervisor])
    def review(self, request, pk=None):
            record = self.get_object()
    
            if record.inspector_id == request.user.id:
                raise PermissionDenied(
                    "Inspectors cannot approve their own inspections."
                )
    
            decision = request.data.get("decision")
            notes = request.data.get("notes", "")
    
            if record.status not in [
                InspectionRecord.Status.PENDING_REVIEW,
                InspectionRecord.Status.FAILED,
            ]:
                raise ValidationError(
                    "Only completed inspections awaiting review or failed inspections can be reviewed."
                )
    
            if decision == "approve":
                if record.status == InspectionRecord.Status.FAILED:
                    raise ValidationError(
                        "Failed inspections cannot be approved. Reject or quarantine them."
                    )
                record.status = InspectionRecord.Status.APPROVED
    
            elif decision == "reject":
                record.status = InspectionRecord.Status.REJECTED
    
            elif decision == "quarantine":
                record.status = InspectionRecord.Status.QUARANTINED
    
            else:
                raise ValidationError(
                    "Decision must be approve, reject, or quarantine."
                )
    
            if notes:
                record.notes = (
                    f"{record.notes}\nSupervisor review: {notes}".strip()
                )
    
            record.save()
            return Response(InspectionRecordSerializer(record).data)

    def get_permissions(self):
        if self.action == "create":
            return [IsInspector()]
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsFactoryAdmin()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(inspector=self.request.user)


class InspectionMeasurementViewSet(viewsets.ModelViewSet):
    queryset = InspectionMeasurement.objects.select_related(
        "record", "parameter"
    ).all()
    serializer_class = InspectionMeasurementSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update"]:
            return [IsInspector()]
        if self.action == "destroy":
            return [IsFactoryAdmin()]
        return super().get_permissions()

    def perform_create(self, serializer):
        record = serializer.validated_data["record"]

        if record.inspector_id != self.request.user.id:
            if not (
                self.request.user.is_superuser
                or self.request.user.role == User.Role.ADMIN
            ):
                raise PermissionDenied(
                    "You can only submit measurements for your own inspections."
                )

        serializer.save()
        record.refresh_from_db()

        required_ids = set(
            record.template.parameters.filter(is_required=True)
            .values_list("id", flat=True)
        )
        measured_ids = set(
            record.measurements.values_list("parameter_id", flat=True)
        )

        if required_ids.issubset(measured_ids):
            if record.measurements.filter(is_pass=False).exists():
                record.status = InspectionRecord.Status.FAILED
            else:
                record.status = InspectionRecord.Status.PENDING_REVIEW
            record.save(update_fields=["status", "updated_at"])