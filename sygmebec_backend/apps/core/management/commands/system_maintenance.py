from django.core.management.base import BaseCommand
from sygmebec_backend.apps.core.operations import scheduled_maintenance
class Command(BaseCommand):
    help = "Sauvegardes planifiées, conservation et archivage du journal."
    def handle(self,*args,**options):
        self.stdout.write(str(scheduled_maintenance()))
