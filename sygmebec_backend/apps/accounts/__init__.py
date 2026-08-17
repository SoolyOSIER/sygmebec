# apps/accounts/__init__.py
"""
Accounts Application - Gestion des utilisateurs et authentification
Fonctionnalités :
- Modèles : Utilisateur, RoleAcces
- Authentification JWT
- Gestion des rôles et permissions
- Gestion des comptes utilisateurs (Admin)
- Signaux : email de bienvenue
- Tâches Celery : emails de bienvenue et réinitialisation
"""

default_app_config = 'apps.accounts.apps.AccountsConfig'