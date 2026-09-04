// ============================================
// src/components/ui/LanguageSelect.jsx - Premium
// ============================================
import { useState, useRef, useEffect } from 'react'
import { FiChevronDown, FiCheck } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

const languages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ht', label: 'Kreyòl', flag: '🇭🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

const LanguageSelect = ({ value = 'fr', onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(languages.find(l => l.code === value) || languages[0])
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

  useEffect(() => {
    setSelected(languages.find((language) => language.code === value) || languages[0])
  }, [value])

  const handleSelect = (lang) => {
    setSelected(lang)
    setIsOpen(false)
    onChange?.(lang.code)
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-gray-50 transition-colors"
      >
        <span>{selected.flag}</span>
        <span>{selected.label}</span>
        <FiChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang)}
                className={`
                  flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors
                  ${selected.code === lang.code ? 'bg-primary-50 text-primary-600' : 'text-secondary-700 hover:bg-gray-50'}
                `}
              >
                <span>{lang.flag}</span>
                <span className="flex-1 text-left">{lang.label}</span>
                {selected.code === lang.code && <FiCheck size={16} className="text-primary-600" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LanguageSelect
