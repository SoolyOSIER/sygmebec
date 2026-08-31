from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vitrine', '0002_demandeadhesion_actuellement_employe_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='demandeadhesion',
            name='niveau_etude',
            field=models.CharField(
                blank=True,
                choices=[
                    ('PRIMAIRE', 'Primaire'),
                    ('SECONDAIRE', 'Secondaire'),
                    ('UNIVERSITAIRE', 'Universitaire'),
                ],
                max_length=20,
            ),
        ),
    ]
