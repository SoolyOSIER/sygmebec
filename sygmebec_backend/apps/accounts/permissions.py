from rest_framework import permissions

# Role hierarchy - matches the use case diagram generalization
HIERARCHIE = {
    'SECRETAIRE': 1,
    'PASTEUR': 2,
    'ADMINISTRATEUR': 3,
}


def role_priority_for_access(user):
    """Return no elevated access for an ADMINISTRATEUR account that is not primary."""
    user_role = user.role_acces.nomRole if user.role_acces else None
    if user_role == 'ADMINISTRATEUR' and not user.est_administrateur_principal:
        return 0
    return HIERARCHIE.get(user_role, 0)

class IsSecretaireOrPlus(permissions.BasePermission):
    """Allow access to users with SECRETAIRE role or higher."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return role_priority_for_access(request.user) >= HIERARCHIE['SECRETAIRE']
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsPasteurOrPlus(permissions.BasePermission):
    """Allow access to users with PASTEUR role or higher."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return role_priority_for_access(request.user) >= HIERARCHIE['PASTEUR']
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsAdministrateur(permissions.BasePermission):
    """Allow access only to the designated primary administrator."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.est_administrateur_principal
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access if user is the owner or the primary administrator."""
    
    def has_object_permission(self, request, view, obj):
        if getattr(request.user, 'est_administrateur_principal', False):
            return True
        
        # Check if obj has a created_by or user attribute
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'utilisateur'):
            return obj.utilisateur == request.user
        
        return False
