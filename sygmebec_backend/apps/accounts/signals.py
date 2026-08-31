import json

from django.db import transaction
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.core.serializers.json import DjangoJSONEncoder

from .models import Utilisateur
from sygmebec_backend.apps.core.models import AuditLog
from django.forms.models import model_to_dict


ACCOUNT_AUDIT_EXCLUDED_FIELDS = frozenset({'password', 'groups', 'user_permissions'})


def account_audit_snapshot(instance):
    """Build a JSON-safe account snapshot without authentication data."""
    snapshot = model_to_dict(instance, exclude=ACCOUNT_AUDIT_EXCLUDED_FIELDS)
    return json.loads(json.dumps(snapshot, cls=DjangoJSONEncoder))


@receiver(pre_save, sender=Utilisateur)
def capture_utilisateur_changed_fields(sender, instance, update_fields=None, raw=False, **kwargs):
    """Keep enough context for post_save to distinguish password-only saves."""
    if raw or not instance.pk:
        instance._account_audit_changed_fields = set()
        return

    if update_fields is not None:
        instance._account_audit_changed_fields = set(update_fields)
        return

    previous = sender.objects.filter(pk=instance.pk).first()
    if previous is None:
        instance._account_audit_changed_fields = set()
        return

    instance._account_audit_changed_fields = {
        field.name
        for field in instance._meta.fields
        if getattr(previous, field.attname) != getattr(instance, field.attname)
    }

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
def utilisateur_audit_log(sender, instance, created, raw=False, **kwargs):
    if raw:
        return

    try:
        # actor not available in this signal; leave null
        with transaction.atomic():
            changed_fields = getattr(instance, '_account_audit_changed_fields', set())
            password_changed = 'password' in changed_fields

            if not created and changed_fields == {'password'}:
                changes = {'password_reset': True}
            else:
                changes = account_audit_snapshot(instance)
                if password_changed:
                    changes['password_reset'] = True

            AuditLog.objects.create(
                actor=None,
                action='create' if created else 'update',
                content_type=sender.__name__,
                object_id=str(instance.pk),
                object_repr=str(instance),
                changes=changes
            )
    except Exception:
        pass
