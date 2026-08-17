from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from sygmebec_backend.apps.accounts.permissions import IsSecretaireOrPlus
from sygmebec_backend.apps.events.models import Evenement

from .models import DemandeAdhesion, ImageGalerie, InscriptionEvenement
from .serializers import (
    DemandeAdhesionBackofficeSerializer,
    DemandeAdhesionCreateSerializer,
    EvenementPublicSerializer,
    ImageGalerieSerializer,
    InscriptionEvenementCreateSerializer,
    MembreProfilSerializer,
    MessageContactCreateSerializer,
    MesInscriptionsSerializer,
    RejeterDemandeAdhesionSerializer,
)
from .services import valider_demande_adhesion


class EvenementPublicListView(ListAPIView):
    serializer_class = EvenementPublicSerializer
    permission_classes = [AllowAny]
    throttle_scope = 'public-read'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categorie', 'lieu']
    search_fields = ['titre', 'lieu', 'description']
    ordering_fields = ['date', 'titre']
    ordering = ['date']

    def get_queryset(self):
        return Evenement.objects.select_related('type_evenement').filter(est_public=True, date__gte=timezone.now())


class EvenementPublicDetailView(RetrieveAPIView):
    serializer_class = EvenementPublicSerializer
    permission_classes = [AllowAny]
    throttle_scope = 'public-read'

    def get_queryset(self):
        return Evenement.objects.select_related('type_evenement').filter(est_public=True)


class InscriptionEvenementCreateView(CreateAPIView):
    serializer_class = InscriptionEvenementCreateSerializer
    permission_classes = [AllowAny]
    throttle_scope = 'public'

    def get_evenement(self):
        return Evenement.objects.filter(est_public=True, pk=self.kwargs['pk']).first()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        evenement = self.get_evenement()
        if evenement is None:
            from django.http import Http404
            raise Http404('Événement introuvable.')
        context['evenement'] = evenement
        return context

    def perform_create(self, serializer):
        membre = self.request.user.membre if self.request.user.is_authenticated else None
        serializer.save(evenement=self.get_evenement(), membre=membre)


class DemandeAdhesionCreateView(CreateAPIView):
    serializer_class = DemandeAdhesionCreateSerializer
    permission_classes = [AllowAny]
    throttle_scope = 'public'


class MessageContactCreateView(CreateAPIView):
    serializer_class = MessageContactCreateSerializer
    permission_classes = [AllowAny]
    throttle_scope = 'public'


class ImageGalerieListView(ListAPIView):
    queryset = ImageGalerie.objects.select_related('evenement').all()
    serializer_class = ImageGalerieSerializer
    permission_classes = [AllowAny]
    throttle_scope = 'public-read'


class ImageGalerieViewSet(viewsets.ModelViewSet):
    """Gestion des photos de la vitrine depuis le tableau de bord."""
    queryset = ImageGalerie.objects.select_related('evenement').all()
    serializer_class = ImageGalerieSerializer
    permission_classes = [IsSecretaireOrPlus]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['evenement']
    search_fields = ['titre']
    ordering_fields = ['ordre', 'date_ajout', 'titre']
    ordering = ['ordre', '-date_ajout']


class MonProfilMembreView(RetrieveUpdateAPIView):
    serializer_class = MembreProfilSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        if not self.request.user.membre_id:
            raise PermissionDenied('Aucun profil membre n’est lié à ce compte.')
        return self.request.user.membre


class MesInscriptionsListView(ListAPIView):
    serializer_class = MesInscriptionsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.membre_id:
            raise PermissionDenied('Aucun profil membre n’est lié à ce compte.')
        return InscriptionEvenement.objects.select_related('evenement').filter(membre=self.request.user.membre)


class DemandeAdhesionViewSet(viewsets.ReadOnlyModelViewSet):
    """Circuit back-office des demandes soumises depuis la vitrine."""
    serializer_class = DemandeAdhesionBackofficeSerializer
    permission_classes = [IsSecretaireOrPlus]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['statut']
    search_fields = ['nom', 'prenom', 'email', 'telephone']
    ordering_fields = ['date_demande', 'nom', 'prenom', 'statut']
    ordering = ['-date_demande']

    def get_queryset(self):
        return DemandeAdhesion.objects.select_related('membre_cree', 'traite_par')

    @action(detail=True, methods=['post'])
    def valider(self, request, pk=None):
        try:
            demande = valider_demande_adhesion(self.get_object(), request.user)
        except ValueError as error:
            raise ValidationError({'detail': str(error)})
        return Response(self.get_serializer(demande).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def rejeter(self, request, pk=None):
        demande = self.get_object()
        if demande.statut != DemandeAdhesion.EN_ATTENTE:
            raise ValidationError({'detail': 'Cette demande a déjà été traitée.'})

        serializer = RejeterDemandeAdhesionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        demande.statut = DemandeAdhesion.REJETEE
        demande.motif_rejet = serializer.validated_data.get('motif_rejet', '')
        demande.traite_par = request.user
        demande.save(update_fields=['statut', 'motif_rejet', 'traite_par', 'updated_at'])
        return Response(self.get_serializer(demande).data, status=status.HTTP_200_OK)
