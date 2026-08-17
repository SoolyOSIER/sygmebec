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
from django.db.models import Q
from sygmebec_backend.apps.members.models import Membre, Statut

from .models import Utilisateur, RoleAcces
from .serializers import (
    UtilisateurSerializer, UtilisateurCreateSerializer,
    UtilisateurUpdateSerializer, UtilisateurRegistrationSerializer,
    ChangerMotDePasseSerializer, ChangerMonMotDePasseSerializer, LoginSerializer, RoleAccesSerializer,
    MonProfilMembreSerializer
)
from .permissions import IsAdministrateur, IsSecretaireOrPlus


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
        ).first()
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
        
        refresh = RefreshToken.for_user(user)
        
        # Update last access
        user.dernier_acces = timezone.now()
        user.save(update_fields=['dernier_acces'])
        
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
    """Logout view - clears refresh token cookie."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
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
            user = Utilisateur.objects.filter(id=user_id).first()
            if user and user.is_active:
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
    
    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, id=None):
        """Réinitialise directement le mot de passe depuis le tableau de bord."""
        user = self.get_object()
        serializer = ChangerMotDePasseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
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
