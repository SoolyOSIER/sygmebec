import translations from './translations'
import { useUIStore } from '../store/uiStore'

export default function useT() {
  const language = useUIStore((s) => s.language) || 'fr'
  const t = (key) => {
    return translations[language]?.[key] || translations['fr'][key] || key
  }
  return { t, language }
}
