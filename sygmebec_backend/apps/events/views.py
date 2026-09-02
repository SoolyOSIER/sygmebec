from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Evenement, TypeEvenement
from sygmebec_backend.apps.core.models import AuditLog
from django.forms.models import model_to_dict
from django.contrib.auth import get_user_model
from django.core.serializers.json import DjangoJSONEncoder
import json
from .serializers import (
    EvenementListSerializer, EvenementDetailSerializer,
    EvenementCreateUpdateSerializer
    , TypeEvenementSerializer
)
from sygmebec_backend.apps.accounts.permissions import IsSecretaireOrPlus, IsAdministrateur


def audit_changes(instance):
    """Convertit les dates et relations avant l'enregistrement JSON de l'audit."""
    changes = model_to_dict(instance)
    if instance.image:
        changes['image'] = instance.image.name
    else:
        changes['image'] = None
    return json.loads(json.dumps(changes, cls=DjangoJSONEncoder))


class EvenementViewSet(viewsets.ModelViewSet):
    """ViewSet for Evenement with role-based permissions."""
    queryset = Evenement.objects.select_related('responsable', 'type_evenement').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titre', 'categorie', 'lieu', 'description']
    filterset_fields = ['categorie', 'lieu', 'responsable__id']
    ordering_fields = ['date', 'dateCreation', 'titre']
    ordering = ['date']
    
    def get_permissions(self):
        if self.action in ['corbeille', 'restaurer']:
            return [IsAdministrateur()]
        return [IsSecretaireOrPlus()]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EvenementListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return EvenementCreateUpdateSerializer
        return EvenementDetailSerializer
    
    def perform_create(self, serializer):
        evenement = serializer.save()
        try:
            actor = getattr(self.request, 'user', None)
            with transaction.atomic():
                AuditLog.objects.create(
                    actor=actor if isinstance(actor, get_user_model()) else None,
                    action='create',
                    content_type='Evenement',
                    object_id=str(evenement.pk),
                    object_repr=str(evenement),
                    changes=audit_changes(evenement)
                )
        except Exception:
            pass

    def perform_update(self, serializer):
        evenement = serializer.save()
        try:
            actor = getattr(self.request, 'user', None)
            with transaction.atomic():
                AuditLog.objects.create(
                    actor=actor if isinstance(actor, get_user_model()) else None,
                    action='update',
                    content_type='Evenement',
                    object_id=str(evenement.pk),
                    object_repr=str(evenement),
                    changes=audit_changes(evenement)
                )
        except Exception:
            pass

    def perform_destroy(self, instance):
        """L'événement, son image et ses relations restent conservés en corbeille."""
        instance.soft_delete(self.request.user)
        AuditLog.objects.create(
            actor=self.request.user,
            action='delete',
            content_type='Evenement',
            object_id=str(instance.pk),
            object_repr=str(instance),
            changes=audit_changes(instance),
        )

    @action(detail=False, methods=['get'], url_path='corbeille')
    def corbeille(self, request):
        evenements = Evenement.all_objects.filter(deleted_at__isnull=False).select_related(
            'responsable', 'type_evenement', 'deleted_by'
        ).order_by('-deleted_at')
        return Response(EvenementListSerializer(evenements, many=True).data)

    @action(detail=True, methods=['post'], url_path='restaurer')
    def restaurer(self, request, pk=None):
        evenement = get_object_or_404(Evenement.all_objects, pk=pk, deleted_at__isnull=False)
        evenement.restore()
        AuditLog.objects.create(
            actor=request.user,
            action='restore',
            content_type='Evenement',
            object_id=str(evenement.pk),
            object_repr=str(evenement),
            changes=audit_changes(evenement),
        )
        return Response({
            'message': 'Événement restauré avec toutes ses informations.',
            'evenement': EvenementDetailSerializer(evenement).data,
        })
    
    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """Get event statistics."""
        today = timezone.now()
        
        total = Evenement.objects.count()
        a_venir = Evenement.objects.filter(date__gte=today).count()
        passes = Evenement.objects.filter(date__lt=today).count()
        
        # Get upcoming events
        upcoming = Evenement.objects.filter(date__gte=today).order_by('date')[:5]
        upcoming_data = EvenementListSerializer(upcoming, many=True).data
        
        return Response({
            'total': total,
            'a_venir': a_venir,
            'passes': passes,
            'upcoming': upcoming_data
        })


class TypeEvenementViewSet(viewsets.ModelViewSet):
    """Référentiel des types personnalisés visibles dans le formulaire d'événement."""
    queryset = TypeEvenement.objects.all()
    serializer_class = TypeEvenementSerializer
    permission_classes = [IsSecretaireOrPlus]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom']
    ordering_fields = ['nom', 'created_at']
    ordering = ['nom']
