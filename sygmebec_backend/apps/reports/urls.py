from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RapportViewSet

router = DefaultRouter()
router.register(r'rapports', RapportViewSet, basename='rapport')

urlpatterns = [
    path('', include(router.urls)),
]