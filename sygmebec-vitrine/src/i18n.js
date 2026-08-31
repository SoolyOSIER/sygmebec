import { useEffect } from 'react'
import { create } from 'zustand'

const translations = {
  ht: {
    Accueil: 'Akèy', 'À propos': 'Konsènan nou', Événements: 'Evènman', Galerie: 'Galri', Adhésion: 'Adesyon', Contact: 'Kontak',
    'Espace gestion': 'Espas jesyon', 'Espace membre': 'Espas manm', 'Mon espace': 'Espas mwen', Déconnexion: 'Dekonekte',
    'Mentions légales': 'Avi legal', Confidentialité: 'Konfidansyalite', Connexion: 'Koneksyon',
    'Mot de passe': 'Modpas', 'Se souvenir de moi': 'Sonje mwen', Enregistrer: 'Anrejistre', Annuler: 'Anile',
    'Prénom': 'Prenon', Nom: 'Siyati', Adresse: 'Adrès', Téléphone: 'Telefòn', Email: 'Imèl', Envoyer: 'Voye',
    'Chargement…': 'Ap chaje…', 'Une erreur est survenue. Veuillez réessayer.': 'Yon erè rive. Tanpri eseye ankò.',
  },
  en: {
    Accueil: 'Home', 'À propos': 'About', Événements: 'Events', Galerie: 'Gallery', Adhésion: 'Membership', Contact: 'Contact',
    'Espace gestion': 'Management area', 'Espace membre': 'Member area', 'Mon espace': 'My area', Déconnexion: 'Sign out',
    'Mentions légales': 'Legal notice', Confidentialité: 'Privacy', Connexion: 'Sign in',
    'Mot de passe': 'Password', 'Se souvenir de moi': 'Remember me', Enregistrer: 'Save', Annuler: 'Cancel',
    'Prénom': 'First name', Nom: 'Last name', Adresse: 'Address', Téléphone: 'Phone', Email: 'Email', Envoyer: 'Send',
    'Chargement…': 'Loading…', 'Une erreur est survenue. Veuillez réessayer.': 'An error occurred. Please try again.',
  },
}

const textSources = new WeakMap()
const attributeSources = new WeakMap()
const attributes = ['placeholder', 'title', 'aria-label', 'alt']

const translateTree = (element, dictionary) => {
  attributes.forEach((attribute) => {
    const current = element.getAttribute?.(attribute)
    if (!current) return
    const sources = attributeSources.get(element) || {}
    if (!sources[attribute]) sources[attribute] = current
    attributeSources.set(element, sources)
    element.setAttribute(attribute, dictionary[sources[attribute]] || sources[attribute])
  })
  for (const node of element.childNodes || []) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!textSources.has(node)) textSources.set(node, node.nodeValue)
      const source = textSources.get(node)
      const trimmed = source.trim()
      if (trimmed) node.nodeValue = source.replace(trimmed, dictionary[trimmed] || trimmed)
    } else if (node.nodeType === Node.ELEMENT_NODE && !node.hasAttribute('data-no-translate')) translateTree(node, dictionary)
  }
}

export const useLanguageStore = create((set) => ({
  language: ['fr', 'ht', 'en'].includes(localStorage.getItem('sygmebec-language')) ? localStorage.getItem('sygmebec-language') : 'fr',
  setLanguage: (language) => {
    const next = ['fr', 'ht', 'en'].includes(language) ? language : 'fr'
    localStorage.setItem('sygmebec-language', next)
    set({ language: next })
  },
}))

export function GlobalTranslator({ children }) {
  const language = useLanguageStore((state) => state.language)
  useEffect(() => {
    const dictionary = translations[language] || {}
    const translate = (node = document.body) => translateTree(node, dictionary)
    translate()
    document.documentElement.lang = { fr: 'fr-HT', ht: 'ht-HT', en: 'en-US' }[language]
    const observer = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) translateTree(node, dictionary)
    })))
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [language])
  return children
}
