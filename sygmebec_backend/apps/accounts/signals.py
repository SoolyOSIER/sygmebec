from django.db import transaction
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings

from .models import Utilisateur
from sygmebec_backend.apps.core.models import AuditLog
from django.forms.models import model_to_dict
from django.contrib.auth import get_user_model

@receiver(post_save, sender=Utilisateur)
def send_welcome_email(sender, instance, created, **kwargs):
    """Send welcome email when a new user is created."""
    if created:
        subject = 'Bienvenue sur SYGMEBEC'
        message = f'''
        Bonjour {instance.identifiant},
        
        Votre compte a été créé avec succès sur la plateforme SYGMEBEC.
        
        Identifiant : {instance.identifiant}
        Rôle : {instance.role_acces.nomRole if instance.role_acces else 'Non défini'}
        
        Veuillez contacter l'administrateur pour obtenir votre mot de passe.
        
        Cordialement,
        L'équipe SYGMEBEC
        '''
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [instance.identifiant], fail_silently=True)


@receiver(post_save, sender=Utilisateur)
def utilisateur_audit_log(sender, instance, created, **kwargs):
    try:
        # actor not available in this signal; leave null
        with transaction.atomic():
            AuditLog.objects.create(
                actor=None,
                action='create' if created else 'update',
                content_type=sender.__name__,
                object_id=str(instance.pk),
                object_repr=str(instance),
                changes=model_to_dict(instance)
            )
    except Exception:
        pass
