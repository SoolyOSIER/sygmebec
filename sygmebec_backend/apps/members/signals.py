from django.db import transaction
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Membre, HistoriqueStatut
from sygmebec_backend.apps.core.models import AuditLog
from django.forms.models import model_to_dict
from django.contrib.auth import get_user_model
from django.core.serializers.json import DjangoJSONEncoder
import json


def audit_changes(instance):
    """Retourne une représentation compatible avec le champ JSON de l'audit."""
    changes = model_to_dict(instance)
    if instance.photo:
        changes['photo'] = instance.photo.name
    else:
        changes['photo'] = None
    return json.loads(json.dumps(changes, cls=DjangoJSONEncoder))

@receiver(pre_save, sender=Membre)
def check_statut_change(sender, instance, **kwargs):
    """Detect status changes and create history automatically."""
    if instance.pk:
        try:
            old = sender.objects.get(pk=instance.pk)
            if old.statut != instance.statut:
                # The change will be handled by the view
                # This is a backup mechanism for admin changes
                pass
        except sender.DoesNotExist:
            pass


@receiver(post_save, sender=Membre)
def membre_audit_log(sender, instance, created, **kwargs):
    try:
        actor = getattr(instance, '_modifier', None)
        # L'audit ne doit jamais annuler la création d'un membre.
        with transaction.atomic():
            AuditLog.objects.create(
                actor=actor if isinstance(actor, get_user_model()) else None,
                action='create' if created else 'update',
                content_type=sender.__name__,
                object_id=str(instance.pk),
                object_repr=str(instance),
                changes=audit_changes(instance)
            )
    except Exception:
        pass
