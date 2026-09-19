import hashlib
from datetime import timedelta
from django.utils import timezone
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import UserSession
from .audit import client_ip
from .settings_schema import organization


def session_hash(value):
    return hashlib.sha256(str(value).encode()).hexdigest()


def create_session(user, refresh, request):
    expires = timezone.now()+timedelta(minutes=organization()['security']['session_minutes'])
    refresh.set_exp(from_time=timezone.now(), lifetime=expires-timezone.now())
    # Random reference exists in JWT only; storage contains a one-way hash.
    import secrets
    key=secrets.token_urlsafe(32)
    refresh['sid']=key
    row=UserSession.objects.create(user=user,key_hash=session_hash(key),expires_at=expires,
        ip_address=client_ip(request),user_agent=(request.META.get('HTTP_USER_AGENT') or '')[:300])
    return row


def check_session(token, user):
    key=token.get('sid')
    if not key:
        raise AuthenticationFailed('Session invalide.')
    if not UserSession.objects.filter(user=user,key_hash=session_hash(key),revoked_at__isnull=True,expires_at__gt=timezone.now()).exists():
        raise AuthenticationFailed('Session expirée ou révoquée.')


class SessionJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user=super().get_user(validated_token)
        check_session(validated_token,user)
        return user
