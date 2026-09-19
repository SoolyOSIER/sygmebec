"""Validated, server-owned schema for the SYGMEBEC settings interface."""

from copy import deepcopy
import re
from urllib.parse import urlparse
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from rest_framework.exceptions import ValidationError


def field(label, default, kind='text', **kwargs):
    return {'label': label, 'default': default, 'type': kind, **kwargs}


PERSONAL = {
    'language': field('Langue', 'fr', 'select', options=['fr', 'ht', 'en']),
    'timezone': field('Fuseau horaire', 'America/Port-au-Prince'),
    'theme_mode': field('Mode', 'system', 'select', options=['light', 'dark', 'system']),
    'use_organization_theme': field("Utiliser le thème de l’organisation", True, 'boolean'),
    'accent': field('Accent personnel', '#3d63f4', 'color'),
    'ui_brightness': field('Luminosité (%)', 100, 'number', min=70, max=120),
    'text_scale': field('Taille du texte', 'normal', 'select', options=['small', 'normal', 'large', 'xlarge']),
    'font_family': field('Police', 'Inter', 'select', options=['Inter', 'Arial', 'system-ui']),
    'heading_weight': field('Épaisseur des titres', '600', 'select', options=['400', '600', '700']),
    'line_height': field('Interligne', 'normal', 'select', options=['normal', 'comfortable']),
    'interface_density': field('Densité', 'comfortable', 'select', options=['compact', 'comfortable', 'spacious']),
    'reduce_motion': field('Réduire les animations', False, 'boolean'),
    'high_contrast': field('Contraste renforcé', False, 'boolean'),
    'blue_light_reduction': field('Réduire la lumière bleue', False, 'boolean'),
    'disable_shadows': field('Désactiver les ombres', False, 'boolean'),
    'sidebar_collapsed': field('Menu réduit au démarrage', False, 'boolean'),
    'landing_page': field('Accueil après connexion', '/', 'select', options=['/', '/membres', '/evenements']),
    'date_format': field('Format de date', 'DD/MM/YYYY', 'select', options=['DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY']),
    'hour_format': field('Format horaire', '24', 'select', options=['12', '24']),
    'table_page_size': field('Lignes par tableau', 25, 'select', options=[10, 25, 50, 100]),
    'visible_columns': field('Colonnes visibles', {}, 'json'),
    'saved_filters': field('Préférences de filtres', {}, 'json'),
    'email_notifications': field('Notifications par e-mail', True, 'boolean'),
    'internal_notifications': field('Notifications internes', True, 'boolean'),
    'browser_notifications': field('Notifications navigateur', False, 'boolean'),
    'digest': field('Fréquence des résumés', 'immediate', 'select', options=['immediate', 'daily', 'weekly']),
}


ORGANIZATION = {
    'general': {
        'church_name': field("Nom officiel de l’église", "Église Baptiste de l’Espoir du Cap-Haïtien"),
        'acronym': field('Sigle', 'EBEC'),
        'address': field('Adresse', ''),
        'city': field('Ville', 'Cap-Haïtien'),
        'country': field('Pays', 'Haïti'),
        'telephone': field('Téléphone', ''),
        'email': field('E-mail', '', 'email'),
        'website': field('Site internet', '', 'url'),
        'social_links': field('Réseaux sociaux', ''),
        'timezone': field('Fuseau horaire', 'America/Port-au-Prince'),
        'currency': field('Devise', 'HTG'),
        'default_language': field('Langue par défaut', 'fr', 'select', options=['fr', 'ht', 'en']),
        'member_prefix': field('Préfixe des membres', 'EBEC'),
        'document_prefix': field('Préfixe des documents', 'EBEC'),
        'administrative_year': field('Année administrative', 2026, 'number', min=2000, max=2100),
        'signature': field('Signature des communications', 'Secrétariat EBEC'),
    },
    'appearance': {
        'accent': field('Accent officiel', '#3d63f4', 'color'),
        'sidebar': field('Menu latéral', '#060335', 'color'),
        'topbar': field('Barre supérieure', '#05006b', 'color'),
        'button': field('Boutons principaux', '#05006b', 'color'),
        'link': field('Liens en mode clair', '#05006b', 'color'),
        'card': field('Cartes en mode clair', '#ffffff', 'color'),
        'border': field('Bordures', '#cbd5e1', 'color'),
    },
    'security': {
        'session_minutes': field('Durée maximale de session (minutes)', 480, 'number', min=15, max=10080),
        'password_min_length': field('Longueur minimale du mot de passe', 12, 'number', min=12, max=128),
        'login_attempts': field('Échecs avant verrouillage temporaire', 5, 'number', min=3, max=20),
        'lock_minutes': field('Durée du verrouillage (minutes)', 15, 'number', min=1, max=1440),
    },
    'backups': {
        'schedule': field('Planification', 'manual', 'select', options=['manual', 'daily', 'weekly', 'monthly']),
        'retain_count': field('Sauvegardes à conserver', 30, 'number', min=2, max=365),
    },
    'notifications': {
        'new_member': field('Nouveaux membres', True, 'boolean'),
        'registration': field('Demandes à traiter', True, 'boolean'),
        'security': field('Alertes de sécurité', True, 'boolean'),
        'sender_email': field("Adresse d’expédition", '', 'email'),
        'subject': field('Objet du message', 'Notification SYGMEBEC'),
        'body_template': field(
            'Modèle de message',
            'Bonjour, une nouvelle activité nécessite votre attention.',
            multiline=True,
        ),
    },
    'audit': {
        'retention_months': field('Conservation active (mois)', 24, 'number', min=1, max=120),
        'collect_ip': field('Conserver les adresses IP', True, 'boolean'),
        'collect_user_agent': field('Conserver le navigateur', True, 'boolean'),
    },
}

MODULE_ACTIONS = {
    'members': ['view', 'create', 'update', 'delete', 'export'],
    'registration': ['view', 'create', 'approve', 'reject', 'delete'],
    'events': ['view', 'create', 'update', 'delete', 'publish', 'export'],
    'gallery': ['view', 'create', 'update', 'delete'],
    'reports': ['view', 'create', 'export', 'delete'],
    'letters': ['view', 'create', 'update', 'export', 'delete'],
}


def defaults(schema):
    return {key: deepcopy(value['default']) for key, value in schema.items()}


def organization():
    from .models import OrganizationSetting

    row = OrganizationSetting.objects.filter(pk=1).first()
    # A malformed legacy JSON value must not prevent authentication, auditing
    # or the settings page from working.  The API only writes validated data,
    # but this defensive read also protects upgrades and manual recovery work.
    saved = row.data if row and isinstance(row.data, dict) else {}
    data = {
        section: {
            **defaults(section_schema),
            **{
                key: value
                for key, value in saved.get(section, {}).items()
                if key in section_schema
            },
        }
        for section, section_schema in ORGANIZATION.items()
        if isinstance(saved.get(section, {}), dict)
    }
    # The comprehension above skips a corrupt section entirely; put its
    # defaults back so callers always receive the complete schema.
    for section, section_schema in ORGANIZATION.items():
        data.setdefault(section, defaults(section_schema))
    roles = saved.get('roles', {})
    data['roles'] = roles if isinstance(roles, dict) else {}
    return data


def contrast(first, second):
    def luminance(value):
        channels = [int(value[index:index + 2], 16) / 255 for index in (1, 3, 5)]
        channels = [channel / 12.92 if channel <= .04045 else ((channel + .055) / 1.055) ** 2.4 for channel in channels]
        return sum(channel * coefficient for channel, coefficient in zip(channels, (.2126, .7152, .0722)))

    low, high = sorted((luminance(first), luminance(second)))
    return (high + .05) / (low + .05)


def validate(data, schema):
    if not isinstance(data, dict):
        raise ValidationError('Un objet est attendu.')

    errors = {}
    for key, value in data.items():
        config = schema.get(key)
        if not config:
            errors[key] = 'Champ non autorisé.'
            continue

        kind = config['type']
        if kind == 'boolean' and type(value) is not bool:
            errors[key] = 'Valeur booléenne attendue.'
        elif kind == 'number' and (type(value) is not int or not config['min'] <= value <= config['max']):
            errors[key] = f"Valeur entre {config['min']} et {config['max']}."
        elif kind == 'select' and value not in config['options']:
            errors[key] = 'Choix non autorisé.'
        elif kind == 'json' and not isinstance(value, (dict, list)):
            errors[key] = 'Objet ou liste attendu.'
        elif kind in ('text', 'email', 'color', 'url'):
            if not isinstance(value, str) or len(value) > 1000:
                errors[key] = 'Texte limité à 1 000 caractères.'
            elif kind == 'color' and not re.fullmatch(r'#[0-9a-fA-F]{6}', value):
                errors[key] = 'Couleur hexadécimale invalide.'
            elif kind == 'email' and value:
                try:
                    validate_email(value)
                except DjangoValidationError:
                    errors[key] = 'E-mail invalide.'
            elif kind == 'url' and value:
                parsed = urlparse(value)
                if parsed.scheme not in {'http', 'https'} or not parsed.netloc:
                    errors[key] = 'Adresse internet invalide.'

        if key == 'timezone' and isinstance(value, str):
            try:
                ZoneInfo(value)
            except (ZoneInfoNotFoundError, TypeError, ValueError):
                errors[key] = 'Fuseau horaire inconnu.'

    if errors:
        raise ValidationError(errors)
    return data


def validate_appearance(data):
    pairs = [
        ('#ffffff', data['sidebar'], 'Menu latéral'),
        ('#ffffff', data['topbar'], 'Barre supérieure'),
        ('#ffffff', data['button'], 'Bouton'),
        (data['link'], data['card'], 'Lien'),
        ('#0f172a', data['card'], 'Texte'),
    ]
    for foreground, background, label in pairs:
        if contrast(foreground, background) < 4.5:
            raise ValidationError({'appearance': f'{label} : contraste insuffisant (minimum 4,5:1).'})
