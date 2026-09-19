import json
import tempfile
from datetime import timedelta
from unittest.mock import patch
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase
from sygmebec_backend.apps.accounts.models import Utilisateur, RoleAcces
from sygmebec_backend.apps.members.models import Membre, Statut
from .models import AuditLog, UserPreference, UserSession, Backup, OrganizationSetting
from .audit import log_audit, sanitize

@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class AdministrationTests(APITestCase):
    def setUp(self):
        self.admin=Utilisateur.objects.create_superuser('owner',password='StrongOwnerPass123!')
        role,_=RoleAcces.objects.get_or_create(nomRole='SECRETAIRE')
        self.user=Utilisateur.objects.create_user('secretary',password='StrongUserPass123!',role_acces=role)
        self.client.force_authenticate(self.admin)

    def test_audit_readonly_and_admin_only(self):
        self.assertEqual(self.client.get('/api/v1/audit-logs/').status_code,200)
        row=AuditLog.objects.first()
        for method in ('patch','delete'):
            self.assertEqual(getattr(self.client,method)(f'/api/v1/audit-logs/{row.pk}/',{},format='json').status_code,405)
        self.client.force_authenticate(self.user)
        for path in ('audit-logs/','audit-logs/export/','audit-logs/statistics/','settings/organization/','settings/roles/','settings/backups/','settings/maintenance/'):
            self.assertEqual(self.client.get('/api/v1/'+path).status_code,403,path)

    def test_audit_immutable_and_sensitive_fields(self):
        row=log_audit(action='TEST',before_data={'nested':{'password':'NeverStore123!','access_token':'secret'}},after_data={'password':'NeverStore456!'})
        self.assertNotIn('NeverStore',json.dumps(row.before_data))
        self.assertNotIn('secret',json.dumps(row.before_data))
        with self.assertRaises(ValueError): row.save()
        with self.assertRaises(ValueError): row.delete()
        with self.assertRaises(ValueError): AuditLog.objects.filter(pk=row.pk).update(summary='tamper')
        with self.assertRaises(ValueError): AuditLog.objects.filter(pk=row.pk).delete()

    def test_preferences_isolated_and_validated(self):
        self.client.force_authenticate(self.user)
        r=self.client.patch('/api/v1/settings/me/',{'ui_brightness':90,'theme_mode':'dark'},format='json')
        self.assertEqual(r.status_code,200,r.data)
        self.assertEqual(UserPreference.objects.get(user=self.user).data['ui_brightness'],90)
        self.assertFalse(UserPreference.objects.filter(user=self.admin).exists())
        for data in ({'ui_brightness':1000},{'is_staff':True},{'theme_mode':'invalid'}):
            self.assertEqual(self.client.patch('/api/v1/settings/me/',data,format='json').status_code,400)

    def test_global_settings_contrast_and_security_confirmation(self):
        r=self.client.patch('/api/v1/settings/organization/',{'general':{'church_name':'Test Church'}},format='json')
        self.assertEqual(r.status_code,200,r.data)
        self.assertTrue(AuditLog.objects.filter(action='SETTINGS_UPDATED').exists() or AuditLog.objects.filter(action='SETTINGS_CREATED').exists())
        self.assertEqual(self.client.patch('/api/v1/settings/organization/',{'appearance':{'button':'#ffffff'}},format='json').status_code,400)
        self.assertEqual(self.client.patch('/api/v1/settings/organization/',{'security':{'session_minutes':60}},format='json').status_code,400)
        self.assertEqual(self.client.patch('/api/v1/settings/organization/',{'security':{'session_minutes':60},'confirmation':'CONFIRMER'},format='json').status_code,200)

    def test_login_success_failure_and_session_revocation(self):
        self.client.force_authenticate(None)
        r=self.client.post('/api/v1/auth/login/',{'identifiant':'owner','password':'WrongSecret123!'},format='json')
        self.assertEqual(r.status_code,401)
        self.assertTrue(AuditLog.objects.filter(action='AUTH_LOGIN_FAILURE').exists())
        r=self.client.post('/api/v1/auth/login/',{'identifiant':'owner','password':'StrongOwnerPass123!'},format='json')
        self.assertEqual(r.status_code,200,r.data)
        self.assertTrue(AuditLog.objects.filter(action='AUTH_LOGIN_SUCCESS').exists())
        access=r.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer '+access)
        self.assertEqual(self.client.get('/api/v1/auth/me/').status_code,200)
        UserSession.objects.filter(user=self.admin).update(revoked_at=timezone.now())
        self.assertEqual(self.client.get('/api/v1/auth/me/').status_code,401)
        self.assertNotIn('WrongSecret123!',json.dumps(list(AuditLog.objects.values('changes','metadata'))))

    def test_member_changes_record_actor_and_only_differences(self):
        statut, _ = Statut.objects.get_or_create(libelle='Actif')
        member=Membre.objects.create(nom='Before', statut=statut)
        r=self.client.patch(f'/api/v1/membres/{member.pk}/',{'nom':'After'},format='json')
        self.assertEqual(r.status_code,200,r.data)
        row=AuditLog.objects.filter(action='MEMBER_UPDATED',object_id=str(member.pk)).first()
        self.assertEqual(row.actor,self.admin)
        self.assertEqual(row.before_data,{'nom':'Before'})
        self.assertEqual(row.after_data,{'nom':'After'})
        self.assertTrue(row.request_id)

    def test_filters_export_and_archive_confirmation(self):
        log_audit(action='FILTER_TEST',module='MEMBERS',severity='WARNING')
        r=self.client.get('/api/v1/audit-logs/',{'action':'FILTER_TEST'})
        self.assertEqual(r.data['count'],1)
        r=self.client.get('/api/v1/audit-logs/export/',{'action':'FILTER_TEST'})
        self.assertEqual(r.status_code,200)
        self.assertIn(b'FILTER_TEST',r.content)
        self.assertNotIn(b'USER_CREATED',r.content)
        self.assertEqual(self.client.post('/api/v1/audit-logs/archive/',{},format='json').status_code,400)

    def test_role_policy_enforced(self):
        r=self.client.patch('/api/v1/settings/roles/',{'confirmation':'CONFIRMER','data':{'SECRETAIRE':{'members':{'view':False}}}},format='json')
        self.assertEqual(r.status_code,200,r.data)
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.get('/api/v1/membres/').status_code,403)

    def test_backup_encryption_integrity_and_failure_audit(self):
        from .operations import create_backup,backup_path
        with tempfile.TemporaryDirectory() as directory,override_settings(BASE_DIR=directory,MEDIA_ROOT=directory+'/media'):
            backup=create_backup(self.admin)
            raw=backup_path(backup).read_bytes()
            self.assertNotIn(b'StrongOwner',raw)
            self.assertEqual(backup.status,'SUCCESS')
            with patch('sygmebec_backend.apps.core.operations.cipher',side_effect=RuntimeError('unavailable')):
                with self.assertRaises(RuntimeError): create_backup(self.admin)
            self.assertTrue(AuditLog.objects.filter(action='BACKUP_FAILED').exists())
