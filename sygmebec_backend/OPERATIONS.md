# Exploitation SYGMEBEC

## Sauvegardes et journal d'activité

Lancer un worker et un scheduler Celery en production :

```powershell
venv\Scripts\celery.exe -A sygmebec_backend worker --loglevel=INFO
venv\Scripts\celery.exe -A sygmebec_backend beat --loglevel=INFO
```

Le scheduler exécute chaque jour la politique définie dans Paramètres : il crée
les sauvegardes suivant la cadence choisie, applique la rétention et archive les
anciens journaux. Le même traitement peut être déclenché manuellement :

```powershell
venv\Scripts\python.exe manage.py system_maintenance
```

Définir `SYGMEBEC_BACKUP_KEY` avec une clé Fernet distincte et conservée hors du
serveur de l'application. Sans cette variable, l'installation locale crée une
clé dans `private_backups`, pratique pour le développement mais à sauvegarder
séparément avant toute restauration de serveur.
