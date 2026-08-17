from django.conf import settings
from django.db import models

from sygmebec_backend.apps.core.models import TimeStampedModel


class Conversation(TimeStampedModel):
    TYPE_GENERAL = 'GENERAL'
    TYPE_GROUPE = 'GROUPE'
    TYPE_DIRECT = 'DIRECT'

    TYPE_CHOICES = [
        (TYPE_GENERAL, 'General'),
        (TYPE_GROUPE, 'Groupe'),
        (TYPE_DIRECT, 'Direct'),
    ]

    titre = models.CharField(max_length=160)
    type_conversation = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default=TYPE_GROUPE,
    )
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='conversations',
        blank=True,
    )
    est_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'conversation'
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
        ordering = ['-updated_at']

    def __str__(self):
        return self.titre

    @property
    def est_generale(self):
        return self.type_conversation == self.TYPE_GENERAL


class Message(TimeStampedModel):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='messages_envoyes',
        null=True,
        blank=True,
    )
    contenu = models.TextField(max_length=2000)
    est_systeme = models.BooleanField(default=False)
    lu_par = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='messages_lus',
        blank=True,
    )

    class Meta:
        db_table = 'message_chat'
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.auteur} - {self.contenu[:40]}'
