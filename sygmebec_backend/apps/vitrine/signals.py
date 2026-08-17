from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import DemandeAdhesion, InscriptionEvenement, MessageContact
from .tasks import (
    notifier_nouvelle_demande_adhesion,
    notifier_nouveau_message_contact,
    send_inscription_confirmation,
)


@receiver(post_save, sender=DemandeAdhesion)
def notifier_demande_adhesion(sender, instance, created, **kwargs):
    if created:
        notifier_nouvelle_demande_adhesion.delay(instance.pk)


@receiver(post_save, sender=InscriptionEvenement)
def notifier_inscription_evenement(sender, instance, created, **kwargs):
    if created:
        send_inscription_confirmation.delay(instance.pk)


@receiver(post_save, sender=MessageContact)
def notifier_message_contact(sender, instance, created, **kwargs):
    if created:
        notifier_nouveau_message_contact.delay(instance.pk)
