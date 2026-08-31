from django.conf import settings
from django.db.models import Sum
from rest_framework import serializers

from sygmebec_backend.apps.events.models import Evenement
from sygmebec_backend.apps.events.serializers import TypeEvenementSerializer
from sygmebec_backend.apps.members.models import Membre
from sygmebec_backend.apps.members.serializers import MembreSimpleSerializer

from .models import DemandeAdhesion, ImageGalerie, InscriptionEvenement, MessageContact


class HoneypotSerializerMixin:
    honeypot = serializers.CharField(required=False, allow_blank=True, write_only=True)

    def validate_honeypot(self, value):
        if value:
            raise serializers.ValidationError('Requête invalide.')
        return value

    def validate_recaptcha_token(self, value):
        if settings.RECAPTCHA_SECRET_KEY and not value:
            raise serializers.ValidationError('La vérification anti-spam est requise.')
        return value


class EvenementPublicSerializer(serializers.ModelSerializer):
    places_restantes = serializers.SerializerMethodField()
    type_evenement = TypeEvenementSerializer(read_only=True)

    class Meta:
        model = Evenement
        fields = ['id', 'titre', 'categorie', 'type_evenement', 'date', 'lieu', 'description', 'image', 'capacite', 'places_restantes']

    def get_places_restantes(self, evenement):
        if evenement.capacite is None:
            return None
        inscrits = evenement.inscriptions.aggregate(total=Sum('nombre_places'))['total'] or 0
        return max(evenement.capacite - inscrits, 0)


class DemandeAdhesionCreateSerializer(HoneypotSerializerMixin, serializers.ModelSerializer):
    honeypot = serializers.CharField(required=False, allow_blank=True, write_only=True)
    recaptcha_token = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = DemandeAdhesion
        fields = [
            'nom', 'prenom', 'email', 'telephone', 'telephone_secondaire', 'adresse', 'zone_habitation', 'eglise_origine',
            'date_naissance', 'sexe', 'etat_matrimonial', 'niveau_etude', 'profession', 'actuellement_employe',
            'anciennete_ebec', 'membre_petit_groupe', 'dans_ecole_dimanche', 'classe_ecole_dimanche',
            'date_presentation', 'date_conversion', 'date_affiliation', 'date_bapteme', 'photo',
            'message', 'honeypot', 'recaptcha_token',
        ]

    def create(self, validated_data):
        validated_data.pop('honeypot', None)
        validated_data.pop('recaptcha_token', None)
        return super().create(validated_data)


class InscriptionEvenementCreateSerializer(HoneypotSerializerMixin, serializers.ModelSerializer):
    honeypot = serializers.CharField(required=False, allow_blank=True, write_only=True)
    recaptcha_token = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = InscriptionEvenement
        fields = ['nom', 'prenom', 'email', 'telephone', 'nombre_places', 'honeypot', 'recaptcha_token']

    def validate_nombre_places(self, value):
        if value < 1:
            raise serializers.ValidationError('Au moins une place doit être réservée.')
        return value

    def validate(self, attrs):
        evenement = self.context['evenement']
        if evenement.capacite is not None:
            inscrits = evenement.inscriptions.aggregate(total=Sum('nombre_places'))['total'] or 0
            if inscrits + attrs['nombre_places'] > evenement.capacite:
                raise serializers.ValidationError('Il ne reste pas assez de places disponibles.')
        return attrs

    def create(self, validated_data):
        validated_data.pop('honeypot', None)
        validated_data.pop('recaptcha_token', None)
        return super().create(validated_data)


class MessageContactCreateSerializer(HoneypotSerializerMixin, serializers.ModelSerializer):
    honeypot = serializers.CharField(required=False, allow_blank=True, write_only=True)
    recaptcha_token = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = MessageContact
        fields = ['nom', 'email', 'sujet', 'message', 'honeypot', 'recaptcha_token']

    def create(self, validated_data):
        validated_data.pop('honeypot', None)
        validated_data.pop('recaptcha_token', None)
        return super().create(validated_data)


class ImageGalerieSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageGalerie
        fields = ['id', 'titre', 'image', 'evenement', 'ordre', 'date_ajout']


class MembreProfilSerializer(serializers.ModelSerializer):
    nom_complet = serializers.CharField(read_only=True)

    class Meta:
        model = Membre
        fields = ['id', 'nom', 'prenom', 'nom_complet', 'email', 'telephone', 'telephone_secondaire', 'adresse', 'photo']
        read_only_fields = ['id', 'nom', 'prenom', 'nom_complet', 'photo']


class MesInscriptionsSerializer(serializers.ModelSerializer):
    evenement = EvenementPublicSerializer(read_only=True)

    class Meta:
        model = InscriptionEvenement
        fields = ['id', 'evenement', 'nombre_places', 'date_inscription']


class DemandeAdhesionBackofficeSerializer(serializers.ModelSerializer):
    membre_cree = MembreSimpleSerializer(read_only=True)
    traite_par_identifiant = serializers.CharField(source='traite_par.identifiant', read_only=True)

    class Meta:
        model = DemandeAdhesion
        fields = [
            'id', 'nom', 'prenom', 'email', 'telephone', 'telephone_secondaire', 'adresse', 'zone_habitation', 'eglise_origine',
            'date_naissance', 'sexe', 'etat_matrimonial', 'niveau_etude', 'profession', 'actuellement_employe',
            'anciennete_ebec', 'membre_petit_groupe', 'dans_ecole_dimanche', 'classe_ecole_dimanche',
            'date_presentation', 'date_conversion', 'date_affiliation', 'date_bapteme', 'photo',
            'message', 'date_demande', 'statut', 'motif_rejet',
            'membre_cree', 'traite_par_identifiant',
        ]


class RejeterDemandeAdhesionSerializer(serializers.Serializer):
    motif_rejet = serializers.CharField(required=False, allow_blank=True, max_length=255)
