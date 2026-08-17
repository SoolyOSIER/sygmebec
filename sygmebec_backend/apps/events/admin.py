from django.contrib import admin
from .models import Evenement

@admin.register(Evenement)
class EvenementAdmin(admin.ModelAdmin):
    list_display = ['titre', 'categorie', 'date', 'lieu', 'est_public', 'capacite', 'responsable', 'dateCreation']
    list_filter = ['categorie', 'est_public', 'date', 'lieu']
    search_fields = ['titre', 'categorie', 'lieu', 'description']
    readonly_fields = ['dateCreation', 'created_at', 'updated_at']
