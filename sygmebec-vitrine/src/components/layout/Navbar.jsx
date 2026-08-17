// ============================================
// src/components/layout/Navbar.jsx - Version Ultra Premium
// ============================================
import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiBell, FiMenu, FiSearch, FiUser, FiChevronDown,
  FiSettings, FiHelpCircle, FiLogOut, FiMoon, FiSun,
  FiUsers, FiCalendar, FiFileText, FiHome, FiPlus,
  FiGift, FiAward, FiZap, FiGrid, FiLayers
} from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { useLogout } from '../../hooks/useAuth'
import { useMembres } from '../../hooks/useMembres'
import { useEvenements } from '../../hooks/useEvenements'
import { getRoleLabel } from '../../utils/roleHierarchy'
import { useUIStore } from '../../store/uiStore'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import Dropdown, { DropdownItem } from '../ui/Dropdown'
import logo from '../../../../Logo.png'

const quickActions = [
  { label: 'Nouveau membre', icon: FiUsers, path: '/membres/nouveau', color: 'indigo' },
  { label: 'Nouvel événement', icon: FiCalendar, path: '/evenements/nouveau', color: 'purple' },
  { label: 'Générer rapport', icon: FiFileText, path: '/rapports/generer', color: 'emerald' },
  { label: 'Nouvelle tâche', icon: FiPlus, path: '/taches/nouveau', color: 'amber' },
]

export default function Navbar() {
  const { user, role } = useAuthStore()
  const { mutate: logout } = useLogout()
  const { toggleSidebar, toggleTheme, theme } = useUIStore()
  const { data: membresData } = useMembres()
  const { data: evenementsData } = useEvenements()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector('input[type="text"]')?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const notifications = useMemo(() => {
    const membres = membresData?.results || membresData || []
    const evenements = evenementsData?.results || evenementsData || []
    return [
      { id: 1, title: 'Nouveaux membres', text: `${membres.length} membres enregistrés`, icon: FiUsers, color: 'indigo', time: '2 min' },
      { id: 2, title: 'Événements à venir', text: `${evenements.length} événements programmés`, icon: FiCalendar, color: 'purple', time: '5 min' },
      { id: 3, title: 'Rapport disponible', text: 'Le rapport mensuel est prêt', icon: FiFileText, color: 'emerald', time: '1 heure' },
      { id: 4, title: 'Mise à jour système', text: 'Nouvelle version disponible', icon: FiZap, color: 'amber', time: '3 heures' },
    ]
  }, [membresData, evenementsData])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/membres?search=${searchQuery}`)
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  return (
    <motion.header 
      className={`sticky top-0 z-40 flex h-20 items-center px-4 lg:px-6 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/30' 
          : 'bg-white/80 backdrop-blur-md border-b border-gray-200/50'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-4 w-full">
        {/* Toggle Sidebar */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-300 text-secondary-500 hover:text-secondary-700"
        >
          <FiMenu size={22} />
        </motion.button>

        {/* Logo */}
        <Link to="/" className="hidden sm:flex items-center gap-3 ml-2 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <img src={logo} alt="Logo" className="h-9 w-9 object-contain rounded" />
            <div className="absolute -inset-1 rounded-full bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            SYGMEBEC
          </span>
        </Link>

        {/* Quick Actions */}
        <div className="hidden xl:flex items-center gap-1">
          {quickActions.map((action) => (
            <motion.div key={action.label} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                to={action.path}
                className={`px-3 py-1.5 text-sm text-${action.color}-600 hover:bg-${action.color}-50 rounded-lg transition-all duration-200 flex items-center gap-1.5`}
              >
                <action.icon size={16} />
                {action.label}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex-1" />

        {/* Search - Desktop */}
        <motion.div 
          className="hidden md:flex items-center flex-1 max-w-sm relative"
          whileHover={{ scale: 1.01 }}
        >
          <FiSearch className="absolute left-3 text-secondary-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher un membre, événement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
            className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-gray-50/80 border border-gray-200/50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all duration-300 text-secondary-700 placeholder:text-secondary-400"
          />
          <kbd className="absolute right-3 px-2.5 py-1 text-xs text-secondary-400 bg-white rounded-lg border border-gray-200 font-semibold">
            ⌘K
          </kbd>
        </motion.div>

        <div className="flex items-center gap-1.5">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleTheme()}
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-300 text-secondary-500 hover:text-secondary-700"
          >
            {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
          </motion.button>

          {/* Notifications */}
          <Dropdown
            trigger={
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-300 text-secondary-500 hover:text-secondary-700"
              >
                <FiBell size={20} />
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 text-[10px] font-semibold text-white shadow-lg shadow-rose-500/25"
                >
                  {notifications.length}
                </motion.span>
              </motion.button>
            }
            align="right"
            className="w-80"
          >
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-secondary-900">Notifications</p>
                <p className="text-xs text-secondary-400">Vous avez {notifications.length} notifications</p>
              </div>
              <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700">Tout marquer lu</button>
            </div>
            {notifications.map((item, idx) => {
              const Icon = item.icon
              const colorMap = {
                indigo: 'bg-indigo-50 text-indigo-600',
                purple: 'bg-purple-50 text-purple-600',
                emerald: 'bg-emerald-50 text-emerald-600',
                amber: 'bg-amber-50 text-amber-600',
              }
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${colorMap[item.color]}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900">{item.title}</p>
                      <p className="text-xs text-secondary-500 mt-0.5">{item.text}</p>
                      <p className="text-[10px] text-secondary-400 mt-1">{item.time}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
            <div className="px-3 py-2">
              <button 
                onClick={() => navigate('/statistiques')} 
                className="w-full rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:from-indigo-100 hover:to-purple-100 transition-all"
              >
                Ouvrir le tableau de bord
              </button>
            </div>
          </Dropdown>

          {/* Profile Dropdown */}
          <Dropdown
            trigger={
              <motion.button 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-all duration-300 group"
              >
                <Avatar
                  name={user?.membre?.nom || user?.identifiant}
                  size="md"
                  status="online"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-secondary-900">
                    {user?.membre?.nom || user?.identifiant}
                  </p>
                  <p className="text-xs text-secondary-400">
                    {getRoleLabel(role)}
                  </p>
                </div>
                <FiChevronDown className="text-secondary-400 group-hover:text-secondary-600 transition-colors" size={16} />
              </motion.button>
            }
            align="right"
            className="w-64"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar name={user?.membre?.nom || user?.identifiant} size="lg" />
                <div>
                  <p className="text-sm font-semibold text-secondary-900">
                    {user?.membre?.nom} {user?.membre?.prenom || ''}
                  </p>
                  <p className="text-xs text-secondary-400">{user?.identifiant}</p>
                  <Badge variant="primary" size="sm">{getRoleLabel(role)}</Badge>
                </div>
              </div>
            </div>
            <DropdownItem onClick={() => navigate('/profile')} icon={FiUser}>
              <span>Mon profil</span>
              <span className="ml-auto text-xs text-secondary-400">⌘P</span>
            </DropdownItem>
            <DropdownItem onClick={() => navigate('/settings')} icon={FiSettings}>
              <span>Paramètres</span>
              <span className="ml-auto text-xs text-secondary-400">⌘,</span>
            </DropdownItem>
            <DropdownItem onClick={() => navigate('/')} icon={FiHome}>
              Tableau de bord
            </DropdownItem>
            <div className="border-t border-gray-100 mt-1 pt-1">
              <DropdownItem onClick={() => logout()} icon={FiLogOut} danger>
                Déconnexion
              </DropdownItem>
            </div>
          </Dropdown>
        </div>
      </div>
    </motion.header>
  )
}
