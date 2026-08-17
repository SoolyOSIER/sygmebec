from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    actor = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id', 'actor', 'action', 'content_type', 'object_id', 'object_repr', 'changes', 'timestamp']

    def get_actor(self, obj):
        if obj.actor:
            return {'id': obj.actor.id, 'identifiant': obj.actor.identifiant}
        return None
