from django.contrib import admin
from .models import Rapport, CritereFiltrage

@admin.register(Rapport)
class RapportAdmin(admin.ModelAdmin):
    list_display = ['titre', 'statut', 'dateGeneration', 'genere_par']
    list_filter = ['statut', 'dateGeneration']
    search_fields = ['titre']
    readonly_fields = ['dateGeneration', 'created_at', 'updated_at']

@admin.register(CritereFiltrage)
class CritereFiltrageAdmin(admin.ModelAdmin):
    list_display = ['id', 'statut', 'periode', 'fonction']
    list_filter = ['statut']