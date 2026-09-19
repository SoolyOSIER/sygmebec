from rest_framework.permissions import BasePermission

from sygmebec_backend.apps.accounts.permissions import role_priority_for_access


class IsSportsEditor(BasePermission):
    """Writers use an authenticated back-office role; public visitors cannot publish."""

    message = 'Un rôle éditorial est requis pour modifier la rédaction sportive.'

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated or not user.is_active:
            return False
        return bool(getattr(user, 'is_staff', False) or role_priority_for_access(user) >= 1)

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)
