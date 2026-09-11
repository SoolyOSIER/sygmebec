"""Private encrypted snapshots and scheduled retention. Never stored under MEDIA_ROOT."""
import base64
import hashlib
import io
import json
import os
from pathlib import Path
import zipfile
from datetime import timedelta
from cryptography.fernet import Fernet
from django.conf import settings
from django.core import serializers
from django.apps import apps
from django.db import transaction
from django.utils import timezone
from .models import Backup, AuditArchive, AuditLog
from .audit import log_audit, suspended
from .settings_schema import organization


def storage():
    root = Path(settings.BASE_DIR)/'private_backups'
    root.mkdir(mode=0o700,exist_ok=True)
    return root


def cipher():
    path=storage()/'.encryption-key'
    configured=os.environ.get('SYGMEBEC_BACKUP_KEY')
    if configured:
        return Fernet(configured.encode())
    try:
        fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
    except FileExistsError:
        pass
    else:
        with os.fdopen(fd,'wb') as f: f.write(Fernet.generate_key())
    return Fernet(path.read_bytes())


def backup_models():
    return [m for m in apps.get_models() if m._meta.app_label in ('accounts','members','events','reports','letters','vitrine','chat','core') and m.__name__ not in ('AuditLog','AuditArchive','Backup','AdminNotification','UserSession')]


def create_backup(actor=None):
    row=Backup.objects.create(created_by=actor)
    log_audit(action='BACKUP_STARTED',module='SYSTEM',actor=actor,status='PENDING',target=row)
    try:
        buffer=io.BytesIO()
        with transaction.atomic(), zipfile.ZipFile(buffer,'w',zipfile.ZIP_DEFLATED) as z:
            objects=[]
            for model in backup_models(): objects.extend(model._base_manager.all())
            z.writestr('data.json',serializers.serialize('json',objects))
            z.writestr('manifest.json',json.dumps({'version':1,'created_at':timezone.now().isoformat()}))
            media=Path(settings.MEDIA_ROOT).resolve()
            if media.exists():
                for file in media.rglob('*'):
                    if file.is_file() and not file.is_symlink() and file.resolve().is_relative_to(media):
                        z.write(file,'media/'+file.relative_to(media).as_posix())
        encrypted=cipher().encrypt(buffer.getvalue())
        row.filename=f'backup-{row.pk}.sygmebec'
        path=storage()/row.filename
        with path.open('xb') as out: out.write(encrypted)
        row.size=len(encrypted); row.checksum=hashlib.sha256(encrypted).hexdigest(); row.status='SUCCESS'
        row.save()
        log_audit(action='BACKUP_CREATED',module='SYSTEM',actor=actor,target=row)
        return row
    except Exception:
        row.status='FAILURE'; row.error='Sauvegarde ?chou?e. Consulter les journaux serveur.'; row.save()
        log_audit(action='BACKUP_FAILED',module='SYSTEM',actor=actor,target=row,severity='CRITICAL',status='FAILURE')
        raise


def backup_path(row):
    path=(storage()/row.filename).resolve()
    if path.parent!=storage().resolve() or not path.is_file(): raise ValueError('Fichier indisponible.')
    if hashlib.sha256(path.read_bytes()).hexdigest()!=row.checksum: raise ValueError('Int?grit? de la sauvegarde invalide.')
    return path


def restore_backup(row,actor):
    # Recovery is a merge: records created after the snapshot are preserved.
    # Audit, session references and backup catalog are never restored backwards.
    log_audit(action='BACKUP_RESTORE_STARTED',module='SYSTEM',actor=actor,target=row,severity='CRITICAL',status='PENDING')
    try:
        raw=cipher().decrypt(backup_path(row).read_bytes())
        with zipfile.ZipFile(io.BytesIO(raw)) as z:
            if json.loads(z.read('manifest.json'))['version']!=1: raise ValueError('Version incompatible.')
            payload=z.read('data.json').decode()
            allowed={m._meta.label_lower for m in backup_models()}
            if any(obj['model'] not in allowed for obj in json.loads(payload)): raise ValueError('Mod?le interdit.')
            media=Path(settings.MEDIA_ROOT).resolve()
            files=[]
            for name in z.namelist():
                if name.startswith('media/') and not name.endswith('/'):
                    destination=(media/name[6:]).resolve()
                    if not destination.is_relative_to(media): raise ValueError('Chemin interdit.')
                    files.append((destination,z.read(name)))
            safety=create_backup(actor)
            token=suspended.set(True)
            try:
                with transaction.atomic():
                    deferred=[]
                    for obj in serializers.deserialize('json',payload,handle_forward_references=True):
                        obj.save()
                        if obj.deferred_fields: deferred.append(obj)
                    for obj in deferred: obj.save_deferred_fields()
                for destination,content in files:
                    destination.parent.mkdir(parents=True,exist_ok=True)
                    destination.write_bytes(content)
            finally: suspended.reset(token)
        from .models import UserSession
        UserSession.objects.filter(revoked_at__isnull=True).update(revoked_at=timezone.now())
        log_audit(action='BACKUP_RESTORED',module='SYSTEM',actor=actor,target=row,severity='CRITICAL',metadata={'safety_backup':safety.pk,'mode':'merge'})
    except Exception:
        log_audit(action='BACKUP_RESTORE_FAILED',module='SYSTEM',actor=actor,target=row,severity='CRITICAL',status='FAILURE')
        raise


def archive_logs(actor=None):
    months=organization()['audit']['retention_months']
    cutoff=timezone.now()-timedelta(days=months*30)
    with transaction.atomic():
        ids=list(AuditLog.objects.filter(timestamp__lt=cutoff,archives__isnull=True).values_list('pk',flat=True))
        if not ids: return {'count':0}
        batch=AuditArchive.objects.create(cutoff=cutoff,created_by=actor)
        batch.logs.add(*ids)
        log_audit(action='SYSTEM_ARCHIVED',module='SYSTEM',actor=actor,metadata={'count':len(ids),'batch':batch.pk})
    return {'count':len(ids),'batch':batch.pk}


def scheduled_maintenance():
    policy=organization()['backups']
    periods={'daily':1,'weekly':7,'monthly':30}
    days=periods.get(policy['schedule'])
    last=Backup.objects.filter(status='SUCCESS').order_by('-created_at').first()
    if days and (not last or last.created_at<timezone.now()-timedelta(days=days)):
        create_backup()
    for row in Backup.objects.filter(status='SUCCESS').order_by('-created_at')[policy['retain_count']:]:
        backup_path(row).unlink()
        row.status='EXPIRED'; row.save(update_fields=['status'])
        log_audit(action='BACKUP_RETENTION_APPLIED',module='SYSTEM',target=row)
    return archive_logs()
