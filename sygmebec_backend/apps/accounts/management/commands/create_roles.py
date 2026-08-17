from django.core.management.base import BaseCommand
from sygmebec_backend.apps.accounts.models import RoleAcces

class Command(BaseCommand):
    help = 'Create default roles: SECRETAIRE, PASTEUR, ADMINISTRATEUR'
    
    def handle(self, *args, **options):
        roles = ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR']
        
        for role_name in roles:
            role, created = RoleAcces.objects.get_or_create(nomRole=role_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Rôle "{role_name}" créé avec succès.'))
            else:
                self.stdout.write(self.style.WARNING(f'Rôle "{role_name}" existe déjà.'))