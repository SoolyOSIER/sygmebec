# Nettoyage du 19 septembre 2026

259 fichiers ont été retirés des dossiers actifs après sauvegarde dans
`private_backups/nettoyage-2026-09-19.zip`. Chaque fichier de l'archive a été
vérifié par SHA-256 avant suppression. Le manifeste détaillé (chemin, taille,
empreinte) est dans `private_backups/cleanup-manifest.json`.

## Changements

- 79 fichiers frontend et 121 fichiers vitrine listés dans l'audit ont été
  archivés : anciennes pages, composants, styles, services et stores inutilisés.
  Les références locales ont été parcourues en conservant comme racines les
  fichiers hors de cette liste, notamment les tests et les outils.
- `sygmebec-vitrine/src/utils/validation.js` est conservé car ses tests l'importent.
- Les 49 fichiers de `Mes fichier/` sont archivés avec leurs chemins d'origine.
- Le squelette Django `api/` (7 fichiers) a été supprimé.
- La base vide `sygmebec_backend/db.sqlite3`, le fichier vide
  `accounts/managers.py` et le favicon ICO vide du frontend ont été supprimés.
  Le HTML utilise déjà `favicon.svg`.
- Les caches Python du projet et les répertoires devenus vides ont été nettoyés.
- `.dockerignore` exclut maintenant les sauvegardes privées, les fichiers BAK
  et les journaux ; une ligne de commande parasite en a été retirée.
- `.gitignore` exclut les journaux. L'archive privée est déjà exclue de Git.

## Éléments préservés

La base principale, sa sauvegarde, tous les médias, les migrations, les modèles
DOCX actifs, les tests, les dépendances installées, les outils de traduction et
les configurations backend alternatives sont conservés. Les doublons de photos
ne sont pas supprimés. Les compilations régénèrent les dossiers `dist/`, exclus
de Git et du contexte Docker comme les dépendances.

## Restauration

Depuis la racine du projet, extraire l'archive dans un dossier temporaire, puis
recopier uniquement les fichiers nécessaires à leurs chemins d'origine :

```powershell
Expand-Archive -LiteralPath private_backups/nettoyage-2026-09-19.zip -DestinationPath private_backups/restauration
```

L'archive reste locale : la conserver séparément avant de supprimer ce dossier
ou de transférer uniquement les fichiers suivis par Git.

## Vérifications

- Contrôle Django : aucune erreur.
- Tests de validation vitrine : 4 sur 4 réussis.
- Compilation du tableau de bord réussie ; avertissement sur la taille du bundle.
- Compilation de la vitrine réussie après relance hors sandbox (le premier
  essai était bloqué par une restriction d'accès aux dossiers parents).
- Aucun contrôle visuel interactif ni test de déploiement externe effectué.
  Tailwind scanne moins de fichiers après retrait des anciennes pages.

L'audit initial est conservé comme état historique, antérieur à ce nettoyage.
