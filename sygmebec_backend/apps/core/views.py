from rest_framework import viewsets, permissions
from .models import AuditLog
from .serializers import AuditLogSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and getattr(request.user, 'role_acces', None) and request.user.role_acces.nomRole == 'ADMINISTRATEUR'


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related('actor').all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
