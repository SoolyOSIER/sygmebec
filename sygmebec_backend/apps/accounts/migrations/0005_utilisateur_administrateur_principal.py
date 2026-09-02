from django.db import migrations, models
from django.db.models import Q


def designate_existing_principal(apps, schema_editor):
    """Keep one obvious existing Django administrator and fail closed otherwise."""
    Utilisateur = apps.get_model('accounts', 'Utilisateur')

    candidates = list(
        Utilisateur.objects.filter(
            role_acces__nomRole='ADMINISTRATEUR',
            is_staff=True,
            is_superuser=True,
        )
        .order_by('pk')
        .values_list('pk', flat=True)[:2]
    )

    if len(candidates) == 1:
        principal_id = candidates[0]
        Utilisateur.objects.filter(pk=principal_id).update(
            is_administrateur_principal=True,
            is_staff=True,
            is_superuser=True,
        )
        Utilisateur.objects.exclude(pk=principal_id).filter(
            Q(is_staff=True) | Q(is_superuser=True)
        ).update(is_staff=False, is_superuser=False)
        return

    # Without one unambiguous owner, no account should retain Django-admin
    # privileges. A trusted operator can designate the owner explicitly with
    # ``python manage.py set_primary_admin <identifiant>``.
    Utilisateur.objects.filter(Q(is_staff=True) | Q(is_superuser=True)).update(
        is_staff=False,
        is_superuser=False,
    )


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_seed_roles'),
    ]

    operations = [
        migrations.AddField(
            model_name='utilisateur',
            name='is_administrateur_principal',
            field=models.BooleanField(
                db_index=True,
                default=False,
                help_text='Compte unique autorisé à administrer la plateforme.',
            ),
        ),
        migrations.RunPython(designate_existing_principal, migrations.RunPython.noop),
        migrations.AddConstraint(
            model_name='utilisateur',
            constraint=models.UniqueConstraint(
                condition=Q(('is_administrateur_principal', True)),
                fields=('is_administrateur_principal',),
                name='unique_administrateur_principal',
            ),
        ),
        migrations.AddConstraint(
            model_name='utilisateur',
            constraint=models.CheckConstraint(
                check=(
                    Q(('is_administrateur_principal', True))
                    | (Q(('is_staff', False)) & Q(('is_superuser', False)))
                ),
                name='seul_principal_peut_etre_admin_django',
            ),
        ),
    ]
