from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.http import FileResponse
from django.shortcuts import get_object_or_404

from .models import Rapport, CritereFiltrage
from .serializers import (
    RapportListSerializer, RapportDetailSerializer,
    GenererRapportSerializer
)
from sygmebec_backend.apps.accounts.permissions import IsSecretaireOrPlus
from .tasks import generer_rapport_pdf


class RapportViewSet(viewsets.ModelViewSet):
    """ViewSet for Rapport with generation capabilities."""
    queryset = Rapport.objects.select_related('genere_par', 'critere').all()
    serializer_class = RapportListSerializer
    permission_classes = [IsSecretaireOrPlus]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['statut', 'genere_par__id']
    ordering_fields = ['dateGeneration', 'titre']
    ordering = ['-dateGeneration']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return GenererRapportSerializer
        elif self.action == 'retrieve':
            return RapportDetailSerializer
        return super().get_serializer_class()
    
    def create(self, request, *args, **kwargs):
        """Generate a report with filtering criteria."""
        serializer = GenererRapportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        # Create filtering criteria
        critere = CritereFiltrage.objects.create(
            type_rapport=data.get('type_rapport', CritereFiltrage.TYPE_MEMBRES),
            statut=data.get('statut', ''),
            periode=data.get('periode', ''),
            date_debut=data.get('date_debut'),
            date_fin=data.get('date_fin'),
            fonction=data.get('fonction', '')
        )
        
        # Create report
        rapport = Rapport.objects.create(
            titre=data['titre'],
            dateFin=data.get('date_fin'),
            genere_par=request.user.membre if request.user.membre else None,
            critere=critere,
            statut='EN_ATTENTE'
        )
        
        # Trigger async generation
        generer_rapport_pdf.delay(rapport.id)
        
        return Response(
            RapportDetailSerializer(rapport).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['get'])
    def telecharger(self, request, pk=None):
        """Download the generated report file."""
        rapport = self.get_object()
        
        if rapport.statut != 'TERMINE':
            return Response(
                {'error': 'Le rapport n\'est pas encore disponible.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not rapport.fichier:
            return Response(
                {'error': 'Fichier non trouvé.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return FileResponse(
            rapport.fichier.open('rb'),
            as_attachment=True,
            filename=rapport.fichier.name.split('/')[-1]
        )
    
    @action(detail=True, methods=['post'])
    def regenerer(self, request, pk=None):
        """Regenerate a report."""
        rapport = self.get_object()
        
        if rapport.fichier:
            rapport.fichier.delete(save=False)
        
        rapport.statut = 'EN_ATTENTE'
        rapport.error_message = ''
        rapport.save()
        
        generer_rapport_pdf.delay(rapport.id)
        
        return Response({
            'message': 'Régénération du rapport en cours.',
            'rapport': RapportDetailSerializer(rapport).data
        })
