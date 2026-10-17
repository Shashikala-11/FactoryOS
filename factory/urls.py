
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import FactoryViewSet, DepartmentViewSet

router = DefaultRouter()
router.register("factories", FactoryViewSet, basename="factory")
router.register("departments", DepartmentViewSet, basename="department")

urlpatterns = [
    path("", include(router.urls)),
]
