from django.urls import path
from .views import CustomLoginView, MeView

urlpatterns = [
    path('login', CustomLoginView.as_view(), name='login'),
    path('me', MeView.as_view(), name='me'),
]
