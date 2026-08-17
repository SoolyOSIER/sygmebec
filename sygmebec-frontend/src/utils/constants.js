// src/utils/constants.js
export const ROLES = {
  ADMIN: 'ADMIN',
  SECRETAIRE: 'SECRETAIRE',
  RESPONSABLE: 'RESPONSABLE',
  MEMBRE: 'MEMBRE',
}

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrateur',
  [ROLES.SECRETAIRE]: 'Secrétaire',
  [ROLES.RESPONSABLE]: 'Responsable',
  [ROLES.MEMBRE]: 'Membre',
}

export const STATUTS_MEMBRE = {
  ACTIF: 'ACTIF',
  INACTIF: 'INACTIF',
  SUSPENDU: 'SUSPENDU',
}

export const STATUTS_MEMBRE_LABELS = {
  [STATUTS_MEMBRE.ACTIF]: 'Actif',
  [STATUTS_MEMBRE.INACTIF]: 'Inactif',
  [STATUTS_MEMBRE.SUSPENDU]: 'Suspendu',
}

export const STATUTS_EVENEMENT = {
  EN_ATTENTE: 'EN_ATTENTE',
  CONFIRMEE: 'CONFIRMEE',
  ANNULEE: 'ANNULEE',
}

export const STATUTS_EVENEMENT_LABELS = {
  [STATUTS_EVENEMENT.EN_ATTENTE]: 'En attente',
  [STATUTS_EVENEMENT.CONFIRMEE]: 'Confirmée',
  [STATUTS_EVENEMENT.ANNULEE]: 'Annulée',
}

export const SEXES = {
  M: 'M',
  F: 'F',
}

export const SEXES_LABELS = {
  [SEXES.M]: 'Homme',
  [SEXES.F]: 'Femme',
}

export const ETATS_MATRIMONIAUX = {
  CELIBATAIRE: 'CELIBATAIRE',
  MARIE: 'MARIE',
  VEUF: 'VEUF',
  DIVORCE: 'DIVORCE',
}

export const ETATS_MATRIMONIAUX_LABELS = {
  [ETATS_MATRIMONIAUX.CELIBATAIRE]: 'Célibataire',
  [ETATS_MATRIMONIAUX.MARIE]: 'Marié(e)',
  [ETATS_MATRIMONIAUX.VEUF]: 'Veuf/Veuve',
  [ETATS_MATRIMONIAUX.DIVORCE]: 'Divorcé(e)',
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/connexion/',
    LOGOUT: '/auth/deconnexion/',
    REFRESH: '/auth/rafraichir-token/',
    FORGOT_PASSWORD: '/auth/mot-de-passe/oublie/',
    RESET_PASSWORD: '/auth/mot-de-passe/reinitialiser/',
    PROFILE: '/auth/moi/',
  },
  MEMBRES: {
    LIST: '/membres/',
    DETAIL: '/membres/{id}/',
    CREATE: '/membres/',
    UPDATE: '/membres/{id}/',
    DELETE: '/membres/{id}/',
    STATUT: '/membres/{id}/statut/',
    EXPORT: '/membres/export/',
  },
  EVENEMENTS: {
    LIST: '/evenements/',
    DETAIL: '/evenements/{id}/',
    CREATE: '/evenements/',
    UPDATE: '/evenements/{id}/',
    DELETE: '/evenements/{id}/',
    SEARCH: '/evenements/rechercher/',
    INSCRIPTION: '/evenements/{id}/inscription/',
    PARTICIPATIONS: '/evenements/{id}/participations/',
  },
  DASHBOARD: {
    ADMIN: '/dashboard/admin/',
    SECRETAIRE: '/dashboard/secretaire/',
    RESPONSABLE: '/dashboard/responsable/',
  },
}