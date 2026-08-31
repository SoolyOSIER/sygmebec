from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MembreViewSet, StatutViewSet, FonctionViewSet, HistoriqueStatutListView

router = DefaultRouter()
router.register(r'membres', MembreViewSet, basename='membre')
router.register(r'statuts', StatutViewSet, basename='statut')
router.register(r'fonctions', FonctionViewSet, basename='fonction')

urlpatterns = [
    path('', include(router.urls)),
    path('historiques-statut/', HistoriqueStatutListView.as_view({'get': 'list'}), name='historique-statut-list'),
]