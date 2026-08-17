// src/layouts/components/MobileMenu.jsx
import { Link, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  User, 
  LogOut, 
  Calendar, 
  Home, 
  Info, 
  Image as ImageIcon, 
  Mail,
  Users,
  Crown
} from 'lucide-react'
import { Button } from '../../components/ui/Button'

const MobileMenu = ({ isOpen, onClose, navLinks, isAuthenticated, user, onLogout }) => {
  const containerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { 
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="lg:hidden bg-white border-t border-gray-100 overflow-hidden shadow-xl"
    >
      <div className="container-custom py-6 space-y-6">
        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <motion.div key={link.to} variants={itemVariants}>
              <NavLink
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-700'
                  }`
                }
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <motion.div
          variants={itemVariants}
          className="border-t border-gray-100 pt-6 space-y-3"
        >
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary-50/50 to-gold-50/50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-400 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md relative">
                  {user?.prenom?.[0]}{user?.nom?.[0]}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div>
                  <p className="font-semibold text-navy-900">{user?.prenom} {user?.nom}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Link
                to="/mon-profil"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-700"
              >
                <User className="w-5 h-5" />
                Mon profil
              </Link>
              <Link
                to="/mes-inscriptions"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-700"
              >
                <Calendar className="w-5 h-5" />
                Mes inscriptions
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-700"
                >
                  <Users className="w-5 h-5" />
                  Administration
                </Link>
              )}
              <button
                onClick={() => {
                  onClose()
                  onLogout()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-gray-700 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <Link to="/connexion" onClick={onClose} className="block">
                <Button variant="outline" className="w-full justify-center">
                  Connexion
                </Button>
              </Link>
              <Link to="/adhesion" onClick={onClose} className="block">
                <Button variant="gold" className="w-full justify-center">
                  Adhésion
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default MobileMenu