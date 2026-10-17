
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsFactoryAdmin
from .models import Factory, Department
from .serializers import FactorySerializer, DepartmentSerializer


class FactoryViewSet(viewsets.ModelViewSet):
    queryset = Factory.objects.all()
    serializer_class = FactorySerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsFactoryAdmin()]
        return super().get_permissions()


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.select_related("factory").all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsFactoryAdmin()]
        return super().get_permissions()
