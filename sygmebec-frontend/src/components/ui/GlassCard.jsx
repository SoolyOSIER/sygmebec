// ============================================
// src/components/ui/GlassCard.jsx - Nouveau
// ============================================
import { motion } from 'framer-motion'

export default function GlassCard({ 
  children, 
  className = '', 
  dark = false,
  delay = 0,
  ...props 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`
        ${dark ? 'glass-card-dark' : 'glass-card'}
        rounded-2xl p-6 border
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}