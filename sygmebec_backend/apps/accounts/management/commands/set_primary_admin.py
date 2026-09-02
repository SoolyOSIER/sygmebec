from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from sygmebec_backend.apps.accounts.models import RoleAcces, Utilisateur


class Command(BaseCommand):
    help = "Désigne l'unique administrateur principal de SYGMEBEC."

    def add_arguments(self, parser):
        parser.add_argument('identifiant', help="Identifiant du compte qui doit devenir administrateur principal.")

    def handle(self, *args, **options):
        identifiant = options['identifiant'].strip()

        with transaction.atomic():
            try:
                user = Utilisateur.objects.select_for_update().get(identifiant__iexact=identifiant)
            except Utilisateur.DoesNotExist as error:
                raise CommandError(f'Aucun compte ne correspond à « {identifiant} ».') from error

            role, _ = RoleAcces.objects.get_or_create(nomRole='ADMINISTRATEUR')

            # Remove every other Django-admin capability before promoting the
            # chosen account, keeping the database constraint valid throughout.
            Utilisateur.objects.exclude(pk=user.pk).filter(
                is_administrateur_principal=True
            ).update(
                is_administrateur_principal=False,
                is_staff=False,
                is_superuser=False,
            )
            Utilisateur.objects.exclude(pk=user.pk).filter(
                is_administrateur_principal=False
            ).filter(
                is_staff=True
            ).update(is_staff=False, is_superuser=False)
            Utilisateur.objects.exclude(pk=user.pk).filter(
                is_administrateur_principal=False,
                is_superuser=True,
            ).update(is_superuser=False)

            user.role_acces = role
            user.is_active = True
            user.is_staff = True
            user.is_superuser = True
            user.is_administrateur_principal = True
            user.save(update_fields=[
                'role_acces',
                'is_active',
                'is_staff',
                'is_superuser',
                'is_administrateur_principal',
            ])

        self.stdout.write(self.style.SUCCESS(
            f'« {user.identifiant} » est maintenant le seul administrateur principal.'
        ))
