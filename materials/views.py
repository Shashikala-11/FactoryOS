
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsFactoryAdmin
from .models import Material
from .serializers import MaterialSerializer


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.select_related("created_by").all()
    serializer_class = MaterialSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in [
            "update",
            "partial_update",
            "destroy",
        ]:
            return [IsFactoryAdmin()]

        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
