from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sygmebec_backend.apps.accounts'
    label = 'accounts'

    def ready(self):
        import sygmebec_backend.apps.accounts.signals