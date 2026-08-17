from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.http import JsonResponse

# Vue pour la page d'accueil
def home_view(request):
    return JsonResponse({
        'message': 'Bienvenue sur l\'API Sygmebec',
        'endpoints': {
            'docs': '/api/v1/docs/',
            'admin': '/admin/',
            'schema': '/api/v1/schema/'
        }
    })

urlpatterns = [
    path('', home_view, name='home'),  # Ajoute cette ligne
    path('admin/', admin.site.urls),
    path('api/v1/', include('sygmebec_backend.config.api_urls')),
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    try:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns
    except ImportError:
        pass