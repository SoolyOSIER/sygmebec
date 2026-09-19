export const OFFICIAL_SOCIAL = {
  facebook: 'https://www.facebook.com/Globein21',
  youtube: 'https://www.youtube.com/@GlobeInfosports21',
}

export const SPORTS = ['Football', 'Basketball', 'Athlétisme', 'Tennis', 'Combat', 'Cyclisme', 'Volleyball', 'Multisport']

export const COUNTRIES = ['Haïti', 'France', 'Brésil', 'Argentine', 'Canada', 'États-Unis', 'Afrique', 'Europe', 'International']

export const FALLBACK_ARTICLES = [
  {
    id: 'welcome',
    slug: 'bienvenue-globe-info-sport',
    title: 'Globe Info Sport : le sport, sans frontières',
    excerpt: 'Une rédaction ouverte sur Haïti, la Caraïbe et toutes les compétitions qui font vibrer le monde.',
    body: 'Globe Info Sport suit les performances, les histoires et les rendez-vous qui comptent. Notre rédaction donne une place particulière au sport haïtien tout en regardant chaque terrain, chaque championnat et chaque sélection à travers le monde.\n\nCette vitrine est prête à accueillir vos articles, vos analyses, vos vidéos et vos sources officielles depuis l’espace Rédaction.',
    category_name: 'Éditorial', sport: 'Multisport', country: 'Haïti', haiti_focus: true,
    tags: ['Globe Info Sport', 'Haïti', 'Monde'], published_at: '2026-09-14T08:00:00Z',
    author_name: 'La rédaction Globe Info Sport', reading_time: 2, views: 0, is_featured: true,
  },
  {
    id: 'agenda',
    slug: 'un-agenda-pour-tous-les-sports',
    title: 'Un agenda pour tous les sports et tous les pays',
    excerpt: 'Football, basket, athlétisme, tennis et disciplines émergentes : les grands rendez-vous trouvent leur place ici.',
    body: 'La ligne éditoriale de Globe Info Sport dépasse les frontières et les habitudes. Chaque publication peut être reliée à un sport, à un pays, à une compétition et à une source vérifiée.\n\nUtilisez l’espace Rédaction pour faire vivre cet agenda avec vos informations de terrain.',
    category_name: 'À suivre', sport: 'Multisport', country: 'International', haiti_focus: false,
    tags: ['Agenda', 'Compétitions'], published_at: '2026-09-13T12:00:00Z',
    author_name: 'Globe Info Sport', reading_time: 2, views: 0,
  },
  {
    id: 'haiti',
    slug: 'haiti-au-coeur-du-jeu',
    title: 'Haïti au cœur du jeu',
    excerpt: 'Les athlètes, clubs et sélections haïtiens disposent d’un espace éditorial visible et permanent.',
    body: 'Le sport haïtien fait partie du regard mondial de Globe Info Sport. Les résultats, les portraits, les initiatives locales et les parcours de la diaspora peuvent être publiés avec le même soin que les grandes compétitions internationales.',
    category_name: 'Haïti', sport: 'Multisport', country: 'Haïti', haiti_focus: true,
    tags: ['Haïti', 'Diaspora'], published_at: '2026-09-12T16:30:00Z',
    author_name: 'Globe Info Sport', reading_time: 1, views: 0,
  },
]

export const categoryTone = (sport = '') => ({
  Football: 'football', Basketball: 'basketball', Athlétisme: 'athletics', Tennis: 'tennis',
  Combat: 'combat', Cyclisme: 'cycling', Volleyball: 'volleyball',
}[sport] || 'multisport')

export const formatDate = (value, locale = 'fr-HT') => {
  if (!value) return 'À venir'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'À venir'
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}
