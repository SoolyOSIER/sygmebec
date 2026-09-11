from django.apps import AppConfig

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sygmebec_backend.apps.core'
    label = 'core'
    def ready(self):
        from .audit import connect_signals
        connect_signals()
