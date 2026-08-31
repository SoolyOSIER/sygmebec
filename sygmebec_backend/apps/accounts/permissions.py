from rest_framework import permissions

# Role hierarchy - matches the use case diagram generalization
HIERARCHIE = {
    'SECRETAIRE': 1,
    'PASTEUR': 2,
    'ADMINISTRATEUR': 3,
}

class IsSecretaireOrPlus(permissions.BasePermission):
    """Allow access to users with SECRETAIRE role or higher."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        user_role = request.user.role_acces.nomRole if request.user.role_acces else None
        return HIERARCHIE.get(user_role, 0) >= HIERARCHIE['SECRETAIRE']
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsPasteurOrPlus(permissions.BasePermission):
    """Allow access to users with PASTEUR role or higher."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        user_role = request.user.role_acces.nomRole if request.user.role_acces else None
        return HIERARCHIE.get(user_role, 0) >= HIERARCHIE['PASTEUR']
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsAdministrateur(permissions.BasePermission):
    """Allow access only to users with ADMINISTRATEUR role."""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        user_role = request.user.role_acces.nomRole if request.user.role_acces else None
        return user_role == 'ADMINISTRATEUR'
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access if user is the owner or an administrator."""
    
    def has_object_permission(self, request, view, obj):
        if request.user.role_acces.nomRole == 'ADMINISTRATEUR':
            return True
        
        # Check if obj has a created_by or user attribute
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'utilisateur'):
            return obj.utilisateur == request.user
        
        return False