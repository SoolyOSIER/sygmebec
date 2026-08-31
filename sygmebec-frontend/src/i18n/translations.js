// Le français est la langue source. Toute nouvelle chaîne visible doit être
// ajoutée ici avec ses trois versions avant d'être utilisée dans l'interface.
const translations = {
  fr: {
    common: {
      save: 'Enregistrer', cancel: 'Annuler', close: 'Fermer', delete: 'Supprimer', edit: 'Modifier',
      searchMember: 'Rechercher un membre…', language: 'Langue', theme: 'Thème',
      light: 'Clair', dark: 'Sombre', system: 'Système', loading: 'Chargement…',
      notSpecified: 'Non renseigné', dateToDefine: 'Date à définir', recent: 'Récent',
    },
    navigation: {
      dashboard: 'Tableau de bord', members: 'Membres', onlineRegistrations: 'Inscriptions en ligne',
      events: 'Événements', gallery: 'Images vitrine', reports: 'Rapports', letters: 'Lettres',
      accounts: 'Comptes', statistics: 'Statistiques', trash: 'Corbeille', settings: 'Paramètres',
      profile: 'Mon profil', logout: 'Déconnexion', collapseMenu: 'Réduire le menu', openMenu: 'Ouvrir le menu',
    },
    notifications: {
      title: 'Notifications', unread: '{{count}} non lue', unread_plural: '{{count}} non lues',
      markAllRead: 'Tout lire', empty: 'Aucune notification non lue.', newMember: 'Nouveau membre',
      memberAdded: 'Membre ajouté', upcomingEvent: 'Événement à venir', scheduledEvent: 'Événement programmé',
    },
    preferences: { title: 'Préférences', languageHelp: 'Langue mémorisée pour l’interface.', appearance: 'Apparence', saved: 'Préférences enregistrées.' },
    dashboard: { men: 'Hommes', women: 'Femmes', membersCount: '{{count}} membre', membersCount_plural: '{{count}} membres', feminineNotSpecified: 'Non renseignée', administrator: 'Administrateur', viewAll: 'Voir tout', recentMembers: 'Membres récents', latestRegistrations: 'Dernières inscriptions', memberProfile: 'Profil membre', new: 'Nouveau', noMember: 'Aucun membre enregistré', upcomingAppointments: 'Prochains rendez-vous', locationToSet: 'Lieu à définir', noPlannedEvent: 'Aucun événement planifié', activities: 'Activités', latestActions: 'Dernières actions', aMember: 'Un membre', joinedDirectory: 'a rejoint le registre', noRecentActivity: 'Aucune activité récente' },
    members: { dateNotSpecified: 'Date non renseignée', today: 'Aujourd’hui', daysAgo: 'Il y a {{count}} jour', daysAgo_plural: 'Il y a {{count}} jours', results: '{{count}} résultat', results_plural: '{{count}} résultats', member: 'membre', member_plural: 'membres', showing: 'Affichage de {{from}} à {{to}} sur {{total}} membres' },
    memberForm: { lastNameRequired: 'Le nom est requis.', firstNameRequired: 'Le prénom est requis.', phoneRequired: 'Le téléphone est requis.', statusRequired: 'Le statut est requis.' },
    events: { today: 'Aujourd’hui', past: 'Passé', upcoming: 'À venir', dateTimeRequired: 'La date et l’heure sont requises.', locationRequired: 'Le lieu est requis.', dateTimeToSet: 'Date et heure à définir', defaultTitle: 'Événement du {{date}}', otherEvents: '+{{count}} autre', otherEvents_plural: '+{{count}} autres', registrationSuccess: 'Inscription réussie !', registrationError: 'Erreur lors de l’inscription', registering: 'Inscription en cours...', register: 'S’inscrire', availablePlaces: 'Maximum {{count}} places disponibles' },
  },
  ht: {
    common: {
      save: 'Anrejistre', cancel: 'Anile', close: 'Fèmen', delete: 'Efase', edit: 'Modifye',
      searchMember: 'Chèche yon manm…', language: 'Lang', theme: 'Tèm',
      light: 'Klè', dark: 'Fonse', system: 'Sistèm', loading: 'Ap chaje…',
      notSpecified: 'Pa endike', dateToDefine: 'Dat pou defini', recent: 'Resan',
    },
    navigation: {
      dashboard: 'Tablo kontwòl', members: 'Manm', onlineRegistrations: 'Enskripsyon sou entènèt',
      events: 'Evènman', gallery: 'Imaj vitrin', reports: 'Rapò', letters: 'Lèt',
      accounts: 'Kont', statistics: 'Estatistik', trash: 'Poubèl', settings: 'Paramèt',
      profile: 'Pwofil mwen', logout: 'Dekonekte', collapseMenu: 'Redui meni an', openMenu: 'Louvri meni an',
    },
    notifications: {
      title: 'Notifikasyon', unread: '{{count}} ki poko li', unread_plural: '{{count}} ki poko li',
      markAllRead: 'Li tout', empty: 'Pa gen notifikasyon ki poko li.', newMember: 'Nouvo manm',
      memberAdded: 'Manm ajoute', upcomingEvent: 'Evènman k ap vini', scheduledEvent: 'Evènman pwograme',
    },
    preferences: { title: 'Preferans', languageHelp: 'Lang yo konsève pou koòdone a.', appearance: 'Aparans', saved: 'Preferans yo anrejistre.' },
    dashboard: { men: 'Gason', women: 'Fanm', membersCount: '{{count}} manm', membersCount_plural: '{{count}} manm', feminineNotSpecified: 'Pa endike', administrator: 'Administratè', viewAll: 'Wè tout', recentMembers: 'Manm resan yo', latestRegistrations: 'Dènye enskripsyon yo', memberProfile: 'Pwofil manm', new: 'Nouvo', noMember: 'Pa gen manm ki anrejistre', upcomingAppointments: 'Pwochen randevou yo', locationToSet: 'Kote pou defini', noPlannedEvent: 'Pa gen evènman ki planifye', activities: 'Aktivite yo', latestActions: 'Dènye aksyon yo', aMember: 'Yon manm', joinedDirectory: 'antre nan rejis la', noRecentActivity: 'Pa gen aktivite resan' },
    members: { dateNotSpecified: 'Dat pa endike', today: 'Jodi a', daysAgo: 'Sa fè {{count}} jou', daysAgo_plural: 'Sa fè {{count}} jou', results: '{{count}} rezilta', results_plural: '{{count}} rezilta', member: 'manm', member_plural: 'manm', showing: 'Ap montre {{from}} rive {{to}} sou {{total}} manm' },
    memberForm: { lastNameRequired: 'Siyati a obligatwa.', firstNameRequired: 'Prenon an obligatwa.', phoneRequired: 'Telefòn lan obligatwa.', statusRequired: 'Estati a obligatwa.' },
    events: { today: 'Jodi a', past: 'Pase', upcoming: 'K ap vini', dateTimeRequired: 'Dat ak lè yo obligatwa.', locationRequired: 'Kote a obligatwa.', dateTimeToSet: 'Dat ak lè pou defini', defaultTitle: 'Evènman {{date}}', otherEvents: '+{{count}} lòt', otherEvents_plural: '+{{count}} lòt', registrationSuccess: 'Enskripsyon reyisi!', registrationError: 'Erè pandan enskripsyon an', registering: 'Enskripsyon ap fèt...', register: 'Enskri', availablePlaces: 'Maksimòm {{count}} plas disponib' },
  },
  en: {
    common: {
      save: 'Save', cancel: 'Cancel', close: 'Close', delete: 'Delete', edit: 'Edit',
      searchMember: 'Search for a member…', language: 'Language', theme: 'Theme',
      light: 'Light', dark: 'Dark', system: 'System', loading: 'Loading…',
      notSpecified: 'Not specified', dateToDefine: 'Date to be set', recent: 'Recent',
    },
    navigation: {
      dashboard: 'Dashboard', members: 'Members', onlineRegistrations: 'Online registrations',
      events: 'Events', gallery: 'Website images', reports: 'Reports', letters: 'Letters',
      accounts: 'Accounts', statistics: 'Statistics', trash: 'Trash', settings: 'Settings',
      profile: 'My profile', logout: 'Sign out', collapseMenu: 'Collapse menu', openMenu: 'Open menu',
    },
    notifications: {
      title: 'Notifications', unread: '{{count}} unread', unread_plural: '{{count}} unread',
      markAllRead: 'Mark all as read', empty: 'No unread notifications.', newMember: 'New member',
      memberAdded: 'Member added', upcomingEvent: 'Upcoming event', scheduledEvent: 'Scheduled event',
    },
    preferences: { title: 'Preferences', languageHelp: 'Language saved for the interface.', appearance: 'Appearance', saved: 'Preferences saved.' },
    dashboard: { men: 'Men', women: 'Women', membersCount: '{{count}} member', membersCount_plural: '{{count}} members', feminineNotSpecified: 'Not specified', administrator: 'Administrator', viewAll: 'View all', recentMembers: 'Recent members', latestRegistrations: 'Latest registrations', memberProfile: 'Member profile', new: 'New', noMember: 'No members registered', upcomingAppointments: 'Upcoming appointments', locationToSet: 'Location to be set', noPlannedEvent: 'No events planned', activities: 'Activities', latestActions: 'Latest actions', aMember: 'A member', joinedDirectory: 'joined the directory', noRecentActivity: 'No recent activity' },
    members: { dateNotSpecified: 'Date not specified', today: 'Today', daysAgo: '{{count}} day ago', daysAgo_plural: '{{count}} days ago', results: '{{count}} result', results_plural: '{{count}} results', member: 'member', member_plural: 'members', showing: 'Showing {{from}} to {{to}} of {{total}} members' },
    memberForm: { lastNameRequired: 'Last name is required.', firstNameRequired: 'First name is required.', phoneRequired: 'Phone number is required.', statusRequired: 'Status is required.' },
    events: { today: 'Today', past: 'Past', upcoming: 'Upcoming', dateTimeRequired: 'Date and time are required.', locationRequired: 'Location is required.', dateTimeToSet: 'Date and time to be set', defaultTitle: 'Event on {{date}}', otherEvents: '+{{count}} other', otherEvents_plural: '+{{count}} others', registrationSuccess: 'Registration successful!', registrationError: 'Registration failed', registering: 'Registering...', register: 'Register', availablePlaces: 'Maximum {{count}} places available' },
  },
}

export default translations
