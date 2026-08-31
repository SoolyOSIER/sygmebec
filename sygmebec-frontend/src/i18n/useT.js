import translations from './translations'
import { useUIStore } from '../store/uiStore'

export const supportedLanguages = ['fr', 'ht', 'en']
export const languageLocales = { fr: 'fr-HT', ht: 'ht-HT', en: 'en-US' }

const valueAtPath = (source, path) => path.split('.').reduce((value, key) => value?.[key], source)

export const translate = (language, key, variables = {}) => {
  const locale = supportedLanguages.includes(language) ? language : 'fr'
  const pluralKey = variables.count > 1 ? `${key}_plural` : key
  const template = valueAtPath(translations[locale], pluralKey)
    ?? valueAtPath(translations.fr, pluralKey)
    ?? valueAtPath(translations.fr, key)
    ?? key
  return String(template).replace(/{{(\w+)}}/g, (_, name) => variables[name] ?? '')
}

export default function useT() {
  const language = useUIStore((state) => state.language)
  const t = (key, variables) => translate(language, key, variables)
  return { t, language, locale: languageLocales[language] || languageLocales.fr }
}
