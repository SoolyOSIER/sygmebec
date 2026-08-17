from rest_framework import serializers

from sygmebec_backend.apps.members.models import Membre
from sygmebec_backend.apps.members.serializers import MembreSimpleSerializer
from .models import Lettre


class LettreSerializer(serializers.ModelSerializer):
    membre = MembreSimpleSerializer(read_only=True)
    membre_id = serializers.PrimaryKeyRelatedField(source='membre', queryset=Membre.objects.all(), write_only=True)
    type_lettre_libelle = serializers.CharField(source='get_type_lettre_display', read_only=True)
    cree_par_nom = serializers.CharField(source='cree_par.identifiant', read_only=True)

    class Meta:
        model = Lettre
        fields = [
            'id', 'reference', 'type_lettre', 'type_lettre_libelle', 'membre', 'membre_id',
            'destinataire', 'objet', 'contenu', 'date_emission', 'cree_par_nom', 'fichier',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['reference', 'fichier', 'created_at', 'updated_at']

    def validate(self, attrs):
        if attrs.get('type_lettre') == Lettre.TRANSFERT and not attrs.get('destinataire') and not getattr(self.instance, 'destinataire', ''):
            raise serializers.ValidationError({'destinataire': 'Le destinataire est requis pour une lettre de transfert.'})
        return attrs
