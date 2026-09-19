import { Outlet, Navigate } from 'react-router-dom'
import { FiMoon, FiSun } from 'react-icons/fi'
import { useAuthStore } from '../store/authStore.js'
import { useUIStore } from '../store/uiStore.js'
import LanguageSelect from '../components/ui/LanguageSelect.jsx'
import useT from '../i18n/useT.js'

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore()
  const language = useUIStore((state) => state.language)
  const setLanguage = useUIStore((state) => state.setLanguage)
  const theme = useUIStore((state) => state.theme)
  const toggleTheme = useUIStore((state) => state.toggleTheme)
  const { t } = useT()
  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="app-blue-shell min-h-screen flex items-center justify-center p-4 relative transition-colors duration-300">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="app-light-control grid h-10 w-10 place-items-center rounded-xl border border-gray-200 bg-white text-secondary-700 shadow-sm transition hover:bg-gray-50"
          aria-label={theme === 'dark' ? t('common.light') : t('common.dark')}
          title={theme === 'dark' ? t('common.light') : t('common.dark')}
        >
          {theme === 'dark' ? <FiSun size={19} /> : <FiMoon size={19} />}
        </button>
        <LanguageSelect value={language} onChange={setLanguage} />
      </div>
      <Outlet />
    </div>
  )
}
