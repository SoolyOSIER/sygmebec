"""Security notifications for account authentication events."""

import logging

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.utils import timezone

from .models import Utilisateur


logger = logging.getLogger(__name__)


def _valid_email(value):
    value = (value or '').strip()
    if not value:
        return ''
    try:
        validate_email(value)
    except ValidationError:
        return ''
    return value


def get_primary_admin_alert_email():
    """Return the configured recipient or the principal account's profile email."""
    configured_email = _valid_email(getattr(settings, 'PRIMARY_ADMIN_ALERT_EMAIL', ''))
    if configured_email:
        return configured_email

    principal = (
        Utilisateur.objects.select_related('membre')
        .filter(is_administrateur_principal=True)
        .first()
    )
    if not principal:
        return ''

    profile_email = _valid_email(getattr(principal.membre, 'email', '') if principal.membre_id else '')
    return profile_email or _valid_email(principal.identifiant)


def client_ip_from_request(request):
    """Use the direct peer address; proxy headers require trusted proxy setup."""
    return request.META.get('REMOTE_ADDR', 'inconnue')


def notify_primary_admin_of_login(*, user, request, blocked=False):
    """Send a best-effort immediate alert without exposing credentials or tokens."""
    recipient = get_primary_admin_alert_email()
    if not recipient:
        logger.error(
            "Alerte de connexion non envoyée : configurez PRIMARY_ADMIN_ALERT_EMAIL "
            "ou renseignez l'e-mail du profil de l'administrateur principal."
        )
        return False

    role = user.role_acces.nomRole if user.role_acces_id else 'Aucun rôle'
    occurred_at = timezone.localtime().strftime('%d/%m/%Y à %H:%M:%S %Z')
    ip_address = client_ip_from_request(request)
    user_agent = (request.META.get('HTTP_USER_AGENT') or 'Non communiqué')[:500]

    if blocked:
        subject = 'SYGMEBEC — tentative d’accès administrateur bloquée'
        event = "Une tentative de connexion avec un compte Administrateur non autorisé a été bloquée."
    else:
        subject = 'SYGMEBEC — nouvelle connexion détectée'
        event = "Un autre compte vient de se connecter à la plateforme."

    message = (
        f"Bonjour,\n\n{event}\n\n"
        f"Compte : {user.identifiant}\n"
        f"Rôle : {role}\n"
        f"Date : {occurred_at}\n"
        f"Adresse IP : {ip_address}\n"
        f"Navigateur : {user_agent}\n\n"
        "Si vous ne reconnaissez pas cette activité, désactivez le compte concerné "
        "ou modifiez immédiatement son mot de passe.\n\n"
        "— SYGMEBEC"
    )

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            fail_silently=False,
        )
    except Exception:
        # A delivery outage must not make the whole platform unavailable, but
        # the server log retains the failure for follow-up.
        logger.exception("Impossible d'envoyer l'alerte de connexion à l'administrateur principal.")
        return False

    return True
