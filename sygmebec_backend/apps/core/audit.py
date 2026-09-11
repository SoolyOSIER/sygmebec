"""Central audit writer. No request bodies, credentials or document contents."""
from contextvars import ContextVar
from datetime import date, datetime
import ipaddress
import re
from django.db import transaction
from django.db.models.signals import pre_save, post_save, post_delete
from django.utils import timezone

request_context = ContextVar('audit_request', default=None)
suspended = ContextVar('audit_suspended', default=False)
SENSITIVE = re.compile(r'password|mot.?de.?passe|token|cookie|secret|authorization|session|otp|2fa|api.?key|smtp|bank|carte|contenu|content|body|message|document', re.I)
MODULES = {'accounts': 'USERS', 'members': 'MEMBERS', 'events': 'EVENTS', 'vitrine': 'GALLERY', 'reports': 'REPORTS', 'letters': 'LETTERS', 'core': 'SETTINGS'}
PREFIXES = {'Utilisateur': 'USER', 'Membre': 'MEMBER', 'Evenement': 'EVENT', 'DemandeAdhesion': 'REGISTRATION', 'ImageGalerie': 'GALLERY_IMAGE', 'Rapport': 'REPORT', 'Lettre': 'LETTER', 'OrganizationSetting': 'SETTINGS', 'UserPreference': 'PREFERENCES'}


def sanitize(value, depth=0):
    if depth > 8:
        return '[limit?]'
    if isinstance(value, dict):
        return {str(k)[:100]: '[masqu?]' if SENSITIVE.search(str(k)) else sanitize(v, depth+1) for k,v in list(value.items())[:100]}
    if isinstance(value, (list, tuple)):
        return [sanitize(v, depth+1) for v in value[:100]]
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, str):
        if re.search(r'Bearer |eyJ[A-Za-z0-9_-]+\.|(?:password|secret|token)=|pbkdf2_|argon2', value, re.I):
            return '[masqu?]'
        return value[:500]
    if value is None or isinstance(value, (int, float, bool)):
        return value
    return '[fichier]' if hasattr(value, 'read') or hasattr(value, 'name') else '[valeur]'


def snapshot(obj):
    result = {}
    for field in obj._meta.concrete_fields:
        if SENSITIVE.search(field.name) or field.name in {'last_login', 'dernier_acces', 'updated_at', 'created_at', 'email', 'telephone', 'adresse'}:
            continue
        value = getattr(obj, field.attname, None)
        result[field.name] = sanitize(value)
    return result


def client_ip(request):
    try:
        return str(ipaddress.ip_address(request.META.get('REMOTE_ADDR', '')))
    except (ValueError, AttributeError):
        return None


def log_audit(*, action, module='SYSTEM', actor=None, target=None, before_data=None, after_data=None, request=None, status='SUCCESS', severity='INFO', summary='', metadata=None, source=None):
    from .models import AuditLog, AdminNotification
    request = request or request_context.get()
    actor = actor or getattr(request, 'user', None)
    if not getattr(actor, 'is_authenticated', False):
        actor = None
    before, after = sanitize(before_data or {}), sanitize(after_data or {})
    fields = [k for k in before.keys() | after.keys() if before.get(k) != after.get(k)]
    # Store only the actual differences, not repeated full records.
    if before:
        before, after = ({k: before.get(k) for k in fields}, {k: after.get(k) for k in fields})
    entry = AuditLog.objects.create(
        actor=actor, action=action, action_label=summary or action.replace('_', ' ').capitalize(),
        module=module, status=status, severity=severity, summary=summary or action.replace('_', ' ').capitalize(),
        content_type=target.__class__.__name__ if target else '', object_id=str(target.pk) if target else '',
        object_repr=f'{target.__class__.__name__} #{target.pk}' if target else '',
        before_data=before, after_data=after, changed_fields=fields, changes=after,
        request_id=getattr(request, 'request_id', ''), ip_address=client_ip(request),
        user_agent=sanitize((getattr(request, 'META', {}).get('HTTP_USER_AGENT') or '')[:300]),
        metadata=sanitize(metadata or {}), source=source or ('WEB' if request else 'SYSTEM'))
    if severity in {'SECURITY', 'CRITICAL'}:
        AdminNotification.objects.create(title=entry.action_label, audit=entry)
    return entry


def capture_before(sender, instance, raw=False, **kwargs):
    if raw or suspended.get() or sender.__name__ not in PREFIXES:
        return
    old = sender._base_manager.filter(pk=instance.pk).first() if instance.pk else None
    instance._audit_before = snapshot(old) if old else {}
    instance._audit_password_changed = bool(old and hasattr(old, 'password') and old.password != instance.password)


def record_save(sender, instance, created, raw=False, **kwargs):
    if raw or suspended.get() or sender.__name__ not in PREFIXES:
        return
    before, after = getattr(instance, '_audit_before', {}), snapshot(instance)
    if not created and before == after and not getattr(instance, '_audit_password_changed', False):
        return
    prefix = PREFIXES[sender.__name__]
    action = prefix + ('_CREATED' if created else '_UPDATED')
    severity = 'INFO'
    if not created:
        if before.get('deleted_at') != after.get('deleted_at'):
            action = prefix + ('_TRASHED' if after.get('deleted_at') else '_RESTORED')
        elif before.get('role_acces') != after.get('role_acces'):
            action, severity = 'USER_ROLE_CHANGED', 'SECURITY'
        elif before.get('is_active') != after.get('is_active'):
            action, severity = 'USER_STATUS_CHANGED', 'SECURITY'
        elif before.get('statut') != after.get('statut'):
            action = prefix + '_STATUS_CHANGED'
        elif getattr(instance, '_audit_password_changed', False):
            action, severity = 'AUTH_PASSWORD_CHANGED', 'SECURITY'
    module = 'REGISTRATION' if prefix == 'REGISTRATION' else MODULES.get(sender._meta.app_label, 'SYSTEM')
    log_audit(action=action, module=module, target=instance, before_data=before, after_data=after, severity=severity)


def record_delete(sender, instance, **kwargs):
    if not suspended.get() and sender.__name__ in PREFIXES:
        log_audit(action=PREFIXES[sender.__name__]+'_DELETED', module=MODULES.get(sender._meta.app_label, 'SYSTEM'), target=instance, before_data=snapshot(instance), severity='CRITICAL')


def connect_signals():
    pre_save.connect(capture_before, dispatch_uid='central_audit_before', weak=False)
    post_save.connect(record_save, dispatch_uid='central_audit_after', weak=False)
    post_delete.connect(record_delete, dispatch_uid='central_audit_delete', weak=False)
