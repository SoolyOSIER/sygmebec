from rest_framework import serializers
from django.utils import timezone
from .models import Evenement, TypeEvenement
from sygmebec_backend.apps.members.serializers import MembreSimpleSerializer


_UNSET = object()


class TypeEvenementSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeEvenement
        fields = ['id', 'nom', 'actif']

class EvenementListSerializer(serializers.ModelSerializer):
    responsable_nom = serializers.CharField(source='responsable.nom_complet', read_only=True)
    est_passe = serializers.BooleanField(read_only=True)
    est_aujourdhui = serializers.BooleanField(read_only=True)
    type_evenement = TypeEvenementSerializer(read_only=True)
    deleted_by_nom = serializers.CharField(source='deleted_by.identifiant', read_only=True)
    
    class Meta:
        model = Evenement
        fields = [
            'id', 'titre', 'categorie', 'date', 'lieu', 
            'responsable', 'responsable_nom',
            'est_public', 'image', 'capacite', 'type_evenement',
            'est_passe', 'est_aujourdhui',
            'dateCreation', 'deleted_at', 'deleted_by_nom'
        ]
class EvenementDetailSerializer(serializers.ModelSerializer):
    responsable = MembreSimpleSerializer(read_only=True)
    est_passe = serializers.BooleanField(read_only=True)
    est_aujourdhui = serializers.BooleanField(read_only=True)
    type_evenement = TypeEvenementSerializer(read_only=True)
    
    class Meta:
        model = Evenement
        fields = [
            'id', 'titre', 'categorie', 'date', 'lieu', 'description',
            'responsable', 'est_public', 'image', 'capacite', 'type_evenement',
            'dateCreation', 'created_at', 'updated_at',
            'est_passe', 'est_aujourdhui'
        ]


class EvenementCreateUpdateSerializer(serializers.ModelSerializer):
    responsable_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    type_evenement_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    type_evenement_nom = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=100)
    
    class Meta:
        model = Evenement
        fields = [
            'id', 'titre', 'categorie', 'date', 'lieu', 'description', 'responsable_id',
            'type_evenement_id', 'type_evenement_nom',
            'est_public', 'image', 'capacite',
        ]
    
    def validate_date(self, value):
        if value < timezone.now():
            raise serializers.ValidationError('La date de l\'événement ne peut pas être dans le passé.')
        return value
    
    def validate_responsable_id(self, value):
        if value:
            from sygmebec_backend.apps.members.models import Membre
            try:
                Membre.objects.get(id=value)
            except Membre.DoesNotExist:
                raise serializers.ValidationError('Responsable invalide.')
        return value

    def validate_type_evenement_id(self, value):
        if value and not TypeEvenement.objects.filter(id=value, actif=True).exists():
            raise serializers.ValidationError("Type d'événement invalide.")
        return value

    def _resolve_type_evenement(self, validated_data):
        type_id = validated_data.pop('type_evenement_id', _UNSET)
        type_nom = validated_data.pop('type_evenement_nom', _UNSET)
        if type_nom is not _UNSET:
            type_nom = (type_nom or '').strip()
        if type_nom:
            type_evenement, _ = TypeEvenement.objects.get_or_create(nom__iexact=type_nom, defaults={'nom': type_nom})
            if not type_evenement.actif:
                type_evenement.actif = True
                type_evenement.save(update_fields=['actif', 'updated_at'])
            return type_evenement
        if type_id is not _UNSET and type_id is not None:
            return TypeEvenement.objects.get(id=type_id)
        if type_id is not _UNSET or type_nom is not _UNSET:
            return None
        return _UNSET
    
    def create(self, validated_data):
        responsable_id = validated_data.pop('responsable_id', _UNSET)
        type_evenement = self._resolve_type_evenement(validated_data)
        if responsable_id is not _UNSET and responsable_id is not None:
            from sygmebec_backend.apps.members.models import Membre
            responsable = Membre.objects.get(id=responsable_id)
            validated_data['responsable'] = responsable
        
        if type_evenement is not _UNSET and type_evenement is not None:
            validated_data['type_evenement'] = type_evenement
            validated_data['categorie'] = Evenement.CATEGORIE_AUTRE

        return Evenement.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        responsable_id = validated_data.pop('responsable_id', _UNSET)
        type_evenement = self._resolve_type_evenement(validated_data)
        if responsable_id is not _UNSET:
            from sygmebec_backend.apps.members.models import Membre
            if responsable_id is not None:
                instance.responsable = Membre.objects.get(id=responsable_id)
            else:
                instance.responsable = None

        if type_evenement is not _UNSET:
            instance.type_evenement = type_evenement
            if type_evenement is not None:
                instance.categorie = Evenement.CATEGORIE_AUTRE
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
