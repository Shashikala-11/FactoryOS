from rest_framework.routers import DefaultRouter
from .views import (
    InspectionTemplateViewSet,
    InspectionParameterViewSet,
    InspectionRecordViewSet,
    InspectionMeasurementViewSet,
)

router = DefaultRouter()
router.register("inspection-templates", InspectionTemplateViewSet)
router.register("inspection-parameters", InspectionParameterViewSet)
router.register("inspection-records", InspectionRecordViewSet)
router.register("inspection-measurements", InspectionMeasurementViewSet)

urlpatterns = router.urls