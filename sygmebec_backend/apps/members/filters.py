import django_filters
from .models import Membre

class MembreFilter(django_filters.FilterSet):
    statut = django_filters.CharFilter(field_name='statut__libelle')
    fonction = django_filters.CharFilter(field_name='fonctions__nomFonction')
    date_adhesion_start = django_filters.DateFilter(field_name='date_adhesion', lookup_expr='gte')
    date_adhesion_end = django_filters.DateFilter(field_name='date_adhesion', lookup_expr='lte')
    
    class Meta:
        model = Membre
        fields = ['statut', 'fonction', 'date_adhesion_start', 'date_adhesion_end']