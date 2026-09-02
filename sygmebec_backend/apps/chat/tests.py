from rest_framework import status
from rest_framework.test import APITestCase

from sygmebec_backend.apps.accounts.models import RoleAcces, Utilisateur

from .models import Conversation, Message


class ConversationMessagesLimitTests(APITestCase):
    def setUp(self):
        role, _ = RoleAcces.objects.get_or_create(nomRole='SECRETAIRE')
        self.user = Utilisateur.objects.create_user(
            identifiant='secretaire-chat',
            password='MotDePasseTest123!',
            role_acces=role,
        )
        self.conversation = Conversation.objects.create(
            titre='Discussion de test',
            type_conversation=Conversation.TYPE_GROUPE,
        )
        self.conversation.participants.add(self.user)
        Message.objects.create(
            conversation=self.conversation,
            auteur=self.user,
            contenu='Bonjour',
        )
        self.client.force_authenticate(self.user)

    def test_invalid_message_limits_return_a_validation_error(self):
        for limit in ('invalide', '0', '-1'):
            with self.subTest(limit=limit):
                response = self.client.get(
                    f'/api/v1/conversations/{self.conversation.id}/messages/?limit={limit}'
                )

                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn('limit', response.data)

    def test_message_limit_is_capped_at_two_hundred(self):
        response = self.client.get(
            f'/api/v1/conversations/{self.conversation.id}/messages/?limit=999'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
