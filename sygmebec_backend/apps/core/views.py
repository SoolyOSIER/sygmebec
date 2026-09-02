from rest_framework import viewsets
from .models import AuditLog
from .serializers import AuditLogSerializer
from sygmebec_backend.apps.accounts.permissions import IsAdministrateur


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related('actor').all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdministrateur]
