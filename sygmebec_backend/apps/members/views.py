from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction

from .models import Membre, Statut, Fonction, HistoriqueStatut
from .serializers import (
    MembreListSerializer, MembreDetailSerializer,
    MembreCreateUpdateSerializer, StatutSerializer,
    FonctionSerializer, ChangerStatutSerializer,
    HistoriqueStatutSerializer
)
from sygmebec_backend.apps.accounts.permissions import IsSecretaireOrPlus, IsPasteurOrPlus


class MembreViewSet(viewsets.ModelViewSet):
    """ViewSet for Membre with role-based permissions."""
    queryset = Membre.objects.select_related('statut').prefetch_related('fonctions', 'historiques_statut')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'prenom', 'telephone', 'telephone_secondaire', 'email', 'eglise_origine']
    filterset_fields = ['statut__id', 'statut__libelle', 'sexe']
    ordering_fields = ['nom', 'date_adhesion', 'created_at']
    ordering = ['nom']
    
    def get_permissions(self):
        if self.action == 'destroy':
            return [IsPasteurOrPlus()]
        return [IsSecretaireOrPlus()]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MembreListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return MembreCreateUpdateSerializer
        return MembreDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by fonction
        fonction_id = self.request.query_params.get('fonction')
        if fonction_id:
            queryset = queryset.filter(membre_fonctions__fonction_id=fonction_id)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save()
    
    @action(detail=True, methods=['post'], url_path='changer-statut')
    def changer_statut(self, request, pk=None):
        """Change member status with history tracking."""
        membre = self.get_object()
        serializer = ChangerStatutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        nouveau_statut_id = serializer.validated_data['nouveau_statut_id']
        nouveau_statut = Statut.objects.get(id=nouveau_statut_id)
        
        if membre.statut == nouveau_statut:
            return Response(
                {'error': 'Le membre a déjà ce statut.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ancien_statut = membre.statut.libelle
        membre.statut = nouveau_statut
        membre.save()
        
        HistoriqueStatut.objects.create(
            membre=membre,
            ancien_statut=ancien_statut,
            nouveau_statut=nouveau_statut.libelle,
            modifie_par=request.user
        )
        
        return Response({
            'message': f'Statut changé de "{ancien_statut}" à "{nouveau_statut.libelle}".',
            'membre': MembreDetailSerializer(membre).data
        })
    
    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """Get member statistics."""
        total = Membre.objects.count()
        by_status = {}
        for statut in Statut.objects.all():
            by_status[statut.libelle] = Membre.objects.filter(statut=statut).count()
        
        return Response({
            'total': total,
            'by_status': by_status,
            'active': Membre.objects.filter(statut__libelle='Actif').count()
        })


class StatutViewSet(viewsets.ModelViewSet):
    """ViewSet for Statut (reference data)."""
    queryset = Statut.objects.all()
    serializer_class = StatutSerializer
    permission_classes = [IsSecretaireOrPlus]
    filter_backends = [filters.SearchFilter]
    search_fields = ['libelle']


class FonctionViewSet(viewsets.ModelViewSet):
    """ViewSet for Fonction (reference data)."""
    queryset = Fonction.objects.all()
    serializer_class = FonctionSerializer
    permission_classes = [IsSecretaireOrPlus]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nomFonction']


class HistoriqueStatutListView(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing status history (read-only)."""
    queryset = HistoriqueStatut.objects.select_related('membre', 'modifie_par').all()
    serializer_class = HistoriqueStatutSerializer
    permission_classes = [IsSecretaireOrPlus]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['membre__id']
    ordering = ['-date_changement']
