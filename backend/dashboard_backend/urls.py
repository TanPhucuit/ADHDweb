"""
URL configuration for dashboard_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
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
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

# API Documentation
from rest_framework.documentation import include_docs_urls
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def api_root(request):
    """API Root - Available endpoints"""
    return Response({
        'message': 'Dashboard Backend API',
        'version': settings.API_VERSION,
        'endpoints': {
            'auth': '/api/v1/auth/',
            'users': '/api/v1/users/',
            'focus': '/api/v1/focus/',
            'medication': '/api/v1/medication/',
            'rewards': '/api/v1/rewards/',
            'chat': '/api/v1/chat/',
            'assessment': '/api/v1/assessment/',
            'schedule': '/api/v1/schedule/',
            'dashboard': '/api/v1/dashboard/',
            'admin': '/admin/',
            'docs': '/docs/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Root
    path('api/v1/', api_root, name='api-root'),
    
    # API Endpoints
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/users/', include('users.urls')),
    path('api/v1/focus/', include('focus.urls')),
    path('api/v1/medication/', include('medication.urls')),
    path('api/v1/rewards/', include('rewards.urls')),
    # path('api/v1/chat/', include('chat.urls')),  # Temporarily disabled
    # path('api/v1/assessment/', include('assessment.urls')),  # Temporarily disabled
    # path('api/v1/schedule/', include('schedule.urls')),  # Temporarily disabled
    path('api/v1/dashboard/', include('dashboard.urls')),
    
    # API Documentation
    path('docs/', include_docs_urls(title='Dashboard API')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
