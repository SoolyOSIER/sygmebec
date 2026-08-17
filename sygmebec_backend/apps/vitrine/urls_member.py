from django.urls import path

from .views import MesInscriptionsListView, MonProfilMembreView


urlpatterns = [
    path('mon-profil/', MonProfilMembreView.as_view(), name='membre-mon-profil'),
    path('mes-inscriptions/', MesInscriptionsListView.as_view(), name='membre-mes-inscriptions'),
]
