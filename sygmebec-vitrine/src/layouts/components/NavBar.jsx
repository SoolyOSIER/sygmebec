// src/layouts/components/NavBar.jsx
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const NavBar = ({ links = [], className = '' }) => {
  return (
    <nav className={`flex items-center gap-1 ${className}`}>
      {links.map((link) => (
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
                {link.icon && <link.icon className="w-4 h-4" />}
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
  )
}

export default NavBar