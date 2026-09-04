// ============================================
// src/components/layout/Sidebar.jsx - Premium
// ============================================
import { NavLink } from 'react-router-dom'
import { 
  FiHome, FiUsers, FiCalendar, FiFileText, FiSettings,
  FiUserCheck, FiChevronLeft, FiChevronRight, FiBarChart2,
  FiBell, FiHelpCircle, FiLogOut, FiImage, FiSend, FiTrash2
} from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { useLogout } from '../../hooks/useAuth'
import { getRoleLabel } from '../../utils/roleHierarchy'
import Avatar from '../ui/Avatar'
import logo from '../../../../Logo.png'
import '../../pages/dashboardChrome.css'
import useT from '../../i18n/useT'

const menuItems = [
  { path: '/', labelKey: 'navigation.dashboard', icon: FiHome, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/membres', labelKey: 'navigation.members', icon: FiUsers, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/inscriptions-en-ligne', labelKey: 'navigation.onlineRegistrations', icon: FiUserCheck, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/evenements', labelKey: 'navigation.events', icon: FiCalendar, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/galerie', labelKey: 'navigation.gallery', icon: FiImage, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/rapports', labelKey: 'navigation.reports', icon: FiFileText, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/lettres', labelKey: 'navigation.letters', icon: FiSend, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/comptes', labelKey: 'navigation.accounts', icon: FiUserCheck, roles: ['ADMINISTRATEUR'] },
  { path: '/statistiques', labelKey: 'navigation.statistics', icon: FiBarChart2, roles: ['ADMINISTRATEUR'] },
  { path: '/corbeille', labelKey: 'navigation.trash', icon: FiTrash2, roles: ['ADMINISTRATEUR'] },
]

const bottomItems = [
  { path: '/settings', labelKey: 'navigation.settings', icon: FiSettings, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { user, role } = useAuthStore()
  const { mutate: logout } = useLogout()
  const { t } = useT()

  const visibleItems = menuItems.filter(item => item.roles.includes(role))
  const visibleBottom = bottomItems.filter(item => item.roles.includes(role))

  return (
    <motion.aside 
      initial={false}
      animate={{ width: sidebarOpen ? 288 : 80 }}
      style={{ height: '100vh', minHeight: '100vh' }}
      className="sidebar-premium overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className={`flex items-center h-20 px-4 border-b border-white/10 flex-shrink-0 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <img src={logo} alt="Logo de l’Église Baptiste de l’Espoir" className="h-12 w-12 flex-none rounded-xl bg-primary-50 p-1 object-contain ring-2 ring-primary-300/30" />
          {sidebarOpen && (
            <div className="min-w-0">
              <span className="block text-base font-extrabold tracking-wide text-white">SYGMEBEC</span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-primary-200">E.B.E.C.</span>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className={`${sidebarOpen ? '' : 'absolute -right-3 top-7'} z-10 p-2 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 flex-shrink-0`}
          aria-label={sidebarOpen ? t('navigation.collapseMenu') : t('navigation.openMenu')}
        >
          {sidebarOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                sidebar-link group ${isActive ? 'active' : ''}
                ${!sidebarOpen ? 'justify-center px-3' : ''}
              `}
              title={!sidebarOpen ? t(item.labelKey) : ''}
            >
              <div className="icon-wrapper flex-shrink-0">
                <Icon size={18} />
              </div>
              <motion.span
                animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
                transition={{ duration: 0.3 }}
                className="truncate"
              >
                {t(item.labelKey)}
              </motion.span>
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/5 flex-shrink-0 space-y-1">
        {visibleBottom.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                sidebar-link group ${isActive ? 'active' : ''}
                ${!sidebarOpen ? 'justify-center px-3' : ''}
              `}
              title={!sidebarOpen ? t(item.labelKey) : ''}
            >
              <div className="icon-wrapper flex-shrink-0">
                <Icon size={18} />
              </div>
              <motion.span
                animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
                transition={{ duration: 0.3 }}
              >
                {t(item.labelKey)}
              </motion.span>
            </NavLink>
          )
        })}
        <button
          onClick={() => logout()}
          className={`
            sidebar-link group w-full text-red-400 hover:text-red-300 hover:bg-red-500/10
            ${!sidebarOpen ? 'justify-center px-3' : ''}
          `}
        >
          <div className="icon-wrapper flex-shrink-0 bg-red-500/10 text-red-400">
            <FiLogOut size={18} />
          </div>
          <motion.span
            animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
            transition={{ duration: 0.3 }}
          >
            {t('navigation.logout')}
          </motion.span>
        </button>
      </div>
    </motion.aside>
  )
}
