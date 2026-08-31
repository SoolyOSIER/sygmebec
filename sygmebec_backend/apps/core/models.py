from django.db import models
from django.utils import timezone


class TimeStampedModel(models.Model):
    """Abstract model with created_at and updated_at timestamps."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SoftDeleteQuerySet(models.QuerySet):
    """Empêche les suppressions physiques accidentelles sur les données métier."""

    def delete(self):
        return self.update(deleted_at=timezone.now(), deleted_by=None)

    def hard_delete(self):
        return super().delete()


class SoftDeleteManager(models.Manager.from_queryset(SoftDeleteQuerySet)):
    """Gestionnaire par défaut : les éléments de la corbeille restent invisibles."""

    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)


class SoftDeleteModel(TimeStampedModel):
    """Base réutilisable pour déplacer un enregistrement dans la corbeille."""

    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    deleted_by = models.ForeignKey(
        'accounts.Utilisateur',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='deleted_%(class)s_set',
    )

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def soft_delete(self, user=None):
        self.deleted_at = timezone.now()
        self.deleted_by = user if getattr(user, 'is_authenticated', False) else None
        self.save(update_fields=['deleted_at', 'deleted_by', 'updated_at'])

    def restore(self):
        self.deleted_at = None
        self.deleted_by = None
        self.save(update_fields=['deleted_at', 'deleted_by', 'updated_at'])

    def delete(self, using=None, keep_parents=False):
        """Même ``instance.delete()`` place l'objet en corbeille."""
        self.soft_delete()
        return 1, {self._meta.label: 1}


class AuditLog(models.Model):
    """Simple audit log for tracking create/update/delete actions across the app."""

    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('restore', 'Restore'),
    ]

    actor = models.ForeignKey(
        'accounts.Utilisateur',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    content_type = models.CharField(max_length=200)
    object_id = models.CharField(max_length=200, null=True, blank=True)
    object_repr = models.TextField(null=True, blank=True)
    changes = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_log'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.get_action_display()} {self.content_type} {self.object_id} by {self.actor} at {self.timestamp}"
