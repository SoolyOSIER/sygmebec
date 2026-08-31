// src/components/common/Toast.jsx
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const Toast = ({ 
  message, 
  type = 'info', 
  isOpen, 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  const variants = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      iconColor: 'text-green-500',
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      iconColor: 'text-red-500',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      iconColor: 'text-yellow-500',
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      iconColor: 'text-blue-500',
    },
  }

  const Icon = variants[type]?.icon || Info

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed top-6 right-6 z-50 max-w-md w-full rounded-2xl border shadow-lg p-4 ${variants[type]?.bg}`}
        >
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 mt-0.5 ${variants[type]?.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className={`flex-1 ${variants[type]?.text}`}>
              <p className="text-sm font-medium">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast