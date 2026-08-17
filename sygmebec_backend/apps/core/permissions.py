from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Object-level permission to only allow owners of an object to edit it."""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by == request.user

class IsOwnerOrRole(permissions.BasePermission):
    """Allow access if user is owner or has required role."""
    
    def __init__(self, required_role=None):
        self.required_role = required_role
    
    def has_object_permission(self, request, view, obj):
        if request.user == obj.created_by:
            return True
        if self.required_role:
            return request.user.role_acces.nomRole == self.required_role
        return False