from django.contrib import admin
from .models import Membre, Statut, Fonction, HistoriqueStatut, MembreFonction


class MembreFonctionInline(admin.TabularInline):
    model = MembreFonction
    extra = 0
    autocomplete_fields = ['fonction']


@admin.register(Membre)
class MembreAdmin(admin.ModelAdmin):
    list_display = ['nom', 'prenom', 'statut', 'email', 'telephone', 'telephone_secondaire', 'date_adhesion']
    list_filter = ['statut', 'sexe', 'date_adhesion']
    search_fields = ['nom', 'prenom', 'email', 'telephone', 'telephone_secondaire', 'eglise_origine']
    readonly_fields = ['date_adhesion', 'created_at', 'updated_at']
    inlines = [MembreFonctionInline]
@admin.register(Statut)
class StatutAdmin(admin.ModelAdmin):
    list_display = ['id', 'libelle']
    search_fields = ['libelle']

@admin.register(Fonction)
class FonctionAdmin(admin.ModelAdmin):
    list_display = ['id', 'nomFonction', 'dateDebut', 'dateFin']
    search_fields = ['nomFonction']

@admin.register(HistoriqueStatut)
class HistoriqueStatutAdmin(admin.ModelAdmin):
    list_display = ['membre', 'ancien_statut', 'nouveau_statut', 'date_changement']
    list_filter = ['date_changement']
    search_fields = ['membre__nom', 'membre__prenom']

@admin.register(MembreFonction)
class MembreFonctionAdmin(admin.ModelAdmin):
    list_display = ['membre', 'fonction', 'date_assignation']
