from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from sygmebec_backend.apps.accounts.models import RoleAcces, Utilisateur
from sygmebec_backend.apps.core.models import AuditLog

from .models import SportsArticle, SportsCategory


def response_items(response):
    return response.data.get('results', response.data)


class SportsPublicApiTests(APITestCase):
    def setUp(self):
        self.category = SportsCategory.objects.create(name='Football test', slug='football-test')
        self.published = SportsArticle.objects.create(
            title='Haïti prépare son prochain match',
            slug='haiti-prepare-son-prochain-match',
            excerpt='La sélection se prépare avec ambition.',
            body=' '.join(['Analyse'] * 240),
            category=self.category,
            sport='Football',
            country='Haïti',
            haiti_focus=True,
            is_featured=True,
            status=SportsArticle.PUBLISHED,
            published_at=timezone.now(),
            tags=['Haïti', 'Sélection'],
        )
        self.draft = SportsArticle.objects.create(
            title='Brouillon réservé à la rédaction',
            slug='brouillon-reserve-redaction',
            body='Un article préparé avant publication.',
            category=self.category,
            sport='Basketball',
            status=SportsArticle.DRAFT,
        )

    def test_public_list_contains_only_published_articles(self):
        response = self.client.get('/api/v1/sports/articles/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = {article['slug'] for article in response_items(response)}
        self.assertIn(self.published.slug, slugs)
        self.assertNotIn(self.draft.slug, slugs)

    def test_public_detail_counts_a_view_and_exposes_editorial_fields(self):
        response = self.client.get(f'/api/v1/sports/articles/{self.published.slug}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['category'], self.category.id)
        self.assertEqual(response.data['haiti_focus'], True)
        self.assertEqual(response.data['reading_time'], 2)
        self.assertEqual(response.data['views'], 1)

        forbidden = self.client.get(f'/api/v1/sports/articles/{self.draft.slug}/')
        self.assertEqual(forbidden.status_code, status.HTTP_404_NOT_FOUND)

    def test_featured_endpoint_is_public_and_honors_publication_status(self):
        response = self.client.get('/api/v1/sports/articles/featured/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([article['slug'] for article in response.data], [self.published.slug])


class SportsEditorialApiTests(APITestCase):
    def setUp(self):
        self.editor_role, _ = RoleAcces.objects.get_or_create(nomRole='SECRETAIRE')
        self.editor = Utilisateur.objects.create_user(
            identifiant='redaction-sport',
            password='SoleilBleu2026!',
            role_acces=self.editor_role,
        )
        self.reader = Utilisateur.objects.create_user(
            identifiant='lecteur-sport',
            password='MontagneVerte2026!',
        )
        self.category = SportsCategory.objects.create(name='Athlétisme test', slug='athletisme-test')

    def article_payload(self, **overrides):
        payload = {
            'title': 'Un regard mondial sur les championnats',
            'excerpt': 'Résultats, analyses et histoires du monde sportif.',
            'body': ' '.join(['Sport'] * 440),
            'category': self.category.id,
            'sport': 'Athlétisme',
            'country': 'Jamaïque',
            'haiti_focus': False,
            'is_featured': False,
            'status': SportsArticle.DRAFT,
            'cover_image': 'https://images.example.org/athletisme.jpg',
            'source_url': 'https://example.org/source',
            'video_url': 'https://www.youtube.com/watch?v=example',
            'tags': ['Championnats', 'Monde'],
        }
        payload.update(overrides)
        return payload

    def test_only_editorial_roles_can_write_articles(self):
        self.client.force_authenticate(self.reader)
        denied = self.client.post('/api/v1/sports/articles/', self.article_payload(), format='json')
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.editor)
        response = self.client.post('/api/v1/sports/articles/', self.article_payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], SportsArticle.DRAFT)
        self.assertEqual(response.data['author_name'], self.editor.identifiant)
        self.assertEqual(response.data['reading_time'], 2)
        self.assertEqual(response.data['cover_image_url'], self.article_payload()['cover_image'])
        self.assertTrue(AuditLog.objects.filter(action='SPORT_ARTICLE_CREATED').exists())

    def test_editor_can_publish_and_archived_articles_can_be_restored(self):
        article = SportsArticle.objects.create(
            title='À publier', slug='a-publier', body='Texte de rédaction.',
            category=self.category, sport='Football', author=self.editor,
        )
        self.client.force_authenticate(self.editor)

        # The editorial desk keeps the id in its local edit state; public links
        # use the slug. Both forms are intentionally accepted.
        published = self.client.post(f'/api/v1/sports/articles/{article.id}/publish/', {}, format='json')
        self.assertEqual(published.status_code, status.HTTP_200_OK)
        self.assertEqual(published.data['status'], SportsArticle.PUBLISHED)
        self.assertIsNotNone(published.data['published_at'])

        deleted = self.client.delete(f'/api/v1/sports/articles/{article.id}/')
        self.assertEqual(deleted.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(SportsArticle.all_objects.get(pk=article.pk).deleted_at)

        restored = self.client.post(f'/api/v1/sports/articles/{article.id}/restore/', {}, format='json')
        self.assertEqual(restored.status_code, status.HTTP_200_OK)
        self.assertIsNone(SportsArticle.objects.get(pk=article.pk).deleted_at)

    def test_category_slug_and_tags_are_validated_for_editorial_form(self):
        self.client.force_authenticate(self.editor)
        invalid = self.client.post(
            '/api/v1/sports/articles/',
            self.article_payload(tags=['x' * 41]),
            format='json',
        )
        self.assertEqual(invalid.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('tags', invalid.data)

        category = self.client.post(
            '/api/v1/sports/categories/',
            {'name': 'Sports universitaires', 'description': 'Compétitions et talents universitaires.', 'color': '#EA580C'},
            format='json',
        )
        self.assertEqual(category.status_code, status.HTTP_201_CREATED)
        self.assertEqual(category.data['slug'], 'sports-universitaires')

    def test_editorial_mine_filter_limits_the_desk_list_to_the_current_author(self):
        other_editor = Utilisateur.objects.create_user(
            identifiant='autre-redacteur', password='OrageDoré2026!', role_acces=self.editor_role,
        )
        mine = SportsArticle.objects.create(
            title='Mon brouillon', slug='mon-brouillon', body='Texte.', category=self.category,
            sport='Football', author=self.editor,
        )
        SportsArticle.objects.create(
            title='Brouillon collègue', slug='brouillon-collegue', body='Texte.', category=self.category,
            sport='Football', author=other_editor,
        )
        self.client.force_authenticate(self.editor)

        response = self.client.get('/api/v1/sports/articles/?mine=true')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([article['id'] for article in response_items(response)], [mine.id])
