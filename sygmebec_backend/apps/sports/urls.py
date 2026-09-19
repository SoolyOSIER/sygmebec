from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import SportsArticleViewSet, SportsCategoryViewSet


router = DefaultRouter()
router.register(r'articles', SportsArticleViewSet, basename='sports-article')
router.register(r'categories', SportsCategoryViewSet, basename='sports-category')

urlpatterns = [
    path('', include(router.urls)),
]
