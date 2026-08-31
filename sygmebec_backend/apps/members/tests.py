from datetime import date
from io import BytesIO
from zipfile import ZipFile

from rest_framework.test import APITestCase

from sygmebec_backend.apps.accounts.models import RoleAcces, Utilisateur
from sygmebec_backend.apps.members.models import Fonction, Membre, MembreFonction, Statut


class MemberStatisticsTests(APITestCase):
    def setUp(self):
        self.role, _ = RoleAcces.objects.get_or_create(nomRole='ADMINISTRATEUR')
        self.user = Utilisateur.objects.create_user(
            identifiant='statistiques-admin',
            password='MotDePasseTest123!',
            role_acces=self.role,
        )
        self.active, _ = Statut.objects.get_or_create(libelle='Actif')
        self.new, _ = Statut.objects.get_or_create(libelle='Nouveau converti')
        self.client.force_authenticate(self.user)

    def test_statistics_include_all_demographic_distributions(self):
        first = Membre.objects.create(
            nom='Jean',
            prenom='Paul',
            statut=self.active,
            date_naissance=date(1995, 1, 1),
            sexe=Membre.SEXE_MALE,
            niveau_etude=Membre.NIVEAU_ETUDE_UNIVERSITAIRE,
            zone_habitation='Cap-Haïtien',
            etat_matrimonial=Membre.ETAT_MARIE,
            profession='Enseignant',
        )
        Membre.objects.create(
            nom='Marie',
            prenom='Claire',
            statut=self.new,
            date_naissance=date(2011, 2, 2),
            sexe=Membre.SEXE_FEMELLE,
            niveau_etude=Membre.NIVEAU_ETUDE_SECONDAIRE,
            zone_habitation='Port-au-Prince',
            etat_matrimonial=Membre.ETAT_CELIBATAIRE,
            profession='Étudiante',
        )
        function = Fonction.objects.create(nomFonction='Diacre', dateDebut=date(2024, 1, 1))
        MembreFonction.objects.create(membre=first, fonction=function)
        deleted_member = Membre.objects.create(
            nom='Membre',
            prenom='Archivé',
            statut=self.active,
            sexe=Membre.SEXE_MALE,
        )
        deleted_member.soft_delete()

        response = self.client.get('/api/v1/membres/statistiques/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total'], 2)
        self.assertEqual(response.data['active'], 1)
        self.assertEqual(
            {item['label']: item['count'] for item in response.data['repartition']['sexes']},
            {'Hommes': 1, 'Femmes': 1, 'Non renseigné': 0},
        )
        self.assertEqual(
            {item['label']: item['count'] for item in response.data['repartition']['zones']}['Cap-Haïtien'],
            1,
        )
        self.assertEqual(
            {item['label']: item['count'] for item in response.data['repartition']['professions']}['Enseignant'],
            1,
        )
        self.assertEqual(
            {item['label']: item['count'] for item in response.data['repartition']['categories']}['Actif'],
            1,
        )
        self.assertEqual(response.data['data_quality']['zones']['percentage'], 100.0)

    def test_xlsx_export_contains_complete_member_information(self):
        fonction = Fonction.objects.create(nomFonction='Diacre', dateDebut=date(2024, 1, 1))
        membre = Membre.objects.create(
            nom='Jean',
            prenom='Paul',
            statut=self.active,
            actuellement_employe=True,
            actuellement_etudiant=True,
            signature_membre='Jean Paul',
            date_signature=date(2025, 1, 4),
            classe_ecole_dimanche='Adultes',
        )
        MembreFonction.objects.create(membre=membre, fonction=fonction)

        response = self.client.get(f'/api/v1/membres/exporter/?format=xlsx&membre={membre.id}')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response['Content-Type'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        archive = ZipFile(BytesIO(b''.join(response.streaming_content)))
        worksheet = archive.read('xl/worksheets/sheet1.xml').decode()
        self.assertIn('Actuellement étudiant(e)', worksheet)
        self.assertIn('Signature du membre', worksheet)
        self.assertIn('Jean Paul', worksheet)
        self.assertIn('Diacre (depuis 01/01/2024)', worksheet)
