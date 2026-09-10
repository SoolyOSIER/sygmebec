import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext()
const themeKey = 'sygmebec-theme'

const normaliseTheme = (value) => ['light', 'dark', 'system'].includes(value) ? value : 'system'

const readTheme = () => { try { return normaliseTheme(localStorage.getItem(themeKey)) } catch { return 'system' } }

const resolveTheme = (preference) => {
  if (preference !== 'system') return preference
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [themePreference, setThemePreference] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return readTheme()
  })
  const [theme, setResolvedTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return resolveTheme(readTheme())
  })

  useEffect(() => {
    const resolved = resolveTheme(themePreference)
    setResolvedTheme(resolved)
    try { localStorage.setItem(themeKey, themePreference) } catch { /* Keep theme usable when storage is blocked. */ }
  }, [themePreference])

  useEffect(() => {
    if (themePreference !== 'system' || !window.matchMedia) return undefined
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const syncSystemTheme = () => setResolvedTheme(resolveTheme('system'))
    media.addEventListener?.('change', syncSystemTheme)
    return () => media.removeEventListener?.('change', syncSystemTheme)
  }, [themePreference])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.dataset.theme = theme
  }, [theme])

  const setTheme = (nextTheme) => {
    setThemePreference(normaliseTheme(nextTheme))
  }

  const value = useMemo(() => ({ theme, themePreference, setTheme }), [theme, themePreference])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
