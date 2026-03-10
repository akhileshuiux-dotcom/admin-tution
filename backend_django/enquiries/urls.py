from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EnquiryViewSet, DemoRequestViewSet

router = DefaultRouter()
router.register(r'demo-requests', DemoRequestViewSet, basename='demo-request')
router.register(r'', EnquiryViewSet, basename='enquiry')

urlpatterns = [
    path('', include(router.urls)),
]
