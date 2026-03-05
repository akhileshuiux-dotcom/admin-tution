"""
URL configuration for backend_django project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'ok', 'message': 'Guardian Tutoring API (Django) is running'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health', health_check),
    
    # API Routes matching Express
    path('api/auth/', include('users.urls')),
    path('api/enquiries/', include('enquiries.urls')),
    
    # Core API Routes
    # The Express app mounted these individually:
    # app.use('/api/students', studentRoutes);
    # In Django DRF, we've bundled them into one router under core/urls.py
    # We can either mount the whole router at /api/ or mount individually.
    # To keep exactly the same prefix, we'll just mount the core urls at /api/
    path('api/', include('core.urls')),
]
