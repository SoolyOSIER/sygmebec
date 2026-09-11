from pathlib import Path
from django.conf import settings
from django.db import transaction
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import UserPreference, OrganizationSetting, UserSession, Backup, AdminNotification, AuditLog
from .settings_schema import PERSONAL, ORGANIZATION, MODULE_ACTIONS, defaults, organization, validate, validate_appearance
from .audit import log_audit
from .authentication import session_hash
from sygmebec_backend.apps.accounts.permissions import IsAdministrateur


def confirmed(request,word='CONFIRMER',password=False):
    if request.data.get('confirmation')!=word:
        raise ValidationError({'confirmation':f'Saisissez {word} pour confirmer.'})
    if password and not request.user.check_password(request.data.get('password','')):
        raise ValidationError({'password':'Mot de passe administrateur incorrect.'})


class PreferenceView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        row=UserPreference.objects.filter(user=request.user).first()
        return Response({'data':defaults(PERSONAL)|(row.data if row else {}), 'schema':PERSONAL,
                         'organization_theme':organization()['appearance']})
    def patch(self,request):
        data=validate(request.data,PERSONAL)
        with transaction.atomic():
            row,_=UserPreference.objects.select_for_update().get_or_create(user=request.user)
            row.data={**row.data,**data};row.save()
        return self.get(request)


class OrganizationView(APIView):
    permission_classes=[IsAdministrateur]
    def get(self,request):
        row=OrganizationSetting.objects.filter(pk=1).first()
        return Response({'data':organization(),'schema':ORGANIZATION,
            'logo':request.build_absolute_uri(row.logo.url) if row and row.logo else None,
            'updated_at':row.updated_at if row else None})
    def patch(self,request):
        if 'logo' in request.FILES:
            from PIL import Image
            image=request.FILES['logo']
            if image.size>5*1024*1024: raise ValidationError({'logo':'Maximum 5 Mo.'})
            try:
                img=Image.open(image)
                if img.format not in ('PNG','JPEG','WEBP'): raise ValueError()
                img.verify(); image.seek(0)
            except Exception: raise ValidationError({'logo':'Image PNG, JPEG ou WebP valide requise.'})
            row,_=OrganizationSetting.objects.get_or_create(pk=1)
            row.logo=image;row.updated_by=request.user;row.save()
            return self.get(request)
        incoming={k:v for k,v in request.data.items() if k!='confirmation'}
        if not incoming or set(incoming)-set(ORGANIZATION): raise ValidationError('Section inconnue.')
        if 'security' in incoming: confirmed(request)
        with transaction.atomic():
            row,_=OrganizationSetting.objects.select_for_update().get_or_create(pk=1)
            data=organization()
            for section,values in incoming.items():
                data[section].update(validate(values,ORGANIZATION[section]))
            validate_appearance(data['appearance'])
            row.data=data;row.updated_by=request.user;row.save()
            if 'security' in incoming:
                log_audit(action='SETTINGS_SECURITY_UPDATED',module='SETTINGS',request=request,severity='SECURITY')
        return self.get(request)


class RolePolicyView(APIView):
    permission_classes=[IsAdministrateur]
    def get(self,request):
        saved=organization()['roles']
        matrix={role:{module:{action:saved.get(role,{}).get(module,{}).get(action,True) for action in actions} for module,actions in MODULE_ACTIONS.items()} for role in ('PASTEUR','SECRETAIRE')}
        return Response({'data':matrix,'modules':MODULE_ACTIONS,'administrator':'Acc?s complet r?serv? ? l?administrateur principal.'})
    def patch(self,request):
        confirmed(request)
        matrix=request.data.get('data')
        if not isinstance(matrix,dict) or set(matrix)-{'PASTEUR','SECRETAIRE'}: raise ValidationError('R?le syst?me non modifiable.')
        for role,modules in matrix.items():
            if not isinstance(modules,dict) or set(modules)-set(MODULE_ACTIONS): raise ValidationError('Module inconnu.')
            for module,actions in modules.items():
                if not isinstance(actions,dict) or set(actions)-set(MODULE_ACTIONS[module]) or any(type(x) is not bool for x in actions.values()): raise ValidationError('Permission invalide.')
        with transaction.atomic():
            row,_=OrganizationSetting.objects.select_for_update().get_or_create(pk=1)
            row.data={**row.data,'roles':matrix};row.updated_by=request.user;row.save()
            log_audit(action='USER_PERMISSIONS_CHANGED',module='USERS',request=request,severity='SECURITY')
        return self.get(request)


class SessionView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        rows=UserSession.objects.filter(revoked_at__isnull=True,expires_at__gt=timezone.now())
        if not (getattr(request.user,'est_administrateur_principal',False) and request.query_params.get('all')=='true'):
            rows=rows.filter(user=request.user)
        current=session_hash(request.auth.get('sid','')) if request.auth else ''
        return Response([{'id':r.pk,'user':r.user.identifiant,'created_at':r.created_at,'expires_at':r.expires_at,'ip_address':r.ip_address,'user_agent':r.user_agent,'current':r.key_hash==current} for r in rows.select_related('user').order_by('-created_at')[:500]])
    def post(self,request):
        confirmed(request)
        rows=UserSession.objects.filter(revoked_at__isnull=True)
        if not getattr(request.user,'est_administrateur_principal',False): rows=rows.filter(user=request.user)
        if request.data.get('id'): rows=rows.filter(pk=request.data['id'])
        elif request.data.get('scope')=='others':
            rows=rows.filter(user=request.user)
            if request.auth: rows=rows.exclude(key_hash=session_hash(request.auth.get('sid','')))
        elif request.data.get('scope')!='all': raise ValidationError('Choisissez une session ou une port?e.')
        count=rows.update(revoked_at=timezone.now())
        log_audit(action='AUTH_SESSIONS_REVOKED',module='AUTH',request=request,severity='SECURITY',metadata={'count':count})
        return Response({'count':count})


class BackupView(APIView):
    permission_classes=[IsAdministrateur]
    def get(self,request):
        return Response(list(Backup.objects.order_by('-created_at').values('id','created_at','status','size','error','created_by__identifiant')[:200]))
    def post(self,request):
        confirmed(request)
        from .operations import create_backup
        try: row=create_backup(request.user)
        except Exception: return Response({'detail':'?chec de sauvegarde. L?incident est enregistr?.'},status=500)
        return Response({'id':row.pk,'status':row.status},status=201)


class BackupDownload(APIView):
    permission_classes=[IsAdministrateur]
    def get(self,request,pk):
        from .operations import backup_path
        row=get_object_or_404(Backup,pk=pk,status='SUCCESS')
        try: path=backup_path(row)
        except ValueError as exc: raise ValidationError(str(exc))
        log_audit(action='BACKUP_DOWNLOADED',module='SYSTEM',request=request,target=row,severity='WARNING')
        return FileResponse(path.open('rb'),as_attachment=True,filename=row.filename)


class BackupRestore(APIView):
    permission_classes=[IsAdministrateur]
    def post(self,request,pk):
        confirmed(request,'RESTAURER',password=True)
        from .operations import restore_backup
        row=get_object_or_404(Backup,pk=pk,status='SUCCESS')
        try: restore_backup(row,request.user)
        except Exception: return Response({'detail':'Restauration ?chou?e. Consultez le journal d?audit et la sauvegarde de s?curit?.'},status=500)
        return Response({'detail':'Donn?es restaur?es par fusion. Les ajouts post?rieurs et le journal sont conserv?s. Reconnectez-vous.'})


class MaintenanceView(APIView):
    permission_classes=[IsAdministrateur]
    def get(self,request):
        import django
        media=Path(settings.MEDIA_ROOT)
        size=sum(p.stat().st_size for p in media.rglob('*') if p.is_file() and not p.is_symlink()) if media.exists() else 0
        return Response({'backend':django.get_version(),'frontend':'2.0.0','media_bytes':size,
            'last_backup':Backup.objects.filter(status='SUCCESS').order_by('-created_at').values('id','created_at').first(),
            'last_failure':AuditLog.objects.filter(status='FAILURE').order_by('-timestamp').values('action','timestamp','request_id').first(),
            'scheduler':'python manage.py system_maintenance (? planifier chaque jour)'})
    def post(self,request):
        confirmed(request)
        operation=request.data.get('operation')
        if operation=='statistics':
            from sygmebec_backend.apps.members.models import Membre
            from sygmebec_backend.apps.events.models import Evenement
            result={'members':Membre.objects.count(),'events':Evenement.objects.count()}
        elif operation=='notification':
            AdminNotification.objects.create(title='Test des notifications administratives')
            result={'detail':'Notification interne cr??e.'}
        elif operation=='email':
            # Address is explicit; sending happens only on a user-triggered request.
            from django.core.validators import validate_email
            recipient=request.data.get('recipient','')
            try: validate_email(recipient)
            except Exception: raise ValidationError({'recipient':'E-mail valide requis.'})
            config=organization()['notifications']
            try: send_mail(config['subject'],config['body_template'],config['sender_email'] or settings.DEFAULT_FROM_EMAIL,[recipient],fail_silently=False)
            except Exception:
                log_audit(action='NOTIFICATION_FAILED',module='SYSTEM',request=request,status='FAILURE',severity='WARNING')
                return Response({'detail':'Envoi impossible. V?rifiez la configuration SMTP du serveur.'},status=502)
            result={'detail':'Message transmis au service d?envoi configur?.'}
        elif operation=='cleanup':
            root=Path(settings.BASE_DIR)/'private_backups'/'tmp'
            count=0
            if root.exists():
                for path in root.iterdir():
                    if path.is_file() and not path.is_symlink(): path.unlink();count+=1
            result={'count':count}
        else: raise ValidationError('Op?ration inconnue.')
        log_audit(action='SYSTEM_'+operation.upper(),module='SYSTEM',request=request)
        return Response(result)


class NotificationView(APIView):
    permission_classes=[IsAdministrateur]
    def get(self,request):
        return Response(list(AdminNotification.objects.order_by('-created_at').values('id','title','created_at','read_at','audit_id')[:100]))
    def post(self,request):
        row=get_object_or_404(AdminNotification,pk=request.data.get('id'))
        row.read_at=timezone.now();row.save(update_fields=['read_at'])
        return Response({'id':row.pk})


class DeactivationRequestView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        confirmed(request)
        entry=log_audit(action='USER_DEACTIVATION_REQUESTED',module='USERS',request=request,severity='SECURITY')
        return Response({'detail':'Demande transmise ? l?administrateur.','id':entry.pk})
