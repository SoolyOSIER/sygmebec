from django.db import migrations


def seed_roles(apps, schema_editor):
    RoleAcces = apps.get_model('accounts', 'RoleAcces')
    for role in ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR']:
        RoleAcces.objects.get_or_create(nomRole=role)


def unseed_roles(apps, schema_editor):
    RoleAcces = apps.get_model('accounts', 'RoleAcces')
    RoleAcces.objects.filter(
        nomRole__in=['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'],
        utilisateurs__isnull=True,
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_utilisateur_telephone'),
    ]

    operations = [
        migrations.RunPython(seed_roles, unseed_roles),
    ]
