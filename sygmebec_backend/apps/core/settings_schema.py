"""Typed settings schema shared with the administration editor."""
from copy import deepcopy
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
import re
from rest_framework.exceptions import ValidationError
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError

def field(label, default, kind='text', **kwargs):
    return dict(label=label, default=default, type=kind, **kwargs)

PERSONAL = {
 'language': field('Langue', 'fr', 'select', options=['fr','ht','en']),
 'timezone': field('Fuseau horaire', 'America/Port-au-Prince'),
 'theme_mode': field('Mode', 'system', 'select', options=['light','dark','system']),
 'use_organization_theme': field("Utiliser le th?me de l?organisation", True, 'boolean'),
 'accent': field('Accent personnel', '#3d63f4', 'color'),
 'ui_brightness': field('Luminosit? (%)', 100, 'number', min=70, max=120),
 'text_scale': field('Taille du texte', 'normal', 'select', options=['small','normal','large','xlarge']),
 'font_family': field('Police', 'Inter', 'select', options=['Inter','Arial','system-ui']),
 'heading_weight': field('?paisseur des titres', '600', 'select', options=['400','600','700']),
 'line_height': field('Interligne', 'normal', 'select', options=['normal','comfortable']),
 'interface_density': field('Densit?', 'comfortable', 'select', options=['compact','comfortable','spacious']),
 'reduce_motion': field('R?duire les animations', False, 'boolean'),
 'high_contrast': field('Contraste renforc?', False, 'boolean'),
 'blue_light_reduction': field('R?duire la lumi?re bleue', False, 'boolean'),
 'disable_shadows': field('D?sactiver les ombres', False, 'boolean'),
 'sidebar_collapsed': field('Menu r?duit au d?marrage', False, 'boolean'),
 'landing_page': field('Accueil apr?s connexion', '/', 'select', options=['/','/membres','/evenements']),
 'date_format': field('Format de date', 'DD/MM/YYYY', 'select', options=['DD/MM/YYYY','YYYY-MM-DD','MM/DD/YYYY']),
 'hour_format': field('Format horaire', '24', 'select', options=['12','24']),
 'table_page_size': field('Lignes par tableau', 25, 'select', options=[10,25,50,100]),
 'email_notifications': field('Notifications par e-mail', True, 'boolean'),
 'internal_notifications': field('Notifications internes', True, 'boolean'),
 'browser_notifications': field('Notifications navigateur', False, 'boolean'),
 'digest': field('Fr?quence des r?sum?s', 'immediate', 'select', options=['immediate','daily','weekly']),
}
ORGANIZATION = {
 'general': {
  'church_name': field("Nom officiel de l??glise", "?glise Baptiste de l?Espoir du Cap-Ha?tien"),
  'acronym': field('Sigle', 'EBEC'), 'address': field('Adresse', ''), 'city': field('Ville', 'Cap-Ha?tien'),
  'country': field('Pays', 'Ha?ti'), 'telephone': field('T?l?phone', ''), 'email': field('E-mail', '', 'email'),
  'website': field('Site internet', ''), 'social_links': field('R?seaux sociaux', ''),
  'timezone': field('Fuseau horaire', 'America/Port-au-Prince'), 'currency': field('Devise', 'HTG'),
  'default_language': field('Langue par d?faut', 'fr', 'select', options=['fr','ht','en']),
  'member_prefix': field('Pr?fixe des membres', 'EBEC'), 'document_prefix': field('Pr?fixe des documents', 'EBEC'),
  'administrative_year': field('Ann?e administrative', 2026, 'number', min=2000, max=2100),
  'signature': field('Signature des communications', 'Secr?tariat EBEC'),
 },
 'appearance': {
  'accent': field('Accent officiel', '#3d63f4', 'color'), 'sidebar': field('Menu lat?ral', '#060335', 'color'),
  'topbar': field('Barre sup?rieure', '#05006b', 'color'), 'button': field('Boutons principaux', '#05006b', 'color'),
  'link': field('Liens en mode clair', '#05006b', 'color'), 'card': field('Cartes en mode clair', '#ffffff', 'color'),
  'border': field('Bordures', '#cbd5e1', 'color'),
 },
 'security': {
  'session_minutes': field('Dur?e maximale de session (minutes)', 480, 'number', min=15, max=10080),
  'password_min_length': field('Longueur minimale du mot de passe', 12, 'number', min=12, max=128),
  'login_attempts': field('?checs avant verrouillage temporaire', 5, 'number', min=3, max=20),
  'lock_minutes': field('Dur?e du verrouillage (minutes)', 15, 'number', min=1, max=1440),
 },
 'backups': {
  'schedule': field('Planification', 'manual', 'select', options=['manual','daily','weekly','monthly']),
  'retain_count': field('Sauvegardes ? conserver', 30, 'number', min=2, max=365),
 },
 'notifications': {
  'new_member': field('Nouveaux membres', True, 'boolean'), 'registration': field('Demandes ? traiter', True, 'boolean'),
  'security': field('Alertes de s?curit?', True, 'boolean'),
  'sender_email': field("Adresse d?exp?dition", '', 'email'),
  'subject': field('Objet du message', 'Notification SYGMEBEC'),
  'body_template': field('Mod?le de message', 'Bonjour, une nouvelle activit? n?cessite votre attention.'),
 },
 'audit': {
  'retention_months': field('Conservation active (mois)', 24, 'number', min=1, max=120),
  'collect_ip': field('Conserver les adresses IP', True, 'boolean'),
  'collect_user_agent': field('Conserver le navigateur', True, 'boolean'),
 }
}
MODULE_ACTIONS = {
 'members':['view','create','update','delete','export'], 'registration':['view','create','approve','reject','delete'],
 'events':['view','create','update','delete','publish','export'], 'gallery':['view','create','update','delete'],
 'reports':['view','create','export','delete'], 'letters':['view','create','update','export','delete'],
}

def defaults(schema):
    return {k: deepcopy(v['default']) for k,v in schema.items()}

def organization():
    from .models import OrganizationSetting
    row = OrganizationSetting.objects.filter(pk=1).first()
    data = row.data if row else {}
    return {k: {**defaults(v), **data.get(k,{})} for k,v in ORGANIZATION.items()} | {'roles': data.get('roles', {})}

def contrast(a,b):
    def lum(h):
        rgb=[int(h[i:i+2],16)/255 for i in (1,3,5)]
        rgb=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in rgb]
        return sum(x*y for x,y in zip(rgb,(.2126,.7152,.0722)))
    x,y=sorted((lum(a),lum(b)))
    return (y+.05)/(x+.05)

def validate(data, schema):
    if not isinstance(data, dict):
        raise ValidationError('Un objet est attendu.')
    errors={}
    for key,value in data.items():
        f=schema.get(key)
        if not f:
            errors[key]='Champ non autoris?.'; continue
        kind=f['type']
        if kind=='boolean' and type(value) is not bool:
            errors[key]='Valeur bool?enne attendue.'
        elif kind=='number' and (type(value) is not int or not f['min']<=value<=f['max']):
            errors[key]=f"Valeur entre {f['min']} et {f['max']}."
        elif kind=='select' and value not in f['options']:
            errors[key]='Choix non autoris?.'
        elif kind in ('text','email','color'):
            if not isinstance(value,str) or len(value)>1000:
                errors[key]='Texte limit? ? 1 000 caract?res.'
            elif kind=='color' and not re.fullmatch(r'#[0-9a-fA-F]{6}',value):
                errors[key]='Couleur hexad?cimale invalide.'
            elif kind=='email' and value:
                try: validate_email(value)
                except DjangoValidationError: errors[key]='E-mail invalide.'
        if key=='timezone':
            try: ZoneInfo(value)
            except (ZoneInfoNotFoundError,TypeError,ValueError): errors[key]='Fuseau horaire inconnu.'
    if errors: raise ValidationError(errors)
    return data

def validate_appearance(data):
    for fg,bg,label in [('#ffffff',data['sidebar'],'Menu'),('#ffffff',data['topbar'],'Barre sup?rieure'),('#ffffff',data['button'],'Bouton'),(data['link'],data['card'],'Lien'),('#0f172a',data['card'],'Texte')]:
        if contrast(fg,bg)<4.5:
            raise ValidationError({'appearance':f'{label} : contraste insuffisant (minimum 4,5:1).'})
