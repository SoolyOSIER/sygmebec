// ============================================
// src/components/ui/ProgressBar.jsx - Nouveau
// ============================================
import { motion } from 'framer-motion'

const colorMap = {
  primary: 'bg-primary-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-blue-500',
}

export default function ProgressBar({ 
  value, 
  max = 100, 
  color = 'primary',
  showLabel = false,
  label,
  size = 'md',
  animated = true,
}) {
  const percentage = Math.min((value / max) * 100, 100)
  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  return (
    <div className="w-full">
      {showLabel && label && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-secondary-600">{label}</span>
          <span className="font-medium text-secondary-900">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 1 : 0, ease: "easeOut" }}
          className={`${sizes[size]} ${colorMap[color]} rounded-full transition-all duration-300`}
        />
      </div>
    </div>
  )
}