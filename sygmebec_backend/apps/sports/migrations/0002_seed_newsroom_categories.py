from django.db import migrations


DEFAULT_CATEGORIES = [
    ('Football', 'football', 'Clubs, sélections, compétitions et transferts.', '#0B7A53', 10),
    ('Basketball', 'basketball', 'NBA, ligues, sélections et talents émergents.', '#E56A17', 20),
    ('Athlétisme', 'athletisme', 'Piste, route, records et grands rendez-vous.', '#1D4ED8', 30),
    ('Sports de combat', 'sports-de-combat', 'Boxe, judo, MMA, karaté et disciplines associées.', '#B91C1C', 40),
    ('Tennis', 'tennis', 'Circuits, tournois et parcours de joueuses et joueurs.', '#7C3AED', 50),
    ('Volley-ball', 'volley-ball', 'Compétitions de salle, de plage et sélections.', '#0891B2', 60),
    ('Sports mécaniques', 'sports-mecaniques', 'Formule 1, rallye, moto et vitesse.', '#EA580C', 70),
    ('Multisport', 'multisport', 'Résultats, analyses et histoires qui traversent les disciplines.', '#334155', 80),
    ('Sport haïtien', 'sport-haitien', 'Une rubrique dédiée aux clubs, sélections et talents haïtiens.', '#0F766E', 90),
]


def seed_categories(apps, schema_editor):
    SportsCategory = apps.get_model('sports', 'SportsCategory')
    for name, slug, description, color, sort_order in DEFAULT_CATEGORIES:
        SportsCategory.objects.get_or_create(
            slug=slug,
            defaults={
                'name': name,
                'description': description,
                'color': color,
                'sort_order': sort_order,
                'is_active': True,
            },
        )


class Migration(migrations.Migration):
    dependencies = [
        ('sports', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_categories, migrations.RunPython.noop),
    ]
