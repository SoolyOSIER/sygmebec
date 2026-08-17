// ============================================
// src/components/layout/Sidebar.jsx - Premium
// ============================================
import { NavLink } from 'react-router-dom'
import { 
  FiHome, FiUsers, FiCalendar, FiFileText, FiSettings,
  FiUserCheck, FiChevronLeft, FiChevronRight, FiBarChart2,
  FiBell, FiHelpCircle, FiLogOut, FiImage, FiSend
} from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { useLogout } from '../../hooks/useAuth'
import { getRoleLabel } from '../../utils/roleHierarchy'
import Avatar from '../ui/Avatar'
import '../../pages/dashboardChrome.css'

const menuItems = [
  { path: '/', label: 'Tableau de bord', icon: FiHome, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/membres', label: 'Membres', icon: FiUsers, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/inscriptions-en-ligne', label: 'Inscriptions en ligne', icon: FiUserCheck, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/evenements', label: 'Événements', icon: FiCalendar, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/galerie', label: 'Images vitrine', icon: FiImage, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/rapports', label: 'Rapports', icon: FiFileText, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/lettres', label: 'Lettres', icon: FiSend, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/comptes', label: 'Comptes', icon: FiUserCheck, roles: ['ADMINISTRATEUR'] },
  { path: '/statistiques', label: 'Statistiques', icon: FiBarChart2, roles: ['ADMINISTRATEUR'] },
]

const bottomItems = [
  { path: '/settings', label: 'Paramètres', icon: FiSettings, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { user, role } = useAuthStore()
  const { mutate: logout } = useLogout()

  const visibleItems = menuItems.filter(item => item.roles.includes(role))
  const visibleBottom = bottomItems.filter(item => item.roles.includes(role))

  return (
    <motion.aside 
      initial={false}
      animate={{ width: sidebarOpen ? 288 : 80 }}
      className="sidebar-premium overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className={`flex items-center h-20 px-4 border-b border-white/10 flex-shrink-0 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="dashboard-seal">EB</span>
          {sidebarOpen && (
            <div className="min-w-0">
              <span className="block text-base font-extrabold tracking-wide text-white">SYGMEBEC</span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-indigo-200">E.B.E.C.</span>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className={`${sidebarOpen ? '' : 'absolute -right-3 top-7'} z-10 p-2 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300 flex-shrink-0`}
          aria-label={sidebarOpen ? 'Réduire le menu' : 'Ouvrir le menu'}
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
              title={!sidebarOpen ? item.label : ''}
            >
              <div className="icon-wrapper flex-shrink-0">
                <Icon size={18} />
              </div>
              <motion.span
                animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
                transition={{ duration: 0.3 }}
                className="truncate"
              >
                {item.label}
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
              title={!sidebarOpen ? item.label : ''}
            >
              <div className="icon-wrapper flex-shrink-0">
                <Icon size={18} />
              </div>
              <motion.span
                animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
                transition={{ duration: 0.3 }}
              >
                {item.label}
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
            Déconnexion
          </motion.span>
        </button>
      </div>
    </motion.aside>
  )
}
