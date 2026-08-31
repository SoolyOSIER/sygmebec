// ============================================
// src/components/ui/AnimatedCard.jsx - Premium
// ============================================
import { motion } from 'framer-motion'

const AnimatedCard = ({
  children,
  className = '',
  delay = 0,
  animate = true,
  hover = true,
  gradient = false,
  variant = 'default',
  ...props
}) => {
  const variants = {
    default: 'bg-white border border-gray-100/80',
    glass: 'bg-white/80 backdrop-blur-xl border border-white/30',
    dark: 'bg-secondary-900/90 backdrop-blur-xl border border-white/10',
    gradient: 'bg-gradient-to-br from-indigo-50 to-white border border-indigo-100/50',
  }

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`rounded-2xl shadow-card transition-all duration-300 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedCard