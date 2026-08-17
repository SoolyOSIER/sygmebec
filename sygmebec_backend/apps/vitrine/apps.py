from django.apps import AppConfig


class VitrineConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sygmebec_backend.apps.vitrine'
    label = 'vitrine'

    def ready(self):
        import sygmebec_backend.apps.vitrine.signals
