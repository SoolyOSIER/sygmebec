import { motion } from 'framer-motion'

export default function AnimatedSection({ children, delay = 0, className = '', animation = 'fade-up' }) {
  const animations = {
    'fade-up': { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 } },
    'scale-in': { initial: { opacity: 0, scale: 0.96 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true, amount: 0.2 } },
  }

  return (
    <motion.div
      initial={animations[animation].initial}
      whileInView={animations[animation].whileInView}
      viewport={animations[animation].viewport}
      transition={{ duration: 0.45, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
