// ============================================
// src/components/ui/Logo.jsx - Nouveau
// ============================================
import { motion } from 'framer-motion'

export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
  }

  return (
    <motion.div
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className={`${sizes[size]} rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/25`}
    >
      <span className="transform">S</span>
    </motion.div>
  )
}