from collections import Counter
from io import BytesIO

from django.db.models import Count
from django.utils import timezone
from django.utils.text import slugify
from django.http import FileResponse
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.shortcuts import get_object_or_404

from .models import Membre, Statut, Fonction, HistoriqueStatut, MembreFonction
from .serializers import (
    MembreListSerializer, MembreDetailSerializer,
    MembreCreateUpdateSerializer, StatutSerializer,
    FonctionSerializer, ChangerStatutSerializer,
    HistoriqueStatutSerializer
)
from sygmebec_backend.apps.accounts.permissions import IsSecretaireOrPlus, IsAdministrateur
from sygmebec_backend.apps.core.models import AuditLog
from .exports import make_pdf, make_png, make_xlsx, member_export_rows


AGE_BRACKETS = (
    (0, 17, 'Moins de 18 ans'),
    (18, 25, '18 à 25 ans'),
    (26, 35, '26 à 35 ans'),
    (36, 50, '36 à 50 ans'),
    (51, 65, '51 à 65 ans'),
    (66, None, '66 ans et plus'),
)

SEX_STAT_CHOICES = (
    (Membre.SEXE_MALE, 'Hommes'),
    (Membre.SEXE_FEMELLE, 'Femmes'),
)


def _percentage(value, total):
    return round((value / total) * 100, 1) if total else 0


def _distribution(items, total):
    return [
        {
            'label': label,
            'count': count,
            'percentage': _percentage(count, total),
        }
        for label, count in items
    ]


def _quality(filled, total):
    return {
        'filled': filled,
        'total': total,
        'percentage': _percentage(filled, total),
    }


def _choice_distribution(rows, field, choices, total):
    counts = Counter(row.get(field) or '' for row in rows)
    items = [(label, counts.pop(value, 0)) for value, label in choices]
    items.extend(
        (value, count)
        for value, count in sorted(counts.items(), key=lambda item: item[0].casefold())
        if value
    )
    items.append(('Non renseigné', counts.get('', 0)))
    return _distribution(items, total), total - counts.get('', 0)


def _text_distribution(rows, field, total):
    counts = Counter()
    labels = {}
    missing = 0

    for row in rows:
        value = ' '.join(str(row.get(field) or '').split())
        if not value:
            missing += 1
            continue
        normalized = value.casefold()
        labels.setdefault(normalized, value)
        counts[normalized] += 1

    items = [
        (labels[key], count)
        for key, count in sorted(
            counts.items(),
            key=lambda item: (-item[1], labels[item[0]].casefold()),
        )
    ]
    items.append(('Non renseigné', missing))
    return _distribution(items, total), total - missing


def _age_distribution(rows, total):
    counts = Counter({label: 0 for _, _, label in AGE_BRACKETS})
    missing = 0
    today = timezone.localdate()

    for row in rows:
        birth_date = row.get('date_naissance')
        if not birth_date:
            missing += 1
            continue

        age = today.year - birth_date.year - (
            (today.month, today.day) < (birth_date.month, birth_date.day)
        )
        if age < 0:
            missing += 1
            continue

        for minimum, maximum, label in AGE_BRACKETS:
            if age >= minimum and (maximum is None or age <= maximum):
                counts[label] += 1
                break

    items = [(label, counts[label]) for _, _, label in AGE_BRACKETS]
    items.append(('Non renseigné', missing))
    return _distribution(items, total), total - missing


def _category_distribution(rows, total):
    counts = Counter(row.get('statut__libelle') or 'Sans catégorie' for row in rows)
    items = []

    for statut in Statut.objects.all():
        items.append((statut.libelle, counts.pop(statut.libelle, 0)))

    items.extend(sorted(counts.items(), key=lambda item: item[0].casefold()))
    return _distribution(items, total)


def _function_distribution(total):
    function_counts = dict(
        MembreFonction.objects.filter(membre__deleted_at__isnull=True)
        .values('fonction__nomFonction')
        .annotate(count=Count('membre_id', distinct=True))
        .values_list('fonction__nomFonction', 'count')
    )
    members_with_function = (
        MembreFonction.objects.filter(membre__deleted_at__isnull=True)
        .values('membre_id')
        .distinct()
        .count()
    )
    known_names = (
        Fonction.objects.order_by('nomFonction')
        .values_list('nomFonction', flat=True)
        .distinct()
    )
    items = [(name, function_counts.pop(name, 0)) for name in known_names]
    items.extend(sorted(function_counts.items(), key=lambda item: item[0].casefold()))
    items.append(('Aucune fonction', max(total - members_with_function, 0)))
    return _distribution(items, total), members_with_function


class MembreViewSet(viewsets.ModelViewSet):
    """ViewSet for Membre with role-based permissions."""
    queryset = Membre.objects.select_related('statut').prefetch_related('fonctions', 'historiques_statut')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'prenom', 'telephone', 'telephone_secondaire', 'email', 'eglise_origine']
    filterset_fields = ['statut__id', 'statut__libelle', 'sexe']
    ordering_fields = ['nom', 'date_adhesion', 'created_at']
    ordering = ['nom']
    
    def get_permissions(self):
        if self.action in ['corbeille', 'restaurer']:
            return [IsAdministrateur()]
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

    def perform_destroy(self, instance):
        """Le DELETE API déplace le membre en corbeille au lieu de l'effacer."""
        instance.soft_delete(self.request.user)
        pass  # Recorded by the central audit service.

    @action(detail=False, methods=['get'], url_path='exporter')
    def exporter(self, request):
        """Export the full, unpaginated member register in XLSX, PDF or PNG."""
        export_format = request.query_params.get('format', 'xlsx').lower()
        exporters = {
            'xlsx': (make_xlsx, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
            'pdf': (make_pdf, 'application/pdf'),
            'png': (make_png, 'image/png'),
        }
        if export_format not in exporters:
            return Response(
                {'format': 'Format non pris en charge. Utilisez xlsx, pdf ou png.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # The regular filters (search, statut and fonction) are preserved, but pagination is not.
        members = self.filter_queryset(self.get_queryset()).select_related('statut').prefetch_related(
            'membre_fonctions__fonction', 'historiques_statut__modifie_par'
        )
        membre_id = request.query_params.get('membre')
        if membre_id:
            members = members.filter(pk=membre_id)
        rows = member_export_rows(members, request)
        generator, content_type = exporters[export_format]
        if len(rows) == 1:
            member = rows[0]
            member_name = slugify(f"{member['nom']} {member['prenom']}") or f"membre-{member['id']}"
            filename = f'fiche-membre-{member_name}.{export_format}'
        else:
            filename = f'membres-sygmebec-{timezone.localdate():%Y-%m-%d}.{export_format}'
        return FileResponse(BytesIO(generator(rows)), as_attachment=True, filename=filename, content_type=content_type)

    @action(detail=False, methods=['get'], url_path='corbeille')
    def corbeille(self, request):
        membres = Membre.all_objects.filter(deleted_at__isnull=False).select_related(
            'statut', 'deleted_by'
        ).prefetch_related('fonctions').order_by('-deleted_at')
        return Response(MembreListSerializer(membres, many=True).data)

    @action(detail=True, methods=['post'], url_path='restaurer')
    def restaurer(self, request, pk=None):
        membre = get_object_or_404(Membre.all_objects, pk=pk, deleted_at__isnull=False)
        membre.restore()
        pass  # Recorded by the central audit service.
        return Response({
            'message': 'Membre restauré avec toutes ses informations.',
            'membre': MembreDetailSerializer(membre).data,
        })
    
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
        """Return demographic statistics calculated from the complete active register."""
        rows = list(
            Membre.objects.values(
                'date_naissance',
                'sexe',
                'niveau_etude',
                'zone_habitation',
                'etat_matrimonial',
                'profession',
                'statut__libelle',
            )
        )
        total = len(rows)
        ages, age_filled = _age_distribution(rows, total)
        sexes, sex_filled = _choice_distribution(rows, 'sexe', SEX_STAT_CHOICES, total)
        education, education_filled = _choice_distribution(
            rows,
            'niveau_etude',
            Membre.NIVEAU_ETUDE_CHOICES,
            total,
        )
        zones, zone_filled = _text_distribution(rows, 'zone_habitation', total)
        marital_statuses, marital_filled = _choice_distribution(
            rows,
            'etat_matrimonial',
            Membre.ETAT_MATRIMONIAL_CHOICES,
            total,
        )
        professions, profession_filled = _text_distribution(rows, 'profession', total)
        categories = _category_distribution(rows, total)
        functions, members_with_function = _function_distribution(total)
        by_status = {
            item['label']: item['count']
            for item in categories
            if item['label'] != 'Sans catégorie'
        }
        active = sum(
            item['count']
            for item in categories
            if item['label'].casefold() == 'actif'
        )

        return Response({
            'total': total,
            'by_status': by_status,
            'active': active,
            'generated_at': timezone.now().isoformat(),
            'data_quality': {
                'ages': _quality(age_filled, total),
                'sexes': _quality(sex_filled, total),
                'education': _quality(education_filled, total),
                'zones': _quality(zone_filled, total),
                'marital_statuses': _quality(marital_filled, total),
                'professions': _quality(profession_filled, total),
                'categories': _quality(total, total),
                'functions': _quality(members_with_function, total),
            },
            'repartition': {
                'ages': ages,
                'sexes': sexes,
                'education': education,
                'zones': zones,
                'marital_statuses': marital_statuses,
                'professions': professions,
                'categories': categories,
                'functions': functions,
            },
            'notes': {
                'functions_overlap': (
                    'Un membre peut exercer plusieurs fonctions ; les pourcentages '
                    'de cette répartition peuvent donc dépasser 100 % au total.'
                ),
            },
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
