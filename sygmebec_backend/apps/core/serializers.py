from rest_framework import serializers
from .models import AuditLog


REDACTED_AUDIT_VALUE = '[masqué]'
SENSITIVE_AUDIT_KEYS = frozenset({
    'access_token',
    'api_key',
    'authorization',
    'current_password',
    'groups',
    'hash',
    'hashed_password',
    'mot_de_passe',
    'motdepasse',
    'new_password',
    'new_password_confirm',
    'old_password',
    'password',
    'password1',
    'password2',
    'password_confirm',
    'password_digest',
    'password_hash',
    'refresh_token',
    'secret',
    'secret_key',
    'token',
    'user_permissions',
})


def _is_sensitive_audit_key(key):
    normalized_key = str(key).lower().replace('-', '_').replace(' ', '_')
    return (
        normalized_key in SENSITIVE_AUDIT_KEYS
        or normalized_key.endswith('_password')
        or normalized_key.endswith('_password_hash')
    )


def redact_audit_changes(value):
    """Return a recursively redacted copy of an audit payload."""
    if isinstance(value, dict):
        return {
            key: REDACTED_AUDIT_VALUE if _is_sensitive_audit_key(key) else redact_audit_changes(item)
            for key, item in value.items()
        }
    if isinstance(value, list):
        return [redact_audit_changes(item) for item in value]
    if isinstance(value, tuple):
        return [redact_audit_changes(item) for item in value]
    return value


class AuditLogSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(source='timestamp', read_only=True)
    target_type = serializers.CharField(source='content_type', read_only=True)
    target_id = serializers.CharField(source='object_id', read_only=True)
    target_label = serializers.CharField(source='object_repr', read_only=True)
    archive_batch = serializers.SerializerMethodField()
    before_data = serializers.SerializerMethodField()
    after_data = serializers.SerializerMethodField()
    metadata = serializers.SerializerMethodField()
    actor = serializers.SerializerMethodField()
    changes = serializers.SerializerMethodField()
    class Meta:
        model = AuditLog
        fields = ['id', 'actor', 'action', 'content_type', 'object_id', 'object_repr', 'target_type', 'target_id', 'target_label', 'changes', 'timestamp', 'created_at', 'actor_identifier', 'actor_role', 'action_label', 'module', 'severity', 'status', 'before_data', 'after_data', 'changed_fields', 'summary', 'request_id', 'ip_address', 'user_agent', 'source', 'metadata', 'archive_batch']
        read_only_fields = fields
    def get_actor(self, obj):
        if obj.actor:
            return {'id': obj.actor.id, 'identifiant': obj.actor.identifiant}
        return None

    def get_archive_batch(self, obj):
        archive = next(iter(obj.archives.all()), None)
        return archive.pk if archive else None

    def get_changes(self, obj):
        return redact_audit_changes(obj.changes)

    def get_before_data(self,obj):
        from .audit import sanitize
        return sanitize(obj.before_data)
    def get_after_data(self,obj):
        from .audit import sanitize
        return sanitize(obj.after_data)
    def get_metadata(self,obj):
        from .audit import sanitize
        return sanitize(obj.metadata)
