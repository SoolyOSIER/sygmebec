from django.contrib import admin

from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['titre', 'type_conversation', 'est_active', 'created_at', 'updated_at']
    list_filter = ['type_conversation', 'est_active']
    search_fields = ['titre']
    filter_horizontal = ['participants']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'auteur', 'created_at', 'est_systeme']
    list_filter = ['est_systeme', 'created_at']
    search_fields = ['contenu', 'auteur__identifiant', 'conversation__titre']
    filter_horizontal = ['lu_par']
