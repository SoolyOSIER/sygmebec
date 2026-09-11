from django.contrib import admin
from .models import AuditLog
@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display=('timestamp','actor_identifier','action','module','status','severity')
    list_filter=('module','status','severity')
    search_fields=('actor_identifier','action','object_id')
    def has_view_permission(self,request,obj=None):
        return getattr(request.user,'est_administrateur_principal',False)
    def has_add_permission(self,request): return False
    def has_change_permission(self,request,obj=None): return False
    def has_delete_permission(self,request,obj=None): return False
