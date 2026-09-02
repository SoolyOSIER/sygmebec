from django.db.models import Q
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from sygmebec_backend.apps.accounts.permissions import IsSecretaireOrPlus
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageCreateSerializer, MessageSerializer


def get_or_create_general_conversation():
    conversation, created = Conversation.objects.get_or_create(
        type_conversation=Conversation.TYPE_GENERAL,
        defaults={'titre': 'Salon general'},
    )
    if created:
        Message.objects.create(
            conversation=conversation,
            auteur_id=None,
            contenu='Bienvenue dans le salon general SYGMEBEC.',
            est_systeme=True,
        )
    return conversation


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [IsSecretaireOrPlus]

    def get_queryset(self):
        get_or_create_general_conversation()
        return (
            Conversation.objects.filter(est_active=True)
            .filter(Q(type_conversation=Conversation.TYPE_GENERAL) | Q(participants=self.request.user))
            .distinct()
            .prefetch_related('participants', 'participants__membre')
        )

    def perform_create(self, serializer):
        serializer.save(type_conversation=Conversation.TYPE_GROUPE)

    @action(detail=False, methods=['get'])
    def general(self, request):
        conversation = get_or_create_general_conversation()
        return Response(self.get_serializer(conversation).data)

    @action(detail=True, methods=['get', 'post'])
    def messages(self, request, pk=None):
        conversation = self.get_object()

        if request.method == 'GET':
            messages = conversation.messages.select_related('auteur', 'auteur__role_acces', 'auteur__membre')
            try:
                limit = int(request.query_params.get('limit', 80))
            except (TypeError, ValueError) as error:
                raise ValidationError({'limit': 'La limite doit etre un entier positif.'}) from error
            if limit < 1:
                raise ValidationError({'limit': 'La limite doit etre superieure ou egale a 1.'})
            limit = min(limit, 200)
            serializer = MessageSerializer(messages.order_by('-created_at')[:limit], many=True)
            return Response(list(reversed(serializer.data)))

        serializer = MessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = Message.objects.create(
            conversation=conversation,
            auteur=request.user,
            contenu=serializer.validated_data['contenu'],
        )
        conversation.save(update_fields=['updated_at'])
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


class MessageViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsSecretaireOrPlus]

    def get_queryset(self):
        conversations = Conversation.objects.filter(
            Q(type_conversation=Conversation.TYPE_GENERAL) | Q(participants=self.request.user)
        )
        queryset = Message.objects.filter(conversation__in=conversations).select_related(
            'conversation',
            'auteur',
            'auteur__role_acces',
            'auteur__membre',
        )
        conversation_id = self.request.query_params.get('conversation')
        if conversation_id:
            queryset = queryset.filter(conversation_id=conversation_id)
        return queryset
