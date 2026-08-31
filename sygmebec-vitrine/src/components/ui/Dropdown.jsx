// ============================================
// src/components/ui/Dropdown.jsx - Nouveau
// ============================================
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export default function Dropdown({ 
  trigger, 
  children, 
  align = 'right',
  className,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => !disabled && setIsOpen(!isOpen)}>
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              'absolute mt-2 min-w-[200px] bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-50',
              alignClasses[align],
              className
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function DropdownItem({ children, onClick, icon: Icon, className, danger = false }) {
  return (
    <button
      onClick={() => {
        if (onClick) onClick()
      }}
      className={clsx(
        'flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors',
        danger ? 'text-rose-600 hover:bg-rose-50' : 'text-secondary-700 hover:text-secondary-900',
        className
      )}
    >
      {Icon && <Icon size={16} className={danger ? 'text-rose-400' : 'text-secondary-400'} />}
      {children}
    </button>
  )
}