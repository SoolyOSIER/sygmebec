import { useEffect } from 'react'
import { useUIStore } from '../store/uiStore'
import { languageLocales, supportedLanguages } from './useT'

/** Synchronise la langue de l'application avec le navigateur et l'accessibilité. */
export default function I18nProvider({ children }) {
  const language = useUIStore((state) => state.language)

  useEffect(() => {
    const currentLanguage = supportedLanguages.includes(language) ? language : 'fr'
    document.documentElement.lang = languageLocales[currentLanguage]
    document.documentElement.dataset.language = currentLanguage
  }, [language])

  return children
}
