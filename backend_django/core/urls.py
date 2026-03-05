from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, TutorViewSet, PlanViewSet, SessionViewSet, PaymentViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'tutors', TutorViewSet, basename='tutor')
router.register(r'plans', PlanViewSet, basename='plan')
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
]
