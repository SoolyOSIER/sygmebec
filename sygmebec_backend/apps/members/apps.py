from django.apps import AppConfig

class MembersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sygmebec_backend.apps.members'
    label = 'members'

    def ready(self):
        import sygmebec_backend.apps.members.signals