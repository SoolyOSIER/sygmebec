import { useEffect } from 'react'
import { create } from 'zustand'
import messages from './locales/messages.json'

export const LANGUAGES = [
  { code: 'fr', label: 'Français', locale: 'fr-HT' },
  { code: 'ht', label: 'Kreyòl ayisyen', locale: 'ht-HT' },
  { code: 'en', label: 'English', locale: 'en-US' },
]
const storageKey = 'sygmebec-language'
const supported = (value) => LANGUAGES.some(({ code }) => code === value)
const readLanguage = () => {
  try { const saved = localStorage.getItem(storageKey); if (supported(saved)) return saved } catch { /* Storage may be disabled. */ }
  return 'fr'
}
export const useLanguageStore = create((set) => ({
  language: readLanguage(),
  setLanguage: (value) => {
    const language = supported(value) ? value : 'fr'
    try { localStorage.setItem(storageKey, language) } catch { /* Keep the in-memory selection. */ }
    set({ language })
  },
}))
const normalize = (text) => text.replace(/\s+/g, ' ').replace(/[’‘]/g, "'").trim()
const dictionaries = Object.fromEntries(['ht', 'en'].map((language) => [language,
  Object.fromEntries(Object.entries(messages).map(([source, translations]) => [normalize(source), translations[language]])),
]))

// React elements and business data retain their identity; only display strings are translated.
export function t(source, values = {}, language = useLanguageStore.getState().language) {
  if (typeof source !== 'string') return source
  const key = normalize(source)
  let result = language === 'fr' ? source : dictionaries[language]?.[key]
  if (result === undefined) {
    const decorated = source.match(/^(.*?)(\s*(?:\*|:)\s*)$/)
    const title = source.match(/^(.*?) - (.+)$/)
    if (decorated && dictionaries[language]?.[normalize(decorated[1])]) result = t(decorated[1], {}, language) + decorated[2]
    else if (title && dictionaries[language]?.[normalize(title[1])]) result = t(title[1], {}, language) + ' - ' + title[2]
    else result = source
  } else if (language !== 'fr') {
    result = (source.match(/^\s*/)?.[0] || '') + result + (source.match(/\s*$/)?.[0] || '')
  }
  return result.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match)
}
export function useTranslation() {
  const language = useLanguageStore((state) => state.language)
  return { language, t: (source, values) => t(source, values, language), locale: getLocale(language) }
}
export const getLocale = (language = useLanguageStore.getState().language) => LANGUAGES.find((item) => item.code === language)?.locale || 'fr-HT'

// Explicit Creole names avoid browsers silently falling back to English ICU data.
const months = ['janvye', 'fevriye', 'mas', 'avril', 'me', 'jen', 'jiyè', 'out', 'septanm', 'oktòb', 'novanm', 'desanm']
const days = ['dimanch', 'lendi', 'madi', 'mèkredi', 'jedi', 'vandredi', 'samdi']
export function localizedDate(value, options = { dateStyle: 'long' }) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const language = useLanguageStore.getState().language
  if (language !== 'ht') return new Intl.DateTimeFormat(getLocale(language), options).format(date)
  const dateOptions = { ...options }
  delete dateOptions.timeStyle
  if (options.hour || (!options.dateStyle && options.timeStyle)) return new Intl.DateTimeFormat('fr-HT', options).format(date)
  let result = new Intl.DateTimeFormat('fr-HT', dateOptions).format(date)
  const frenchMonths = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
  const frenchDays = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  if (options.month === 'short') result = months[date.getMonth()].slice(0, 3)
  else { frenchMonths.forEach((name, i) => { result = result.replace(name, months[i]) }); frenchDays.forEach((name, i) => { result = result.replace(name, days[i]) }) }
  if (options.timeStyle) result += ' ' + new Intl.DateTimeFormat('fr-HT', { timeStyle: options.timeStyle }).format(date)
  return result
}
export function GlobalTranslator({ children }) {
  const language = useLanguageStore((state) => state.language)
  useEffect(() => { document.documentElement.lang = getLocale(language) }, [language])
  useEffect(() => {
    const sync = (event) => { if (event.key === storageKey || event.key === null) useLanguageStore.setState({ language: supported(event.newValue) ? event.newValue : 'fr' }) }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  return children
}

