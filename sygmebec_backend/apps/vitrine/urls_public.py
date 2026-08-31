from django.urls import path

from .views import (
    DemandeAdhesionCreateView,
    EvenementPublicDetailView,
    EvenementPublicListView,
    ImageGalerieListView,
    InscriptionEvenementCreateView,
    MessageContactCreateView,
    VersetDuJourView,
)


urlpatterns = [
    path('verset-du-jour/', VersetDuJourView.as_view(), name='public-daily-verse'),
    path('evenements/', EvenementPublicListView.as_view(), name='public-evenements'),
    path('evenements/<int:pk>/', EvenementPublicDetailView.as_view(), name='public-evenement-detail'),
    path('evenements/<int:pk>/inscription/', InscriptionEvenementCreateView.as_view(), name='public-evenement-inscription'),
    path('adhesion/', DemandeAdhesionCreateView.as_view(), name='public-adhesion'),
    path('contact/', MessageContactCreateView.as_view(), name='public-contact'),
    path('galerie/', ImageGalerieListView.as_view(), name='public-galerie'),
]
