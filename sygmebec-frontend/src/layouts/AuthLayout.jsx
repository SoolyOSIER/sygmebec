import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import { useUIStore } from '../store/uiStore.js'
import LanguageSelect from '../components/ui/LanguageSelect.jsx'

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore()
  const language = useUIStore((state) => state.language)
  const setLanguage = useUIStore((state) => state.setLanguage)
  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="app-blue-shell min-h-screen flex items-center justify-center p-4 relative transition-colors duration-300">
      <LanguageSelect value={language} onChange={setLanguage} className="absolute right-4 top-4 z-10" />
      <Outlet />
    </div>
  )
}
