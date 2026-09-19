import json
import tempfile

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.tokens import RefreshToken

from sygmebec_backend.apps.core.models import AuditLog

from .models import RoleAcces, Utilisateur
from .validators import StrongPasswordValidator


class ProfilePhotoPersistenceTests(APITestCase):
    """A profile photo must remain attached after a new API request."""

    def setUp(self):
        self.user = Utilisateur.objects.create_user(
            identifiant='photo-persistante',
            password='MotDePassePhoto123!',
        )
        self.client.force_authenticate(self.user)

    def test_uploaded_profile_photo_is_saved_and_returned_by_profile_endpoint(self):
        image = SimpleUploadedFile(
            'profil.gif',
            b'GIF87a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;',
            content_type='image/gif',
        )

        with tempfile.TemporaryDirectory() as media_root, override_settings(MEDIA_ROOT=media_root):
            response = self.client.patch('/api/v1/auth/me/profile/', {'photo': image}, format='multipart')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('/media/membres/photos/', response.data['membre']['photo'])

            self.user.refresh_from_db()
            self.assertTrue(self.user.membre.photo.storage.exists(self.user.membre.photo.name))

            reloaded = self.client.get('/api/v1/auth/me/profile/')
            self.assertEqual(reloaded.status_code, status.HTTP_200_OK)
            self.assertEqual(reloaded.data['membre']['photo'], response.data['membre']['photo'])


class PasswordResetSecurityTests(APITestCase):
    def setUp(self):
        self.admin_role, _ = RoleAcces.objects.get_or_create(nomRole='ADMINISTRATEUR')
        self.administrator = Utilisateur.objects.create_superuser(
            identifiant='admin-securise',
            password='AdminMotDePasse123!',
            role_acces=self.admin_role,
        )

    def create_account(self, identifiant='compte-securise'):
        return Utilisateur.objects.create_user(
            identifiant=identifiant,
            password='AncienMotDePasse123!',
            role_acces=self.admin_role,
        )

    def test_strong_password_validator_enforces_every_required_category(self):
        validator = StrongPasswordValidator()
        invalid_passwords = {
            'Ab1!court': 'password_too_short',
            'motdepassefort123!': 'password_no_upper',
            'MOTDEPASSEFORT123!': 'password_no_lower',
            'MotDePasseSansChiffre!': 'password_no_digit',
            'MotDePasseAvecChiffre123': 'password_no_special',
        }

        for password, error_code in invalid_passwords.items():
            with self.subTest(password=password):
                with self.assertRaises(DjangoValidationError) as raised:
                    validator.validate(password)
                self.assertIn(
                    error_code,
                    {error.code for error in raised.exception.error_list},
                )

        validator.validate('MotDePasseTresFort123!')

    def test_manager_cannot_bypass_password_policy_when_creating_an_account(self):
        with self.assertRaises(DjangoValidationError):
            Utilisateur.objects.create_user(
                identifiant='gestionnaire-faible',
                password='motdepasse123!',
                role_acces=self.admin_role,
            )

    def test_public_registration_uses_the_same_password_policy(self):
        response = self.client.post(
            '/api/v1/auth/register/',
            {
                'nom': 'Jean',
                'prenom': 'Dupont',
                'sexe': 'MALE',
                'date_naissance': '1990-01-01',
                'telephone': '555-0100',
                'email': 'jean.dupont@example.org',
                'adresse': 'Rue de la Foi',
                'identifiant': 'inscription-faible',
                'password': 'motdepassefort123!',
                'password_confirm': 'motdepassefort123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)
        self.assertFalse(Utilisateur.objects.filter(identifiant='inscription-faible').exists())

    def test_all_account_password_endpoints_reject_the_same_policy_violation(self):
        weak_password = 'motdepassefort123!'
        self.client.force_authenticate(self.administrator)

        create_response = self.client.post(
            '/api/v1/utilisateurs/',
            {
                'identifiant': 'creation-faible',
                'password': weak_password,
                'password_confirm': weak_password,
            },
            format='json',
        )
        self.assertEqual(create_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', create_response.data)

        account = self.create_account('reinitialisation-faible')
        reset_response = self.client.post(
            f'/api/v1/utilisateurs/{account.id}/reset-password/',
            {
                'new_password': weak_password,
                'new_password_confirm': weak_password,
            },
            format='json',
        )
        self.assertEqual(reset_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new_password', reset_response.data)

        self.client.force_authenticate(account)
        change_response = self.client.post(
            '/api/v1/auth/me/change-password/',
            {
                'current_password': 'AncienMotDePasse123!',
                'new_password': weak_password,
                'new_password_confirm': weak_password,
            },
            format='json',
        )
        self.assertEqual(change_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new_password', change_response.data)

    def test_administrator_update_cannot_bypass_password_policy(self):
        account = self.create_account('edition-faible')
        self.client.force_authenticate(self.administrator)

        response = self.client.patch(
            f'/api/v1/utilisateurs/{account.id}/',
            {
                'password': 'MotDePasseSansSpecial123',
                'password_confirm': 'MotDePasseSansSpecial123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)
        account.refresh_from_db()
        self.assertTrue(account.check_password('AncienMotDePasse123!'))

    def test_administrator_password_update_revokes_existing_sessions(self):
        account = self.create_account('edition-sessions')
        old_refresh = RefreshToken.for_user(account)
        old_access = str(old_refresh.access_token)
        self.client.force_authenticate(self.administrator)

        response = self.client.patch(
            f'/api/v1/utilisateurs/{account.id}/',
            {
                'password': 'MotDePasseMisAJour456!',
                'password_confirm': 'MotDePasseMisAJour456!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        account.refresh_from_db()
        self.assertTrue(account.check_password('MotDePasseMisAJour456!'))
        self.assertTrue(
            BlacklistedToken.objects.filter(token__jti=old_refresh['jti']).exists()
        )
        with self.assertRaises(TokenError):
            RefreshToken(str(old_refresh))

        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {old_access}')
        old_access_response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(old_access_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_revokes_existing_refresh_tokens(self):
        refresh = RefreshToken.for_user(self.administrator)
        self.client.force_authenticate(self.administrator)

        response = self.client.post('/api/v1/auth/logout/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            BlacklistedToken.objects.filter(token__jti=refresh['jti']).exists()
        )

    def test_admin_reset_blacklists_refresh_and_logs_only_a_safe_marker(self):
        account = self.create_account()
        creation_audit = AuditLog.objects.filter(
            content_type='Utilisateur',
            object_id=str(account.pk),
            action='create',
        ).first()
        self.assertIsNotNone(creation_audit)
        self.assertNotIn('password', creation_audit.changes)
        self.assertNotIn('groups', creation_audit.changes)
        self.assertNotIn('user_permissions', creation_audit.changes)

        old_refresh = RefreshToken.for_user(account)
        old_access = str(old_refresh.access_token)

        self.client.force_authenticate(self.administrator)
        response = self.client.post(
            f'/api/v1/utilisateurs/{account.id}/reset-password/',
            {
                'new_password': 'NouveauMotDePasse246!',
                'new_password_confirm': 'NouveauMotDePasse246!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'message': 'Mot de passe réinitialisé avec succès.'})
        account.refresh_from_db()
        self.assertTrue(account.check_password('NouveauMotDePasse246!'))

        self.assertTrue(
            BlacklistedToken.objects.filter(token__jti=old_refresh['jti']).exists()
        )
        with self.assertRaises(TokenError):
            RefreshToken(str(old_refresh))

        self.client.force_authenticate(user=None)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {old_access}')
        old_access_response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(old_access_response.status_code, status.HTTP_401_UNAUTHORIZED)

        audit = AuditLog.objects.filter(
            content_type='Utilisateur',
            object_id=str(account.pk),
            action='update',
        ).first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.changes, {'password_reset': True})
        self.assertNotIn(account.password, json.dumps(audit.changes))

    def test_admin_reset_validates_password_against_target_account(self):
        account = self.create_account(identifiant='Alexandrine')
        self.client.force_authenticate(self.administrator)

        response = self.client.post(
            f'/api/v1/utilisateurs/{account.id}/reset-password/',
            {
                'new_password': 'Alexandrine2026!',
                'new_password_confirm': 'Alexandrine2026!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new_password', response.data)
        account.refresh_from_db()
        self.assertTrue(account.check_password('AncienMotDePasse123!'))

    def test_self_password_change_validates_against_current_account(self):
        account = self.create_account(identifiant='Bernardin')
        self.client.force_authenticate(account)

        response = self.client.post(
            '/api/v1/auth/me/change-password/',
            {
                'current_password': 'AncienMotDePasse123!',
                'new_password': 'Bernardin2026!',
                'new_password_confirm': 'Bernardin2026!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new_password', response.data)
        account.refresh_from_db()
        self.assertTrue(account.check_password('AncienMotDePasse123!'))

    def test_audit_api_recursively_redacts_historical_sensitive_values(self):
        account = self.create_account()
        historical_audit = AuditLog.objects.create(
            actor=self.administrator,
            action='update',
            content_type='Utilisateur',
            object_id=str(account.pk),
            object_repr=account.identifiant,
            changes={
                'password': 'legacy-password-hash',
                'groups': ['administrateurs'],
                'profile': {
                    'new_password': 'plain-text-password',
                    'credentials': {'refresh_token': 'refresh-secret'},
                },
                'password_reset': True,
                'identifiant': account.identifiant,
            },
        )

        self.client.force_authenticate(self.administrator)
        response = self.client.get('/api/v1/audit-logs/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = next(
            entry for entry in response.data['results'] if entry['id'] == historical_audit.id
        )
        self.assertEqual(result['changes']['password'], '[masqué]')
        self.assertEqual(result['changes']['groups'], '[masqué]')
        self.assertEqual(result['changes']['profile']['new_password'], '[masqué]')
        self.assertEqual(result['changes']['profile']['credentials']['refresh_token'], '[masqué]')
        self.assertTrue(result['changes']['password_reset'])

        serialized_changes = json.dumps(result['changes'])
        self.assertNotIn('legacy-password-hash', serialized_changes)
        self.assertNotIn('plain-text-password', serialized_changes)
        self.assertNotIn('refresh-secret', serialized_changes)
