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
    actor = serializers.SerializerMethodField()
    changes = serializers.SerializerMethodField()
    class Meta:
        model = AuditLog
        fields = ['id', 'actor', 'action', 'content_type', 'object_id', 'object_repr', 'changes', 'timestamp']
    def get_actor(self, obj):
        if obj.actor:
            return {'id': obj.actor.id, 'identifiant': obj.actor.identifiant}
        return None

    def get_changes(self, obj):
        return redact_audit_changes(obj.changes)
