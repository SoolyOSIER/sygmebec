from django.db import migrations


def seed_statuts(apps, schema_editor):
    Statut = apps.get_model('members', 'Statut')
    for libelle in ['Actif', 'Inactif', 'Transféré', 'Décédé']:
        Statut.objects.get_or_create(libelle=libelle)


def unseed_statuts(apps, schema_editor):
    Statut = apps.get_model('members', 'Statut')
    Statut.objects.filter(
        libelle__in=['Actif', 'Inactif', 'Transféré', 'Décédé'],
        membres__isnull=True,
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('members', '0002_membre_actuellement_employe_and_more'),
    ]

    operations = [
        migrations.RunPython(seed_statuts, unseed_statuts),
    ]
