// ============================================
// src/components/ui/Alert.jsx - Nouveau
// ============================================
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi'
import clsx from 'clsx'

const alertStyles = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: FiCheckCircle,
    iconColor: 'text-emerald-500',
    text: 'text-emerald-800',
  },
  error: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: FiAlertCircle,
    iconColor: 'text-rose-500',
    text: 'text-rose-800',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: FiAlertTriangle,
    iconColor: 'text-amber-500',
    text: 'text-amber-800',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: FiInfo,
    iconColor: 'text-blue-500',
    text: 'text-blue-800',
  },
}

export default function Alert({ 
  type = 'info', 
  title, 
  message, 
  dismissible = false,
  onDismiss,
  className,
}) {
  const [isVisible, setIsVisible] = useState(true)
  const style = alertStyles[type]
  const Icon = style.icon

  const handleDismiss = () => {
    setIsVisible(false)
    if (onDismiss) onDismiss()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={clsx(
            'rounded-xl border p-4 flex items-start gap-3',
            style.bg,
            style.border,
            className
          )}
        >
          <div className={style.iconColor}>
            <Icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            {title && <p className={`text-sm font-medium ${style.text}`}>{title}</p>}
            {message && <p className="text-sm text-secondary-600 mt-0.5">{message}</p>}
          </div>
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg hover:bg-white/50 text-secondary-400 hover:text-secondary-600 transition-colors flex-shrink-0"
            >
              <FiX size={16} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}