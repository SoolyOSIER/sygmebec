from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.conf import settings
from django.db import transaction
from django.db.models import Q
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from sygmebec_backend.apps.members.models import Membre, Statut

from .models import Utilisateur, RoleAcces
from .serializers import (
    UtilisateurSerializer, UtilisateurCreateSerializer,
    UtilisateurUpdateSerializer, UtilisateurRegistrationSerializer,
    ChangerMotDePasseSerializer, ChangerMonMotDePasseSerializer, LoginSerializer, RoleAccesSerializer,
    MonProfilMembreSerializer
)
from .permissions import IsAdministrateur, IsSecretaireOrPlus
from .security import notify_primary_admin_of_login


def blacklist_outstanding_refresh_tokens(user):
    """Invalidate every refresh token previously issued to the user."""
    for outstanding_token in OutstandingToken.objects.filter(user=user).only('id'):
        BlacklistedToken.objects.get_or_create(token=outstanding_token)


class LoginView(TokenObtainPairView):
    """Custom login view with cookie-based refresh token."""
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        identifiant = serializer.validated_data['identifiant'].strip()
        password = serializer.validated_data['password']
        
        from django.contrib.auth import authenticate
        # L'identifiant est traité sans tenir compte des majuscules. Un membre
        # peut également se connecter avec l'adresse e-mail enregistrée sur sa fiche.
        compte = Utilisateur.objects.select_related('membre').filter(
            Q(identifiant__iexact=identifiant) | Q(membre__email__iexact=identifiant)
        ).order_by('-is_administrateur_principal', 'id').first()
        user = authenticate(identifiant=compte.identifiant, password=password) if compte else None
        
        if not user:
            return Response(
                {'error': 'Identifiant ou mot de passe incorrect.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {'error': 'Ce compte est désactivé.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # The ADMINISTRATEUR role is reserved for the one designated owner.
        # This remains server-side so a direct API request cannot bypass it.
        if user.role_acces_id and user.role_acces.nomRole == 'ADMINISTRATEUR' and not user.est_administrateur_principal:
            notify_primary_admin_of_login(user=user, request=request, blocked=True)
            return Response(
                {'error': "Seul l'administrateur principal est autorisé à se connecter avec le rôle Administrateur."},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        refresh = RefreshToken.for_user(user)
        
        # Update last access
        user.dernier_acces = timezone.now()
        user.save(update_fields=['dernier_acces'])

        # Notify the owner immediately for every successful login performed by
        # another account. The notification deliberately excludes secrets.
        if not user.is_administrateur_principal:
            notify_primary_admin_of_login(user=user, request=request)
        
        response = Response({
            'access': str(refresh.access_token),
            'user': UtilisateurSerializer(user).data,
        })

        # Set refresh token as httpOnly cookie
        response.set_cookie(
            'refresh_token',
            str(refresh),
            httponly=True,
            secure=settings.JWT_COOKIE_SECURE,
            samesite=settings.JWT_COOKIE_SAMESITE,
            max_age=7 * 24 * 3600,  # 7 days
        )
        
        return response


class RegisterView(APIView):
    """Public registration endpoint without role assignment."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UtilisateurRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'message': 'Compte créé avec succès. En attente d\'approbation de l\'administrateur.'},
            status=status.HTTP_201_CREATED
        )


class RoleAccesViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only roles endpoint used by the frontend account form."""
    queryset = RoleAcces.objects.all().order_by('nomRole')
    serializer_class = RoleAccesSerializer
    permission_classes = [IsAdministrateur]


class LogoutView(APIView):
    """Logout view - revokes refresh sessions and clears the browser cookie."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        blacklist_outstanding_refresh_tokens(request.user)
        response = Response({'message': 'Déconnexion réussie.'})
        response.delete_cookie('refresh_token')
        return response


class CookieTokenRefreshView(TokenRefreshView):
    """Refresh token view using httpOnly cookie."""
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response(
                {'error': 'Refresh token manquant.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Use the refresh token to get a new access token
        from rest_framework_simplejwt.tokens import RefreshToken
        from rest_framework_simplejwt.exceptions import TokenError
        
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            
            # Update last access
            user_id = refresh.get('user_id')
            user = Utilisateur.objects.select_related('role_acces').filter(id=user_id).first()
            if not user or not user.is_active:
                return Response(
                    {'error': 'Compte inactif ou introuvable.'},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            if user.role_acces_id and user.role_acces.nomRole == 'ADMINISTRATEUR' and not user.est_administrateur_principal:
                blacklist_outstanding_refresh_tokens(user)
                return Response(
                    {'error': "Ce compte n'est pas autorisé à accéder à l'administration."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            user.dernier_acces = timezone.now()
            user.save(update_fields=['dernier_acces'])
            
            return Response({'access': access_token})
        except TokenError:
            return Response(
                {'error': 'Refresh token invalide ou expiré.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
class MeView(APIView):
    """Get current user information."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UtilisateurSerializer(request.user)
        return Response(serializer.data)


class MonProfilView(APIView):
    """Lets every authenticated account update only its own profile and photo."""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @staticmethod
    def _profile_for(user):
        """Creates the personal member record the first time it is needed."""
        if user.membre_id:
            return user.membre

        statut, _ = Statut.objects.get_or_create(libelle='Actif')
        membre = Membre.objects.create(
            nom=user.identifiant or 'Utilisateur',
            telephone=user.telephone or '',
            statut=statut,
        )
        user.membre = membre
        user.save(update_fields=['membre'])
        return membre

    def get(self, request):
        membre = self._profile_for(request.user)
        if not membre:
            return Response({'detail': 'Aucune fiche membre n’est liée à ce compte.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'membre': MonProfilMembreSerializer(membre, context={'request': request}).data,
            'user': UtilisateurSerializer(request.user, context={'request': request}).data,
        })

    def patch(self, request):
        membre = self._profile_for(request.user)
        if not membre:
            return Response({'detail': 'Aucune fiche membre n’est liée à ce compte.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = MonProfilMembreSerializer(membre, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'membre': MonProfilMembreSerializer(membre, context={'request': request}).data,
            'user': UtilisateurSerializer(request.user, context={'request': request}).data,
        })


class ChangerMonMotDePasseView(APIView):
    """Allows an authenticated person to change only their own password."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangerMonMotDePasseSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save(update_fields=['password'])
        return Response({'message': 'Mot de passe modifié avec succès.'})


class UtilisateurViewSet(viewsets.ModelViewSet):
    """ViewSet for managing users - ADMINISTRATEUR only."""
    queryset = Utilisateur.objects.select_related('role_acces', 'membre').all()
    permission_classes = [IsAdministrateur]
    lookup_field = 'id'
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UtilisateurCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UtilisateurUpdateSerializer
        return UtilisateurSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(identifiant__icontains=search)
        
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role_acces__nomRole=role)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Trigger welcome email
        from .tasks import send_welcome_email
        send_welcome_email.delay(user.id)
        
        return Response(
            UtilisateurSerializer(user).data,
            status=status.HTTP_201_CREATED
        )

    def perform_update(self, serializer):
        """Revoke active sessions when an administrator changes a password."""
        password_changed = bool(serializer.validated_data.get('password'))

        with transaction.atomic():
            user = serializer.save()
            if password_changed:
                blacklist_outstanding_refresh_tokens(user)

        return user
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user.is_administrateur_principal:
            return Response(
                {'error': "L'administrateur principal ne peut pas être supprimé."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, id=None):
        """Réinitialise directement le mot de passe depuis le tableau de bord."""
        user = self.get_object()
        serializer = ChangerMotDePasseSerializer(data=request.data, context={'user': user})
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            user.set_password(serializer.validated_data['new_password'])
            # Keeping update_fields explicit lets the audit signal record only
            # a safe password-reset marker, never a password hash.
            user.save(update_fields=['password'])
            blacklist_outstanding_refresh_tokens(user)

        return Response({'message': 'Mot de passe réinitialisé avec succès.'})
    
    @action(detail=True, methods=['post'])
    def desactiver(self, request, id=None):
        """Deactivate user account."""
        user = self.get_object()
        
        if user == request.user:
            return Response(
                {'error': 'Vous ne pouvez pas désactiver votre propre compte.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_active = not user.is_active
        user.save()
        
        return Response({
            'message': f'Compte {"activé" if user.is_active else "désactivé"} avec succès.'
        })
