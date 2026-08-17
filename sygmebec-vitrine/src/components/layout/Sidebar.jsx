// ============================================
// src/components/layout/Sidebar.jsx - Premium
// ============================================
import { NavLink } from 'react-router-dom'
import { 
  FiHome, FiUsers, FiCalendar, FiFileText, FiSettings,
  FiUserCheck, FiInbox, FiChevronLeft, FiChevronRight, FiBarChart2,
  FiBell, FiHelpCircle, FiLogOut
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { useLogout } from '../../hooks/useAuth'
import { getRoleLabel } from '../../utils/roleHierarchy'
import Logo from '../ui/Logo'

const menuItems = [
  { path: '/', label: 'Dashboard', icon: FiHome, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/membres', label: 'Membres', icon: FiUsers, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/evenements', label: 'Événements', icon: FiCalendar, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/rapports', label: 'Rapports', icon: FiFileText, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
  { path: '/demandes-adhesion', label: 'Adhésions', icon: FiInbox, roles: ['SECRETAIRE', 'PASTEUR', 'ADMINISTRATEUR'] },
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
      <div className="flex items-center justify-between h-20 px-4 border-b border-white/5 flex-shrink-0">
        <motion.div 
          className="flex items-center gap-3 overflow-hidden"
          animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Logo />
          <span className="text-lg font-bold text-white">SYGMEBEC</span>
        </motion.div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-all duration-300 flex-shrink-0"
        >
          {sidebarOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
        </button>
      </div>

      {/* User Profile */}
      <div className="px-4 py-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.membre?.nom ? user.membre.nom.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-secondary-800" />
          </div>
          <motion.div 
            className="overflow-hidden"
            animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm font-medium text-white truncate">
              {user?.membre?.nom || user?.identifiant}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {getRoleLabel(role)}
            </p>
          </motion.div>
        </div>
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
