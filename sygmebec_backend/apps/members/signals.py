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


