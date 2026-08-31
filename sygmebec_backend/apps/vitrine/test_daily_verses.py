from datetime import date
from unittest.mock import patch

from rest_framework import status
from rest_framework.test import APISimpleTestCase

from .daily_verses import get_daily_verse


class DailyVerseTests(APISimpleTestCase):
    def test_reference_date_returns_corrected_matthew_verse(self):
        verse = get_daily_verse(date(2026, 8, 24))

        self.assertEqual(verse, {
            'date': '2026-08-24',
            'texte': 'Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d’eux.',
            'reference': 'Matthieu 18:20',
        })

    @patch(
        'sygmebec_backend.apps.vitrine.daily_verses.timezone.localdate',
        return_value=date(2026, 8, 24),
    )
    def test_public_endpoint_returns_the_daily_verse(self, _mock_localdate):
        response = self.client.get('/api/v1/public/verset-du-jour/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {
            'date': '2026-08-24',
            'texte': 'Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d’eux.',
            'reference': 'Matthieu 18:20',
        })
