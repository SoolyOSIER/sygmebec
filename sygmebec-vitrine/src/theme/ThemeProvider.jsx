import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext()
const themeKey = 'sygmebec-theme'

const normaliseTheme = (value) => ['light', 'dark', 'system'].includes(value) ? value : 'system'

const resolveTheme = (preference) => {
  if (preference !== 'system') return preference
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [themePreference, setThemePreference] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return normaliseTheme(localStorage.getItem(themeKey))
  })
  const [theme, setResolvedTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return resolveTheme(normaliseTheme(localStorage.getItem(themeKey)))
  })

  useEffect(() => {
    const resolved = resolveTheme(themePreference)
    setResolvedTheme(resolved)
    document.documentElement.classList.toggle('dark', resolved === 'dark')
    document.documentElement.dataset.theme = resolved
    localStorage.setItem(themeKey, themePreference)
  }, [themePreference])

  useEffect(() => {
    if (themePreference !== 'system' || !window.matchMedia) return undefined
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const syncSystemTheme = () => setResolvedTheme(resolveTheme('system'))
    media.addEventListener?.('change', syncSystemTheme)
    return () => media.removeEventListener?.('change', syncSystemTheme)
  }, [themePreference])

  const setTheme = (nextTheme) => {
    setThemePreference(normaliseTheme(nextTheme))
  }

  const value = useMemo(() => ({ theme, themePreference, setTheme }), [theme, themePreference])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
