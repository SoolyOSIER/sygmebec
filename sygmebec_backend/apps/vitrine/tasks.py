from django.conf import settings
from django.core.mail import send_mail
from celery import shared_task

from .models import DemandeAdhesion, InscriptionEvenement, MessageContact


def _recipients():
    return list(getattr(settings, 'VITRINE_NOTIFICATION_RECIPIENTS', []))


@shared_task
def notifier_nouvelle_demande_adhesion(demande_id):
    demande = DemandeAdhesion.objects.get(pk=demande_id)
    recipients = _recipients()
    if recipients:
        send_mail(
            'Nouvelle demande d’adhésion',
            f'{demande.nom} {demande.prenom} a soumis une demande d’adhésion.',
            settings.DEFAULT_FROM_EMAIL,
            recipients,
        )


@shared_task
def send_inscription_confirmation(inscription_id):
    inscription = InscriptionEvenement.objects.select_related('evenement').get(pk=inscription_id)
    send_mail(
        f'Confirmation : {inscription.evenement.titre}',
        f'Votre inscription est confirmée pour le {inscription.evenement.titre}, le {inscription.evenement.date:%d/%m/%Y à %H:%M}.',
        settings.DEFAULT_FROM_EMAIL,
        [inscription.email],
    )


@shared_task
def notifier_nouveau_message_contact(message_id):
    message = MessageContact.objects.get(pk=message_id)
    recipients = _recipients()
    if recipients:
        send_mail(
            f'Nouveau message : {message.sujet}',
            message.message,
            settings.DEFAULT_FROM_EMAIL,
            recipients,
        )
