# apps/reports/__init__.py
"""
Reports Application - Génération de rapports
Fonctionnalités :
- Modèles : Rapport, CritereFiltrage
- Génération asynchrone de rapports PDF (Celery)
- Filtrage par statut, période, fonction
- Téléchargement des rapports
- Régénération des rapports
- Notification par email
"""

default_app_config = 'apps.reports.apps.ReportsConfig'