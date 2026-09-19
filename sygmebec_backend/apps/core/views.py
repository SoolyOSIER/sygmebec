import csv
import io
from datetime import datetime, time
from django.db.models import Count, Q
from django.http import HttpResponse
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import AuditLog
from .serializers import AuditLogSerializer
from .pagination import CustomPagination
from .audit import log_audit
from sygmebec_backend.apps.accounts.permissions import IsAdministrateur


def csv_cell(value):
    value=str(value if value is not None else '')
    return "'"+value if value.lstrip().startswith(('=','+','-','@')) else value


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class=AuditLogSerializer
    permission_classes=[IsAdministrateur]
    pagination_class=CustomPagination
    filter_backends=[]

    def get_queryset(self):
        qs=AuditLog.objects.select_related('actor').prefetch_related('archives').order_by('-timestamp','-pk')
        p=self.request.query_params
        for key,field in [('module','module'),('action','action'),('severity','severity'),('status','status'),('actor','actor_id'),('target_type','content_type')]:
            if p.get(key):
                if key=='actor' and not p[key].isdigit(): raise ValidationError({'actor':'Identifiant invalide.'})
                qs=qs.filter(**{field:p[key]})
        for key,lookup in [('date_debut','timestamp__gte'),('date_fin','timestamp__lte')]:
            if p.get(key):
                day=parse_date(p[key])
                if day is None: raise ValidationError({key:'Date invalide.'})
                value=timezone.make_aware(datetime.combine(day,time.min if key=='date_debut' else time.max))
                qs=qs.filter(**{lookup:value})
        if p.get('search'):
            term=p['search'][:150]
            qs=qs.filter(Q(actor_identifier__icontains=term)|Q(object_repr__icontains=term)|Q(summary__icontains=term)|Q(object_id=term)|Q(action__icontains=term))
        if p.get('archived')=='true': qs=qs.filter(archives__isnull=False)
        elif p.get('archived')!='all': qs=qs.filter(archives__isnull=True)
        return qs.distinct()

    @action(detail=False,methods=['get'])
    def statistics(self,request):
        qs=self.get_queryset()
        return Response({'total':qs.count(),'failed_logins':qs.filter(action='AUTH_LOGIN_FAILURE').count(),
            'security':qs.filter(severity__in=['SECURITY','CRITICAL']).count(),
            'by_module':list(qs.order_by().values('module').annotate(count=Count('id'))),
            'actions':list(AuditLog.objects.order_by('action').values_list('action',flat=True).distinct()),
            'actors':list(AuditLog.objects.exclude(actor_id=None).order_by('actor_id').values('actor_id','actor_identifier').distinct())})

    @action(detail=False,methods=['get'])
    def export(self,request):
        qs=self.get_queryset()
        if qs.count()>50000: raise ValidationError('Réduisez la période : maximum 50 000 lignes par export.')
        out=io.StringIO(); writer=csv.writer(out)
        writer.writerow(['Date UTC','Utilisateur','Rôle','Action','Module','Cible','Résultat','Gravité','Résumé','Requête'])
        for row in qs.iterator():
            writer.writerow([csv_cell(x) for x in [row.timestamp.isoformat(),row.actor_identifier,row.actor_role,row.action,row.module,row.object_id,row.status,row.severity,row.summary,row.request_id]])
        log_audit(action='AUDIT_EXPORTED',module='SYSTEM',request=request,metadata={'count':qs.count()})
        request._request._audit_logged=True
        response=HttpResponse('\ufeff'+out.getvalue(),content_type='text/csv; charset=utf-8')
        response['Content-Disposition']='attachment; filename="audit-sygmebec.csv"'
        return response

    @action(detail=False,methods=['post'])
    def archive(self,request):
        if request.data.get('confirmation')!='ARCHIVER': raise ValidationError('Saisissez ARCHIVER pour confirmer.')
        from .operations import archive_logs
        return Response(archive_logs(request.user))
