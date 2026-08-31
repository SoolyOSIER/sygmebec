// ============================================
// src/components/ui/Logo.jsx - Nouveau
// ============================================
import { motion } from 'framer-motion'
import logo from '../../../../Logo.png'

export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`${sizes[size]} flex items-center justify-center overflow-hidden rounded-xl bg-white/10 shadow-lg shadow-black/20`}
    >
      <img src={logo} alt="Logo SYGMEBEC" className="h-full w-full object-contain p-0.5" />
    </motion.div>
  )
}
