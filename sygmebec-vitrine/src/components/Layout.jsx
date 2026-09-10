import { t, useTranslation } from '../i18n'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Moon, Sun } from 'lucide-react'

import { memberApi } from '../services/publicApi'
import { useMemberAuthStore } from '../store/memberAuthStore'
import { useTheme } from '../theme/ThemeProvider'
import LanguageSelect from './ui/LanguageSelect'
import { useLanguageStore } from '../i18n'

const navigationLinks = [
  ['/', 'Accueil'],
  ['/a-propos', 'À propos'],
  ['/evenements', 'Événements'],
  ['/galerie', 'Galerie'],
  ['/adhesion', 'Adhésion'],
  ['/contact', 'Contact'],
]

export default function Layout() {
  useTranslation()

  const navigate = useNavigate()
  const { user, clearSession } = useMemberAuthStore()
  const { theme, setTheme } = useTheme()
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)

  const handleLogout = async () => {
    try {
      await memberApi.logout()
    } catch {
    } finally {
      clearSession()
      toast.success('Vous êtes déconnecté. Retour à la vitrine.')
      navigate('/', { replace: true })
    }
  }

  const openManagementApp = () => {
    const adminUrl = (import.meta.env.VITE_ADMIN_URL || 'http://localhost:5173').replace(/\/$/, '')
    window.open(`${adminUrl}/login`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label={t("SYGMEBEC, accueil")}>
          <span className="brand-mark">{t("S")}</span>
          <span>{t("SYGMEBEC")}</span>
        </Link>
        <nav aria-label={t("Navigation principale")}>
          {navigationLinks.map(([path, label]) => (
            <NavLink key={path} to={path} end={path === '/'}>{t(label)}</NavLink>
          ))}
        </nav>
        <div className="member-actions">
          <LanguageSelect value={language} onChange={setLanguage} />
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={t(`Basculer vers le thème ${theme === 'dark' ? 'clair' : 'sombre'}`)}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="button button-secondary app-switcher" type="button" onClick={openManagementApp}>{t("Espace gestion")}</button>
          {user ? (
            <>
              <NavLink className="text-link" to="/espace-membre/profil">{t("Mon espace")}</NavLink>
              <button className="button button-secondary" type="button" onClick={handleLogout}>{t("Déconnexion")}</button>
            </>
          ) : (
            <NavLink className="button button-secondary" to="/espace-membre/connexion">{t("Espace membre")}</NavLink>
          )}
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="site-footer">
        <div><strong>{t("SYGMEBEC")}</strong><span>{t("Église Baptiste Évangélique de la Cité")}</span></div>
        <div className="footer-links">
          <Link to="/mentions-legales">{t("Mentions légales")}</Link>
          <Link to="/confidentialite">{t("Confidentialité")}</Link>
        </div>
      </footer>
    </div>
  )
}
