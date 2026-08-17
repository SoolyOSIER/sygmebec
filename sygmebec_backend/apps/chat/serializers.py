from rest_framework import serializers

from sygmebec_backend.apps.accounts.serializers import UtilisateurSerializer
from sygmebec_backend.apps.accounts.models import Utilisateur
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    auteur = UtilisateurSerializer(read_only=True)
    auteur_nom = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id',
            'conversation',
            'auteur',
            'auteur_nom',
            'contenu',
            'est_systeme',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['conversation', 'auteur', 'est_systeme', 'created_at', 'updated_at']

    def get_auteur_nom(self, obj):
        if not obj.auteur:
            return 'Systeme'
        membre = getattr(obj.auteur, 'membre', None)
        if membre:
            return membre.nom_complet
        return obj.auteur.identifiant


class MessageCreateSerializer(serializers.Serializer):
    contenu = serializers.CharField(max_length=2000, trim_whitespace=True)

    def validate_contenu(self, value):
        if not value.strip():
            raise serializers.ValidationError('Le message ne peut pas etre vide.')
        return value.strip()


class ConversationSerializer(serializers.ModelSerializer):
    participants = UtilisateurSerializer(many=True, read_only=True)
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True,
    )
    dernier_message = serializers.SerializerMethodField()
    messages_count = serializers.IntegerField(source='messages.count', read_only=True)

    class Meta:
        model = Conversation
        fields = [
            'id',
            'titre',
            'type_conversation',
            'participants',
            'participant_ids',
            'est_active',
            'est_generale',
            'dernier_message',
            'messages_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['est_active', 'est_generale', 'created_at', 'updated_at']

    def validate_participant_ids(self, value):
        if not value:
            return value
        existing = set(Utilisateur.objects.filter(id__in=value, is_active=True).values_list('id', flat=True))
        missing = set(value) - existing
        if missing:
            raise serializers.ValidationError(f'Utilisateurs invalides: {sorted(missing)}')
        return value

    def get_dernier_message(self, obj):
        message = obj.messages.select_related('auteur', 'auteur__membre').order_by('-created_at').first()
        if not message:
            return None
        return MessageSerializer(message).data

    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids', [])
        request = self.context.get('request')
        conversation = Conversation.objects.create(**validated_data)
        participants = list(Utilisateur.objects.filter(id__in=participant_ids, is_active=True))
        if request and request.user.is_authenticated:
            participants.append(request.user)
        conversation.participants.set({user.id for user in participants})
        return conversation
