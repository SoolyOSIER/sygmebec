// ============================================
// src/components/ui/Switch.jsx - Premium
// ============================================
import { motion } from 'framer-motion'

const Switch = ({ checked, onChange, label, disabled = false, className = '' }) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {label && <span className="text-sm text-secondary-600">{label}</span>}
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <motion.div
          className={`w-11 h-6 rounded-full transition-colors duration-300 ${
            checked ? 'bg-indigo-600' : 'bg-gray-300'
          }`}
          animate={{ backgroundColor: checked ? '#4F46E5' : '#D1D5DB' }}
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            className="w-5 h-5 rounded-full bg-white shadow-lg mt-0.5"
            animate={{ x: checked ? 22 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.div>
      </div>
    </label>
  )
}

export default Switch