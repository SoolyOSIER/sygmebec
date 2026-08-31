from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Utilisateur, RoleAcces

@admin.register(Utilisateur)
class UtilisateurAdmin(UserAdmin):
    list_display = ['identifiant', 'role_acces', 'telephone', 'membre', 'is_active', 'date_creation_compte']
    list_filter = ['role_acces', 'is_active', 'is_staff']
    search_fields = ['identifiant', 'telephone']
    ordering = ['-date_creation_compte']
    
    fieldsets = (
        (None, {'fields': ('identifiant', 'password')}),
        ('Informations', {'fields': ('role_acces', 'telephone', 'membre', 'dernier_acces')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('identifiant', 'telephone', 'password1', 'password2', 'role_acces'),
        }),
    )

@admin.register(RoleAcces)
class RoleAccesAdmin(admin.ModelAdmin):
    list_display = ['id', 'nomRole']
    list_filter = ['nomRole']
