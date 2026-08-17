from rest_framework import serializers
from .models import Rapport, CritereFiltrage
from sygmebec_backend.apps.members.serializers import MembreSimpleSerializer


class CritereFiltrageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CritereFiltrage
        fields = ['id', 'type_rapport', 'statut', 'periode', 'date_debut', 'date_fin', 'fonction']


class RapportListSerializer(serializers.ModelSerializer):
    genere_par_nom = serializers.CharField(source='genere_par.nom_complet', read_only=True)
    critere_detail = CritereFiltrageSerializer(source='critere', read_only=True)
    est_termine = serializers.BooleanField(read_only=True)

    class Meta:
        model = Rapport
        fields = [
            'id', 'titre', 'dateGeneration', 'statut',
            'genere_par', 'genere_par_nom', 'critere_detail',
            'est_termine', 'fichier'
        ]


class RapportDetailSerializer(serializers.ModelSerializer):
    genere_par = MembreSimpleSerializer(read_only=True)
    critere = CritereFiltrageSerializer(read_only=True)
    est_termine = serializers.BooleanField(read_only=True)
    est_en_erreur = serializers.BooleanField(read_only=True)

    class Meta:
        model = Rapport
        fields = [
            'id', 'titre', 'dateGeneration', 'dateFin', 'statut',
            'genere_par', 'critere', 'fichier',
            'error_message', 'est_termine', 'est_en_erreur',
            'created_at', 'updated_at'
        ]


class GenererRapportSerializer(serializers.Serializer):
    titre = serializers.CharField(required=True, max_length=200)
    type_rapport = serializers.ChoiceField(
        choices=CritereFiltrage.TYPE_RAPPORT_CHOICES,
        required=False,
        default=CritereFiltrage.TYPE_MEMBRES,
    )
    statut = serializers.CharField(required=False, allow_blank=True)
    periode = serializers.CharField(required=False, allow_blank=True)
    date_debut = serializers.DateField(required=False, allow_null=True)
    date_fin = serializers.DateField(required=False, allow_null=True)
    fonction = serializers.CharField(required=False, allow_blank=True)
