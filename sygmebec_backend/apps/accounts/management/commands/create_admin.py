from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from sygmebec_backend.apps.accounts.models import RoleAcces

User = get_user_model()

class Command(BaseCommand):
    help = 'Create an admin user interactively'
    
    def handle(self, *args, **options):
        self.stdout.write('Création d\'un administrateur SYGMEBEC')
        
        identifiant = input('Identifiant: ')
        password = input('Mot de passe: ')
        password_confirm = input('Confirmer le mot de passe: ')
        
        if password != password_confirm:
            self.stdout.write(self.style.ERROR('Les mots de passe ne correspondent pas.'))
            return
        
        # Get or create ADMINISTRATEUR role
        role, _ = RoleAcces.objects.get_or_create(nomRole='ADMINISTRATEUR')
        
        # Check if user already exists
        if User.objects.filter(identifiant=identifiant).exists():
            self.stdout.write(self.style.WARNING(f'L\'utilisateur "{identifiant}" existe déjà.'))
            return
        
        # The manager also applies AUTH_PASSWORD_VALIDATORS, so this
        # administrative path cannot bypass the application policy.
        try:
            User.objects.create_superuser(
                identifiant=identifiant,
                password=password,
                role_acces=role,
            )
        except ValidationError as error:
            for message in error.messages:
                self.stderr.write(self.style.ERROR(message))
            return
        self.stdout.write(self.style.SUCCESS(f'Administrateur "{identifiant}" créé avec succès.'))
