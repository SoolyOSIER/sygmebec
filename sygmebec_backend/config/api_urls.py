from django.urls import path, include
from rest_framework.routers import DefaultRouter

from sygmebec_backend.apps.accounts.views import (
    LoginView, RegisterView, LogoutView, CookieTokenRefreshView,
    MeView, MonProfilView, ChangerMonMotDePasseView, UtilisateurViewSet, RoleAccesViewSet
)
from sygmebec_backend.apps.members.views import (
    MembreViewSet, StatutViewSet, FonctionViewSet,
    HistoriqueStatutListView
)
from sygmebec_backend.apps.events.views import EvenementViewSet, TypeEvenementViewSet
from sygmebec_backend.apps.reports.views import RapportViewSet
from sygmebec_backend.apps.letters.views import LettreViewSet
from sygmebec_backend.apps.chat.views import ConversationViewSet, MessageViewSet
from sygmebec_backend.apps.core.views import AuditLogViewSet
from sygmebec_backend.apps.vitrine.views import DemandeAdhesionViewSet, ImageGalerieViewSet

# Router
router = DefaultRouter()
router.register(r'utilisateurs', UtilisateurViewSet, basename='utilisateur')
router.register(r'roles', RoleAccesViewSet, basename='role')
router.register(r'membres', MembreViewSet, basename='membre')
router.register(r'statuts', StatutViewSet, basename='statut')
router.register(r'fonctions', FonctionViewSet, basename='fonction')
router.register(r'evenements', EvenementViewSet, basename='evenement')
router.register(r'types-evenements', TypeEvenementViewSet, basename='type-evenement')
router.register(r'rapports', RapportViewSet, basename='rapport')
router.register(r'lettres', LettreViewSet, basename='lettre')
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'historiques-statut', HistoriqueStatutListView, basename='historique-statut')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')
router.register(r'demandes-adhesion', DemandeAdhesionViewSet, basename='demande-adhesion')
router.register(r'galerie-images', ImageGalerieViewSet, basename='galerie-image')

urlpatterns = [
    path('settings/', include('sygmebec_backend.apps.core.urls')),
    path('sports/', include('sygmebec_backend.apps.sports.urls')),
    # Auth
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('auth/me/profile/', MonProfilView.as_view(), name='my-profile'),
    path('auth/me/change-password/', ChangerMonMotDePasseView.as_view(), name='my-password'),
    path('public/', include('sygmebec_backend.apps.vitrine.urls_public')),
    path('membre/', include('sygmebec_backend.apps.vitrine.urls_member')),
    
    # API routes
    path('', include(router.urls)),
    
]
