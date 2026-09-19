# Audit des fichiers SYGMEBEC
Archive examinée : sygmebec(2).zip. Aucun fichier du projet supprimé ni modifié.
## Méthode et limites
Inventaire de l’archive, comparaison SHA-256 des fichiers non vides hors dépendances, historique, caches, sorties de compilation et journaux ; lecture des points d’entrée React, imports locaux, routes et configuration Django ; inspection en lecture seule des références de médias dans db.sqlite3. Les dépendances tierces n’ont pas été auditées fichier par fichier.

« Non relié au démarrage » signifie absent du graphe des imports locaux depuis src/main.jsx, dans les sources présentes. Cela ne prouve pas qu’un fichier ne sert jamais : tests, outils manuels, anciennes fonctionnalités et configurations de déploiement sont à distinguer. Pas de lancement de l’application ni de test de compilation. Un retrait ultérieur doit être vérifié par compilation et contrôle des écrans ; Tailwind peut aussi scanner les anciens fichiers pour produire des classes CSS.

## 1. Constat principal
Le tableau de bord démarre dans sygmebec-frontend/src/router/index.jsx. La vitrine démarre dans sygmebec-vitrine/src/App.jsx puis src/globe/GlobeInfoSport.jsx : elle affiche désormais Globe Info Sport. Les anciennes pages d’église sont toujours présentes, mais ne sont pas branchées à ces routes. Si l’objectif reste le site de l’église, conserver ces pages pour les rebrancher au lieu de les supprimer.

Le relevé identifie **79 fichiers JS/JSX/CSS du frontend** et **122 de la vitrine** non reliés à leur point d’entrée actuel. Ce sont des candidats à trier, pas 201 suppressions automatiquement sûres. Les listes complètes figurent plus bas.

## 2. Éléments régénérables ou à sortir des archives de livraison

| Chemin depuis sygmebec/ | Taille non compressée | Décision |
|---|---:|---|
| sygmebec-frontend/node_modules/ | 234,80 Mio | Dépendances : exclure de l’archive ; réinstaller avec npm ci avant exécution. |
| sygmebec-vitrine/node_modules/ | 205,68 Mio | Même décision. |
| venv/ | 111,69 Mio | Environnement Python Windows ; exclure de l’archive, recréer avant exécution. start-dev.ps1 dépend de ce chemin. |
| sygmebec-frontend/dist/ | 3,74 Mio | Compilation ; régénérer avec npm run build. Conserver si nécessaire au déploiement actuel. |
| sygmebec-vitrine/dist/ | 2,60 Mio | Même décision. |
| Tous les __pycache__/ et *.pyc du projet | 0,60 Mio hors venv | Caches Python régénérables. |
| logs/*.log et sygmebec_backend/logs/django.log | Faible | Journaux techniques ; vider/archiver après arrêt des processus si leur historique n’est plus utile. |

Les deux node_modules et venv représentent environ **552 Mio non compressés**. Ils ne sont pas du code inutile : ce sont des dépendances réinstallables.

## 3. Fichiers vides ou squelette sans fonction métier

- api/ : application Django squelette (modèles, vues, administration et tests sans implémentation). Non installée dans les réglages examinés et non branchée dans les routes ; candidate au retrait.
- sygmebec_backend/db.sqlite3 : fichier de 0 octet, aucune table. La base par défaut utilisée par les réglages actifs est db.sqlite3 à la racine (42 tables). Retrait possible du fichier vide dans cette configuration ; une configuration externe peut changer la base utilisée.
- sygmebec_backend/apps/accounts/managers.py : vide et aucune référence retrouvée.
- Mes fichier/sooly.html : vide.
- sygmebec-frontend/public/favicon.ico : vide, donc aucune icône exploitable. Le remplacer ou corriger son éventuelle référence HTML.

Les fichiers frontend suivants sont vides et non reliés au démarrage actuel :

- `sygmebec-frontend/src/pages/Accueil.jsx`
- `sygmebec-frontend/src/services/api.js`
- `sygmebec-frontend/src/services/evenementService.js`
- `sygmebec-frontend/src/services/adhesionService.js`
- `sygmebec-frontend/src/services/contactService.js`
- `sygmebec-frontend/src/services/authMembreService.js`
- `sygmebec-frontend/src/store/index.js`
- `sygmebec-frontend/src/store/slices/uiSlice.js`
- `sygmebec-frontend/src/store/slices/authMembreSlice.js`
- `sygmebec-frontend/src/styles/tailwind.config.js`

Attention : certaines anciennes pages importent ces services ou stores vides. Si tu réactives ces pages, il faudra implémenter leurs dépendances. La vraie configuration Tailwind est à la racine de chaque interface.

## 4. Fichiers ayant un rôle similaire ou faisant double emploi

| Fichiers ou groupes | Observation et décision |
|---|---|
| manage.py et sygmebec_backend/manage.py | Deux lanceurs vers sygmebec_backend.settings. Garder celui de la racine utilisé par start-dev.ps1 et Dockerfile ; le second est redondant dans ce lancement. |
| sygmebec_backend/settings.py et sygmebec_backend/config/settings/ | Deux systèmes de configuration différents. Les lanceurs actuels utilisent le premier ; le second est ancien/alternatif. Ne pas fusionner aveuglément : applications, authentification, chemins et options diffèrent. |
| sygmebec_backend/urls.py et config/urls.py | Deux routeurs racine. Le premier est celui des réglages actifs. |
| sygmebec_backend/wsgi.py, asgi.py et config/wsgi.py, config/asgi.py | Deux paires de points d’entrée. Les versions config ciblent config.settings ; vérifier tout déploiement externe avant retrait. |
| apps/accounts/urls.py, apps/members/urls.py, apps/events/urls.py, apps/reports/urls.py | Routeurs locaux non inclus dans la configuration examinée. config/api_urls.py enregistre déjà ces ressources. Candidats au retrait ou à une refonte du routage. |
| frontend/src/pages/membres/DemandesAdhesionPage.jsx et DemandesAdhesionPremiumPage.jsx | Deux écrans pour les demandes. La route /inscriptions-en-ligne utilise Premium ; l’autre n’est pas branché. |
| frontend/src/hooks/validators.js et src/utils/validators.js | Validation de formulaires en double, mais règles différentes (téléphone, mot de passe, dates). Les deux sont non reliés au démarrage ; ne pas remplacer l’un par l’autre sans harmoniser les règles. |
| components/common/Modal.jsx et components/ui/Modal.jsx | Même besoin de fenêtre modale, implémentations différentes. Dans le frontend, ui/Modal est utilisé ; common/Modal n’est pas relié. |
| components/common/Bouton.jsx et components/ui/Button.jsx | Même rôle de bouton ; ui/Button est utilisé dans le frontend. common/Bouton est inactif et référence un lib/utils absent. |
| components/ui/Table.jsx et DataTable.jsx | Deux tableaux avec fonctionnalités différentes ; tous deux non reliés aux points d’entrée actuels. |
| components/common/Toast.jsx et components/ui/ToastContainer.jsx | Composants de notifications non reliés ; main.jsx utilise déjà react-hot-toast. |
| components/ui/ConfirmDialog.jsx et ConfirmAction.jsx dans le frontend | Conserver les deux : tous deux utilisés ; le second exige une saisie de confirmation et peut demander un mot de passe. |
| requirements.txt, sygmebec_backend/requirements/ et Mes fichier/requirements.txt | Listes de dépendances à rationaliser, pas des copies interchangeables : start-dev.ps1 cite celle de la racine, Dockerfile utilise requirements/production.txt. |

Ne pas supprimer le dossier config/ entier : **config/api_urls.py et config/celery.py sont actifs**.

## 5. Doublons strictement identiques
Les groupes ci-dessous ont un contenu binaire identique (SHA-256). Cela ne suffit pas à autoriser la suppression : une copie peut être utilisée à un autre chemin. Les fichiers __init__.py identiques sont volontairement exclus de cette liste car leur présence par paquet est normale.


`Mes fichier/Lettre_Attestation_Storly_OSIER.docx` = `sygmebec_backend/apps/letters/templates/letters/attestation.docx`

`Mes fichier/Lettre_de_Transfert_Storly_OSIER.docx` = `sygmebec_backend/apps/letters/templates/letters/transfert.docx`

`Mes fichier/Image de l'EBEC.png` = `sygmebec-vitrine/public/eglise-ebec.png` = `sygmebec-frontend/public/eglise-ebec.png` = `media/evenements/ChatGPT_Image_5_août_2026_14_14_54.png`

`sygmebec-vitrine/src/layouts/PublicLayout.jsx` = `sygmebec-frontend/src/layouts/PublicLayout.jsx`

`sygmebec-vitrine/src/layouts/ErrorBoundary.jsx` = `sygmebec-frontend/src/layouts/ErrorBoundary.jsx`

`sygmebec-vitrine/src/utils/passwordPolicy.js` = `sygmebec-frontend/src/utils/passwordPolicy.js`

`sygmebec-vitrine/src/layouts/components/NavBar.jsx` = `sygmebec-frontend/src/layouts/components/NavBar.jsx`

`sygmebec-vitrine/src/layouts/components/Footer.jsx` = `sygmebec-frontend/src/layouts/components/Footer.jsx`

`sygmebec-vitrine/src/pages/membres/MembreEditPage.jsx` = `sygmebec-frontend/src/pages/membres/MembreEditPage.jsx`

`sygmebec-vitrine/src/components/galerie/ImageViewer.jsx` = `sygmebec-frontend/src/components/galerie/ImageViewer.jsx`

`sygmebec-vitrine/src/components/galerie/GalerieGrid.jsx` = `sygmebec-frontend/src/components/galerie/GalerieGrid.jsx`

`sygmebec-vitrine/src/components/ui/Spinner.jsx` = `sygmebec-frontend/src/components/ui/Spinner.jsx`

`sygmebec-vitrine/src/components/ui/ProgressBar.jsx` = `sygmebec-frontend/src/components/ui/ProgressBar.jsx`

`sygmebec-vitrine/src/components/ui/EmptyState.jsx` = `sygmebec-frontend/src/components/ui/EmptyState.jsx`

`sygmebec-vitrine/src/components/ui/Skeleton.jsx` = `sygmebec-frontend/src/components/ui/Skeleton.jsx`

`sygmebec-vitrine/src/components/ui/Select.jsx` = `sygmebec-frontend/src/components/ui/Select.jsx`

`sygmebec-vitrine/src/components/ui/DataTable.jsx` = `sygmebec-frontend/src/components/ui/DataTable.jsx`

`sygmebec-vitrine/src/components/ui/StatusIndicator.jsx` = `sygmebec-frontend/src/components/ui/StatusIndicator.jsx`

`sygmebec-vitrine/src/components/ui/Alert.jsx` = `sygmebec-frontend/src/components/ui/Alert.jsx`

`sygmebec-vitrine/src/components/ui/Pagination.jsx` = `sygmebec-frontend/src/components/ui/Pagination.jsx`

`sygmebec-vitrine/src/components/ui/GlassCard.jsx` = `sygmebec-frontend/src/components/ui/GlassCard.jsx`

`sygmebec-vitrine/src/components/ui/Tooltip.jsx` = `sygmebec-frontend/src/components/ui/Tooltip.jsx`

`sygmebec-vitrine/src/components/ui/Breadcrumb.jsx` = `sygmebec-frontend/src/components/ui/Breadcrumb.jsx`

`sygmebec-vitrine/src/components/membres/StatutBadge.jsx` = `sygmebec-frontend/src/components/membres/StatutBadge.jsx`

`sygmebec-vitrine/src/components/membres/HistoriqueStatutList.jsx` = `sygmebec-frontend/src/components/membres/HistoriqueStatutList.jsx`

`sygmebec-vitrine/src/components/membres/ChangerStatutModal.jsx` = `sygmebec-frontend/src/components/membres/ChangerStatutModal.jsx`

`sygmebec-vitrine/src/components/evenements/FiltresEvenements.jsx` = `sygmebec-frontend/src/components/evenements/FiltresEvenements.jsx`

`sygmebec-vitrine/src/components/common/Bouton.jsx` = `sygmebec-frontend/src/components/common/Bouton.jsx`

`sygmebec-vitrine/src/components/common/Toast.jsx` = `sygmebec-frontend/src/components/common/Toast.jsx`

`sygmebec-vitrine/src/components/common/Modal.jsx` = `sygmebec-frontend/src/components/common/Modal.jsx`

`sygmebec-vitrine/src/components/common/Loader.jsx` = `sygmebec-frontend/src/components/common/Loader.jsx`

`sygmebec-vitrine/src/components/home/PresentationSection.jsx` = `sygmebec-frontend/src/components/home/PresentationSection.jsx`

`sygmebec-vitrine/src/components/home/AppelAdhesion.jsx` = `sygmebec-frontend/src/components/home/AppelAdhesion.jsx`

`sygmebec-vitrine/src/components/home/GaleriePreview.jsx` = `sygmebec-frontend/src/components/home/GaleriePreview.jsx`

`sygmebec-vitrine/src/components/contact/ReseauxSociaux.jsx` = `sygmebec-frontend/src/components/contact/ReseauxSociaux.jsx`

`sygmebec-vitrine/src/components/contact/Carte.jsx` = `sygmebec-frontend/src/components/contact/Carte.jsx`

`media/membres/photos/1782488787_Sooly_PwYBNnQ.jpg` = `media/membres/photos/Sooly.jpg` = `media/membres/photos/1782488787_Sooly_RBBBlrn.jpg` = `media/membres/photos/1782488787_Sooly.jpg` = `media/membres/photos/1782488787_Sooly_45TBHfx.jpg` = `media/membres/photos/1782488787_Sooly_GnoLntJ.jpg` = `media/membres/photos/1782488787_Sooly_LtDgQcp.jpg` = `media/membres/photos/1782488787_Sooly_CSMg4mB.jpg` = `media/membres/photos/1782488787_Sooly_6nUu2OE.jpg` = `media/demandes-adhesion/photos/1782488787_Sooly.jpg`

Les modèles DOCX actifs sont ceux de sygmebec_backend/apps/letters/templates/letters/ ; les copies dans Mes fichier/ peuvent rester dans une archive documentaire externe.

### Photos dupliquées : références à préserver
La photo Sooly existe en dix exemplaires identiques. La base fournie référence actuellement :

- media/membres/photos/1782488787_Sooly_LtDgQcp.jpg
- media/demandes-adhesion/photos/1782488787_Sooly.jpg

Ces deux chemins doivent être conservés tant que les enregistrements les utilisent. Les huit autres copies du groupe ne sont pas retrouvées dans les champs de médias inspectés de la base fournie ; vérifier une éventuelle base externe et les sauvegardes avant retrait. L’image media/evenements/ChatGPT_Image_5_août_2026_14_14_54.png est également référencée par un événement : ne pas l’effacer parce qu’elle est identique à une image public/.

## 6. Fichiers non reliés aux interfaces actuelles — liste intégrale
Chemins relatifs à l’interface indiquée. Les fichiers restent potentiellement utiles pour restaurer des fonctionnalités. Retirer par fonctionnalité complète et après validation, pas fichier par fichier à l’aveugle.

### sygmebec-frontend — 79 fichiers

- `src/components/adhesion/FormulaireAdhesion.jsx`
- `src/components/common/Bouton.jsx`
- `src/components/common/Loader.jsx`
- `src/components/common/Modal.jsx`
- `src/components/common/SEO.jsx`
- `src/components/common/Toast.jsx`
- `src/components/contact/Carte.jsx`
- `src/components/contact/ContactForm.jsx`
- `src/components/contact/ReseauxSociaux.jsx`
- `src/components/evenements/EvenementCalendrier.jsx`
- `src/components/evenements/EvenementCard.jsx`
- `src/components/evenements/FiltresEvenements.jsx`
- `src/components/evenements/FormulaireInscription.jsx`
- `src/components/galerie/GalerieGrid.jsx`
- `src/components/galerie/ImageViewer.jsx`
- `src/components/home/AppelAdhesion.jsx`
- `src/components/home/EvenementsAVenir.jsx`
- `src/components/home/GaleriePreview.jsx`
- `src/components/home/Hero.jsx`
- `src/components/home/PresentationSection.jsx`
- `src/components/home/Temoignages.jsx`
- `src/components/membres/MembreCard.jsx`
- `src/components/ui/Alert.jsx`
- `src/components/ui/Breadcrumb.jsx`
- `src/components/ui/Chip.jsx`
- `src/components/ui/DataTable.jsx`
- `src/components/ui/EmptyState.jsx`
- `src/components/ui/GlassCard.jsx`
- `src/components/ui/Logo.jsx`
- `src/components/ui/Pagination.jsx`
- `src/components/ui/ProgressBar.jsx`
- `src/components/ui/Skeleton.jsx`
- `src/components/ui/Spinner.jsx`
- `src/components/ui/StatCard.jsx`
- `src/components/ui/StatusIndicator.jsx`
- `src/components/ui/Switch.jsx`
- `src/components/ui/Table.jsx`
- `src/components/ui/Tabs.jsx`
- `src/components/ui/ToastContainer.jsx`
- `src/components/ui/Tooltip.jsx`
- `src/hooks/useAuthMembre.js`
- `src/hooks/useDebounce.js`
- `src/hooks/useDisponibilitesEvenement.js`
- `src/hooks/useScrollRestoration.js`
- `src/hooks/validators.js`
- `src/layouts/PublicLayout.jsx`
- `src/layouts/components/Footer.jsx`
- `src/layouts/components/Header.jsx`
- `src/layouts/components/MobileMenu.jsx`
- `src/layouts/components/NavBar.jsx`
- `src/pages/APropos.jsx`
- `src/pages/Accueil.jsx`
- `src/pages/Adhesion.jsx`
- `src/pages/Confidentialite.jsx`
- `src/pages/Contact.jsx`
- `src/pages/EvenementDetail.jsx`
- `src/pages/Evenements.jsx`
- `src/pages/Galerie.jsx`
- `src/pages/MentionsLegales.jsx`
- `src/pages/NotFound.jsx`
- `src/pages/espace-membre/Connexion.jsx`
- `src/pages/espace-membre/MesInscriptions.jsx`
- `src/pages/espace-membre/MonProfil.jsx`
- `src/pages/espace-membre/MotDePasseOublie.jsx`
- `src/pages/membres/DemandesAdhesionPage.jsx`
- `src/pages/settingsFrame.css`
- `src/pages/settingsReference.css`
- `src/services/adhesionService.js`
- `src/services/api.js`
- `src/services/authMembreService.js`
- `src/services/contactService.js`
- `src/services/evenementService.js`
- `src/store/index.js`
- `src/store/slices/authMembreSlice.js`
- `src/store/slices/uiSlice.js`
- `src/styles/tailwind.config.js` — vide ; configuration effective à la racine
- `src/utils/constants.js`
- `src/utils/formatters.js`
- `src/utils/validators.js`
### sygmebec-vitrine — 122 fichiers

- `src/components/Layout.jsx`
- `src/components/RequireMember.jsx`
- `src/components/Shared.jsx`
- `src/components/about/AboutLanding.jsx`
- `src/components/about/aboutLanding.css`
- `src/components/adhesion/FormulaireAdhesion.jsx`
- `src/components/common/Bouton.jsx`
- `src/components/common/Loader.jsx`
- `src/components/common/Modal.jsx`
- `src/components/common/SEO.jsx`
- `src/components/common/Toast.jsx`
- `src/components/comptes/UtilisateurForm.jsx`
- `src/components/contact/Carte.jsx`
- `src/components/contact/ContactForm.jsx`
- `src/components/contact/ReseauxSociaux.jsx`
- `src/components/evenements/EvenementCalendrier.jsx`
- `src/components/evenements/EvenementCard.jsx`
- `src/components/evenements/EvenementForm.jsx`
- `src/components/evenements/FiltresEvenements.jsx`
- `src/components/evenements/FormulaireInscription.jsx`
- `src/components/galerie/GalerieGrid.jsx`
- `src/components/galerie/ImageViewer.jsx`
- `src/components/home/AppelAdhesion.jsx`
- `src/components/home/ChurchInfoSection.jsx`
- `src/components/home/EvenementsAVenir.jsx`
- `src/components/home/GaleriePreview.jsx`
- `src/components/home/Hero.jsx`
- `src/components/home/HomeLanding.jsx`
- `src/components/home/IdentityHighlights.jsx`
- `src/components/home/MembershipInfo.jsx`
- `src/components/home/PresentationSection.jsx`
- `src/components/home/Temoignages.jsx`
- `src/components/home/homeLanding.css`
- `src/components/layout/Navbar.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/components/membres/ChangerStatutModal.jsx`
- `src/components/membres/HistoriqueStatutList.jsx`
- `src/components/membres/MembreCard.jsx`
- `src/components/membres/MembreForm.jsx`
- `src/components/membres/StatutBadge.jsx`
- `src/components/rapports/RapportForm.jsx`
- `src/components/ui/Alert.jsx`
- `src/components/ui/AnimatedCard.jsx`
- `src/components/ui/AnimatedSection.jsx`
- `src/components/ui/Avatar.jsx`
- `src/components/ui/Badge.jsx`
- `src/components/ui/Breadcrumb.jsx`
- `src/components/ui/Button.jsx`
- `src/components/ui/Card.jsx`
- `src/components/ui/Chip.jsx`
- `src/components/ui/ConfirmDialog.jsx`
- `src/components/ui/DataTable.jsx`
- `src/components/ui/Dropdown.jsx`
- `src/components/ui/EmptyState.jsx`
- `src/components/ui/GlassCard.jsx`
- `src/components/ui/Input.jsx`
- `src/components/ui/LanguageSelect.jsx`
- `src/components/ui/Logo.jsx`
- `src/components/ui/Modal.jsx`
- `src/components/ui/Pagination.jsx`
- `src/components/ui/ProgressBar.jsx`
- `src/components/ui/Select.jsx`
- `src/components/ui/Skeleton.jsx`
- `src/components/ui/Spinner.jsx`
- `src/components/ui/StatCard.jsx`
- `src/components/ui/StatusIndicator.jsx`
- `src/components/ui/Switch.jsx`
- `src/components/ui/Table.jsx`
- `src/components/ui/Tabs.jsx`
- `src/components/ui/ToastContainer.jsx`
- `src/components/ui/Tooltip.jsx`
- `src/content/churchContent.js`
- `src/layouts/AuthLayout.jsx`
- `src/layouts/ErrorBoundary.jsx`
- `src/layouts/MainLayout.jsx`
- `src/layouts/PublicLayout.jsx`
- `src/layouts/components/Footer.jsx`
- `src/layouts/components/Header.jsx`
- `src/layouts/components/MobileMenu.jsx`
- `src/layouts/components/NavBar.jsx`
- `src/pages/APropos.jsx`
- `src/pages/Accueil.jsx`
- `src/pages/Adhesion.jsx`
- `src/pages/Confidentialite.jsx`
- `src/pages/Contact.jsx`
- `src/pages/DashboardPage.jsx`
- `src/pages/EvenementDetail.jsx`
- `src/pages/Evenements.jsx`
- `src/pages/Galerie.jsx`
- `src/pages/MentionsLegales.jsx`
- `src/pages/NotFound.jsx`
- `src/pages/ProfilePage.jsx`
- `src/pages/PublicPages.jsx`
- `src/pages/SettingsPage.jsx`
- `src/pages/audit/AuditLogsPage.jsx`
- `src/pages/auth/LoginPage.jsx`
- `src/pages/auth/RegisterPage.jsx`
- `src/pages/comptes/ComptesListPage.jsx`
- `src/pages/comptes/DemandesAdhesionPage.jsx`
- `src/pages/espace-membre/Connexion.jsx`
- `src/pages/espace-membre/MesInscriptions.jsx`
- `src/pages/espace-membre/MonProfil.jsx`
- `src/pages/espace-membre/MotDePasseOublie.jsx`
- `src/pages/espace-membre/profileReference.css`
- `src/pages/evenements/EvenementCreatePage.jsx`
- `src/pages/evenements/EvenementDetailPage.jsx`
- `src/pages/evenements/EvenementEditPage.jsx`
- `src/pages/evenements/EvenementsListPage.jsx`
- `src/pages/membres/MembreCreatePage.jsx`
- `src/pages/membres/MembreDetailPage.jsx`
- `src/pages/membres/MembreEditPage.jsx`
- `src/pages/membres/MembresListPage.jsx`
- `src/pages/rapports/RapportGenererPage.jsx`
- `src/pages/rapports/RapportsListPage.jsx`
- `src/services/adhesionService.js`
- `src/services/authMembreService.js`
- `src/services/contactService.js`
- `src/services/evenementService.js`
- `src/services/publicApi.js`
- `src/utils/formatDate.js`
- `src/utils/passwordPolicy.js`
- `src/utils/validation.js` — **utilisé par tests/formValidation.test.mjs : conserver avec ses tests**

## 7. Archives et outils ponctuels

- Mes fichier/ (49 fichiers, environ 12,38 Mio) : maquettes HTML, textes, plans, documents et images de référence. Pas de référence directe à ce dossier trouvée dans le code examiné. Déplacer vers une archive documentaire plutôt que qualifier ces contenus d’inutiles.
- _rewriteLoginPalette.mjs : outil ponctuel de réécriture de couleurs, pas appelé par les scripts npm inspectés. Archivable si la migration est terminée.
- sygmebec-vitrine/scripts/ : outils de traduction et catalogues de travail. Non appelés par les scripts npm dev/build/preview, mais peuvent servir à maintenir les traductions ; archiver seulement si ce travail est terminé.
- db.sqlite3.before-migrations-20260901-1450.bak : ancienne sauvegarde SQLite (33 tables). Ce n’est pas un doublon exact de la base actuelle ; conserver séparément selon le besoin de restauration.

## 8. À conserver

- db.sqlite3 à la racine, données media/ référencées et migrations Django.
- Les fichiers __init__.py, même vides ou identiques : ils structurent les paquets.
- Les tests, fixtures et commandes management : leur utilisation ne passe pas forcément par des imports applicatifs.
- Logo.png, utilisé par le frontend ; les modèles DOCX de lettres actifs.
- Les manifestes de dépendances, fichiers de verrouillage et configurations de build.
- Dans la vitrine actuelle : src/globe/, src/theme/ThemeProvider.jsx, src/services/api.js, src/main.jsx, src/App.jsx et leurs dépendances. **Le services/api.js de la vitrine est actif ; celui du frontend est vide.**
- Les applications backend ne sont pas inutiles simplement parce qu’une page React ne les utilise pas : leurs API et modèles restent enregistrés.

## 9. Ordre conseillé

1. Alléger les prochaines archives en excluant dépendances et caches régénérables.
2. Retirer les fichiers vides et le squelette api/ après sauvegarde.
3. Décider si les pages de l’église doivent être restaurées ou archivées : cela détermine le sort des anciennes pages React.
4. Conserver une seule configuration de lancement Django, puis rationaliser les routeurs doublonnés.
5. Traiter les photos en mettant d’abord à jour les références de base de données.
6. Vérifier les compilations, le démarrage Django et les fonctions concernées après chaque retrait.

Le présent audit fournit des candidats et leur justification ; il ne constitue pas une garantie d’absence d’usage dans un environnement de production externe non fourni.
