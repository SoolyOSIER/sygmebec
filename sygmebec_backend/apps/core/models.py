from django.db import models


class TimeStampedModel(models.Model):
    """Abstract model with created_at and updated_at timestamps."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class AuditLog(models.Model):
    """Simple audit log for tracking create/update/delete actions across the app."""

    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
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