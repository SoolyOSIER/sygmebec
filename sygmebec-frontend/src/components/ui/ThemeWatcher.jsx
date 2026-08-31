import { useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'

export default function ThemeWatcher() {
  const themePreference = useUIStore((state) => state.themePreference)
  const setTheme = useUIStore((state) => state.setTheme)

  useEffect(() => {
    if (themePreference !== 'system' || !window.matchMedia) return undefined
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const applySystemTheme = () => setTheme('system')
    media.addEventListener?.('change', applySystemTheme)
    return () => media.removeEventListener?.('change', applySystemTheme)
  }, [setTheme, themePreference])

  return null
}
