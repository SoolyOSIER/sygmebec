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


class ImmutableAuditQuerySet(models.QuerySet):
    def update(self, **kwargs):
        raise ValueError("Les journaux sont immuables.")

    def delete(self):
        raise ValueError("Les journaux ne peuvent pas ?tre supprim?s.")

    def bulk_update(self, *args, **kwargs):
        raise ValueError("Les journaux sont immuables.")

    def bulk_create(self, *args, **kwargs):
        raise ValueError("Utilisez le service log_audit.")


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
    action = models.CharField(max_length=80)
    content_type = models.CharField(max_length=200)
    object_id = models.CharField(max_length=200, null=True, blank=True)
    object_repr = models.TextField(null=True, blank=True)
    changes = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    actor_identifier = models.CharField(max_length=150, blank=True)
    actor_role = models.CharField(max_length=30, blank=True)
    action_label = models.CharField(max_length=160, blank=True)
    module = models.CharField(max_length=30, default='SYSTEM')
    severity = models.CharField(max_length=12, default='INFO')
    status = models.CharField(max_length=10, default='SUCCESS')
    before_data = models.JSONField(default=dict)
    after_data = models.JSONField(default=dict)
    changed_fields = models.JSONField(default=list)
    summary = models.CharField(max_length=300, blank=True)
    request_id = models.CharField(max_length=36, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)
    source = models.CharField(max_length=10, default='SYSTEM')
    metadata = models.JSONField(default=dict)
    objects = ImmutableAuditQuerySet.as_manager()

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValueError("Les journaux sont immuables.")
        from .audit import sanitize
        for field in ('changes', 'before_data', 'after_data', 'metadata'):
            setattr(self, field, sanitize(getattr(self, field)))
        if self.actor_id:
            self.actor_identifier = self.actor.identifiant
            self.actor_role = getattr(self.actor.role_acces, 'nomRole', '')
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValueError("Les journaux ne peuvent pas ?tre supprim?s.")

    class Meta:
        indexes = [models.Index(fields=fields) for fields in (
            ['timestamp'], ['actor', 'timestamp'], ['module', 'timestamp'],
            ['action', 'timestamp'], ['content_type', 'object_id'],
            ['severity', 'timestamp'], ['status', 'timestamp'])]
        db_table = 'audit_log' 
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action} {self.content_type} {self.object_id} by {self.actor} at {self.timestamp}"


class AuditArchive(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    cutoff = models.DateTimeField()
    created_by = models.ForeignKey('accounts.Utilisateur', null=True, on_delete=models.SET_NULL)
    logs = models.ManyToManyField(AuditLog, related_name='archives')


class UserPreference(models.Model):
    user = models.OneToOneField('accounts.Utilisateur', on_delete=models.CASCADE, related_name='preferences')
    data = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)


class OrganizationSetting(models.Model):
    id = models.PositiveSmallIntegerField(primary_key=True, default=1, editable=False)
    data = models.JSONField(default=dict)
    logo = models.ImageField(upload_to='organization/', blank=True)
    updated_by = models.ForeignKey('accounts.Utilisateur', null=True, on_delete=models.SET_NULL)
    updated_at = models.DateTimeField(auto_now=True)


class Backup(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey('accounts.Utilisateur', null=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=16, default='PENDING')
    filename = models.CharField(max_length=200, blank=True)
    size = models.BigIntegerField(default=0)
    checksum = models.CharField(max_length=64, blank=True)
    error = models.CharField(max_length=300, blank=True)


class UserSession(models.Model):
    user = models.ForeignKey('accounts.Utilisateur', on_delete=models.CASCADE, related_name='active_sessions')
    key_hash = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True)
    ip_address = models.GenericIPAddressField(null=True)
    user_agent = models.CharField(max_length=300, blank=True)


class AdminNotification(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=160)
    audit = models.ForeignKey(AuditLog, null=True, on_delete=models.PROTECT)
    read_at = models.DateTimeField(null=True)
