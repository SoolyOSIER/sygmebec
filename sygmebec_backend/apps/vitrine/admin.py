from django.contrib import admin

from .models import DemandeAdhesion, ImageGalerie, InscriptionEvenement, MessageContact
from .services import valider_demande_adhesion


@admin.register(DemandeAdhesion)
class DemandeAdhesionAdmin(admin.ModelAdmin):
    list_display = ['nom', 'prenom', 'email', 'statut', 'date_demande']
    list_filter = ['statut']
    search_fields = ['nom', 'prenom', 'email']
    actions = ['valider_et_creer_membre', 'rejeter']

    @admin.action(description='Valider et créer le membre correspondant')
    def valider_et_creer_membre(self, request, queryset):
        valides = 0
        for demande in queryset.filter(statut=DemandeAdhesion.EN_ATTENTE):
            try:
                valider_demande_adhesion(demande, request.user)
                valides += 1
            except ValueError as error:
                self.message_user(request, f'{demande}: {error}', level='WARNING')
        if valides:
            self.message_user(request, f'{valides} demande(s) validée(s).')

    @admin.action(description='Rejeter les demandes sélectionnées')
    def rejeter(self, request, queryset):
        queryset.filter(statut=DemandeAdhesion.EN_ATTENTE).update(statut=DemandeAdhesion.REJETEE)


@admin.register(InscriptionEvenement)
class InscriptionEvenementAdmin(admin.ModelAdmin):
    list_display = ['evenement', 'nom', 'prenom', 'email', 'nombre_places', 'date_inscription']
    list_filter = ['evenement']
    search_fields = ['nom', 'prenom', 'email']


@admin.register(MessageContact)
class MessageContactAdmin(admin.ModelAdmin):
    list_display = ['nom', 'sujet', 'date_envoi', 'traite']
    list_filter = ['traite']
    search_fields = ['nom', 'email', 'sujet']
    actions = ['marquer_traite']

    @admin.action(description='Marquer comme traité')
    def marquer_traite(self, request, queryset):
        queryset.update(traite=True)


@admin.register(ImageGalerie)
class ImageGalerieAdmin(admin.ModelAdmin):
    list_display = ['titre', 'evenement', 'ordre', 'date_ajout']
    list_editable = ['ordre']
