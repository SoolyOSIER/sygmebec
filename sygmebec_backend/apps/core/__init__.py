# apps/core/__init__.py
"""
Core Application - Utilitaires partagés
Fournit des fonctionnalités communes à toutes les applications :
- Modèles abstraits (TimeStampedModel)
- Permissions génériques
- Gestion des exceptions
- Pagination personnalisée
"""

default_app_config = 'apps.core.apps.CoreConfig'

# expose serializer package-level import if needed
try:
	from .serializers import *  # noqa: F401,F403
except Exception:
	pass