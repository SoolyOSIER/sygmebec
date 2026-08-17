// ============================================
// src/components/ui/StatusIndicator.jsx - Nouveau
// ============================================
import { motion } from 'framer-motion'

const statusColors = {
  online: 'bg-emerald-500',
  busy: 'bg-amber-500',
  offline: 'bg-gray-400',
  away: 'bg-blue-500',
}

export default function StatusIndicator({ status = 'online', size = 'md', pulse = true }) {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  return (
    <div className="relative">
      <div className={`${sizes[size]} rounded-full ${statusColors[status]} ${pulse ? 'animate-pulse' : ''}`} />
      {pulse && (
        <motion.div
          className={`absolute inset-0 rounded-full ${statusColors[status]}`}
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: 0.3 }}
        />
      )}
    </div>
  )
}