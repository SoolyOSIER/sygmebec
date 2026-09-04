// ============================================
// src/components/ui/ToastContainer.jsx - Nouveau
// ============================================
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi'

const toastStyles = {
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

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md w-full">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const style = toastStyles[toast.type] || toastStyles.info
          const Icon = style.icon

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`${style.bg} ${style.border} border rounded-2xl shadow-2xl p-4 flex items-start gap-3 relative overflow-hidden`}
            >
              {/* Progress bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4, ease: "linear" }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-primary-700"
              />

              <div className={`mt-0.5 ${style.iconColor}`}>
                <Icon size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${style.text}`}>{toast.title}</p>
                {toast.message && (
                  <p className="text-sm text-secondary-600 mt-0.5">{toast.message}</p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-white/50 text-secondary-400 hover:text-secondary-600 transition-colors flex-shrink-0"
              >
                <FiX size={16} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
