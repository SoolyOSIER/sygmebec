from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from sygmebec_backend.apps.accounts.models import RoleAcces, Utilisateur
from sygmebec_backend.apps.events.models import Evenement, TypeEvenement
from sygmebec_backend.apps.members.models import Membre

from .models import DemandeAdhesion


class VitrineApiTests(APITestCase):
    def setUp(self):
        self.event = Evenement.objects.create(
            titre='Culte de célébration',
            categorie=Evenement.CATEGORIE_CULTE,
            date=timezone.now() + timedelta(days=7),
            lieu='Temple SYGMEBEC',
            est_public=True,
            capacite=20,
        )

    def test_public_adhesion_is_saved(self):
        response = self.client.post('/api/v1/public/adhesion/', {
            'nom': 'Jean',
            'prenom': 'Pierre',
            'email': 'jean@example.org',
            'telephone': '555-0100',
            'telephone_secondaire': '555-0102',
            'adresse': 'Rue de la Foi',
            'niveau_etude': 'UNIVERSITAIRE',
            'date_presentation': '2024-01-15',
            'date_conversion': '2024-02-15',
            'date_affiliation': '2024-03-15',
            'date_bapteme': '2024-04-15',
            'message': 'Je souhaite rejoindre la communauté.',
            'honeypot': '',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        demande = DemandeAdhesion.objects.get(email='jean@example.org')
        self.assertEqual(str(demande.date_affiliation), '2024-03-15')
        self.assertEqual(demande.adresse, 'Rue de la Foi')
        self.assertEqual(demande.niveau_etude, 'UNIVERSITAIRE')

    def test_secretary_can_validate_a_public_request_and_create_member(self):
        role, _ = RoleAcces.objects.get_or_create(nomRole='SECRETAIRE')
        secretary = Utilisateur.objects.create_user(
            identifiant='secretaire', password='MotDePasseTest123!', role_acces=role,
        )
        demande = DemandeAdhesion.objects.create(
            nom='Marie', prenom='Joseph', email='marie@example.org', telephone='555-0101',
            niveau_etude='SECONDAIRE',
            date_presentation='2024-01-15', date_conversion='2024-02-15',
            date_affiliation='2024-03-15', date_bapteme='2024-04-15',
        )
        self.client.force_authenticate(secretary)

        response = self.client.post(f'/api/v1/demandes-adhesion/{demande.id}/valider/', {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        demande.refresh_from_db()
        self.assertEqual(demande.statut, DemandeAdhesion.VALIDEE)
        self.assertEqual(demande.traite_par, secretary)
        membre = Membre.objects.get(email='marie@example.org')
        self.assertEqual(str(membre.date_presentation), '2024-01-15')
        self.assertEqual(str(membre.date_bapteme), '2024-04-15')
        self.assertEqual(membre.niveau_etude, 'SECONDAIRE')

    def test_secretary_can_reject_a_public_request(self):
        role, _ = RoleAcces.objects.get_or_create(nomRole='SECRETAIRE')
        secretary = Utilisateur.objects.create_user(
            identifiant='secretaire-rejet', password='MotDePasseTest123!', role_acces=role,
        )
        demande = DemandeAdhesion.objects.create(
            nom='Jean', prenom='Louis', email='jean.louis@example.org', telephone='555-0103',
        )
        self.client.force_authenticate(secretary)

        response = self.client.post(
            f'/api/v1/demandes-adhesion/{demande.id}/rejeter/',
            {'motif_rejet': 'Dossier incomplet'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        demande.refresh_from_db()
        self.assertEqual(demande.statut, DemandeAdhesion.REJETEE)
        self.assertEqual(demande.motif_rejet, 'Dossier incomplet')
        self.assertEqual(demande.traite_par, secretary)

    def test_login_accepts_identifier_without_matching_case(self):
        role, _ = RoleAcces.objects.get_or_create(nomRole='ADMINISTRATEUR')
        Utilisateur.objects.create_user(
            identifiant='AdminPrincipal', password='MotDePasseTest123!', role_acces=role,
        )

        response = self.client.post('/api/v1/auth/login/', {
            'identifiant': 'adminprincipal',
            'password': 'MotDePasseTest123!',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_administrator_can_reset_a_password_directly(self):
        role, _ = RoleAcces.objects.get_or_create(nomRole='ADMINISTRATEUR')
        administrator = Utilisateur.objects.create_user(
            identifiant='admin-reset', password='MotDePasseTest123!', role_acces=role,
        )
        user = Utilisateur.objects.create_user(
            identifiant='compte-reset', password='AncienMotDePasse123!', role_acces=role,
        )
        self.client.force_authenticate(administrator)

        response = self.client.post(f'/api/v1/utilisateurs/{user.id}/reset-password/', {
            'new_password': 'NouveauMotDePasse123!',
            'new_password_confirm': 'NouveauMotDePasse123!',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password('NouveauMotDePasse123!'))

    def test_secretary_can_create_a_custom_event_type(self):
        role, _ = RoleAcces.objects.get_or_create(nomRole='SECRETAIRE')
        secretary = Utilisateur.objects.create_user(
            identifiant='secretaire-events', password='MotDePasseTest123!', role_acces=role,
        )
        self.client.force_authenticate(secretary)

        response = self.client.post('/api/v1/evenements/', {
            'titre': 'Baptême communautaire',
            'date': (timezone.now() + timedelta(days=14)).isoformat(),
            'lieu': 'Temple SYGMEBEC',
            'type_evenement_nom': 'Baptême',
            'est_public': True,
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        event = Evenement.objects.get(id=response.data['id'])
        self.assertEqual(event.type_evenement.nom, 'Baptême')
        self.assertTrue(TypeEvenement.objects.filter(nom='Baptême').exists())

    def test_public_events_only_expose_public_upcoming_events(self):
        response = self.client.get('/api/v1/public/evenements/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.event.id)
