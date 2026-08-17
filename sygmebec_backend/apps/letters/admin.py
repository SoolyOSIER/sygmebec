from django.contrib import admin

from .models import Lettre


@admin.register(Lettre)
class LettreAdmin(admin.ModelAdmin):
    list_display = ['reference', 'type_lettre', 'membre', 'destinataire', 'date_emission']
    list_filter = ['type_lettre', 'date_emission']
    search_fields = ['reference', 'membre__nom', 'membre__prenom', 'destinataire']
