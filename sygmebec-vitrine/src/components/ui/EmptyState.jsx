// ============================================
// src/components/ui/EmptyState.jsx - Nouveau
// ============================================
import { motion } from 'framer-motion'
import Button from './Button'

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  onAction,
  actionIcon: ActionIcon,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="w-20 h-20 rounded-2xl bg-gray-100/80 mx-auto flex items-center justify-center mb-4">
        {Icon && <Icon className="text-gray-400" size={32} />}
      </div>
      <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
      <p className="text-secondary-400 mt-1 max-w-sm mx-auto">{description}</p>
      {actionText && onAction && (
        <Button 
          className="mt-4" 
          onClick={onAction}
          icon={ActionIcon}
        >
          {actionText}
        </Button>
      )}
    </motion.div>
  )
}