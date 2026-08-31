// src/layouts/components/Header.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Calendar, 
  Home, 
  Info, 
  Image as ImageIcon, 
  Mail, 
  ChevronDown,
  Crown,
  Users,
  Settings
} from 'lucide-react'
import { logout } from '../../store/slices/authMembreSlice'
import { Button } from '../../components/ui/Button'
import MobileMenu from './MobileMenu'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { isAuthenticated, user } = useSelector((state) => state.authMembre)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50)
  })

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: 'Accueil', icon: Home },
    { to: '/apropos', label: 'À propos', icon: Info },
    { to: '/evenements', label: 'Événements', icon: Calendar },
    { to: '/galerie', label: 'Galerie', icon: ImageIcon },
    { to: '/contact', label: 'Contact', icon: Mail },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              className="relative w-12 h-12 bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg group-hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.05, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Users className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold-400 rounded-full border-2 border-white animate-pulse" />
              <motion.div
                className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary-500/20 to-gold-500/20 -z-10"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <div className="hidden sm:block">
              <span className="text-2xl font-playfair font-bold text-navy-900 group-hover:text-primary-700 transition-colors">
                GESTMEMBRES
              </span>
              <span className="block text-[10px] text-gray-500 font-medium tracking-[0.3em] uppercase">
                Gestion de Membres
              </span>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-primary-700 bg-primary-50/80'
                      : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center gap-2">
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </span>
                    {isActive && (
                      <motion.span
                        layoutId="navUnderline"
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary-50/80 transition-all duration-300 group"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-400 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md relative">
                    {user?.prenom?.[0]}{user?.nom?.[0]}
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700 transition-colors">
                    {user?.prenom} {user?.nom}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-premium border border-gray-100 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50/50 to-gold-50/50">
                        <p className="font-semibold text-navy-900">{user?.prenom} {user?.nom}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="badge-premium">
                            <Crown className="w-3 h-3" />
                            {user?.role || 'Membre'}
                          </span>
                        </div>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/mon-profil"
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-700"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Mon profil
                        </Link>
                        <Link
                          to="/mes-inscriptions"
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-700"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Calendar className="w-4 h-4" />
                          Mes inscriptions
                        </Link>
                        {user?.role === 'ADMIN' && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-700"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Administration
                          </Link>
                        )}
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false)
                            handleLogout()
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-gray-700 hover:text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/connexion">
                  <Button variant="outline" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link to="/adhesion">
                  <Button variant="gold" size="sm">
                    Adhésion
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-primary-50 transition-colors relative z-50"
            whileTap={{ scale: 0.9 }}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-navy-900" />
            ) : (
              <Menu className="w-6 h-6 text-navy-900" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            navLinks={navLinks}
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header