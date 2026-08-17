// ============================================
// src/components/ui/Badge.jsx - Version Ultra Premium
// ============================================
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

const Badge = ({
  children,
  variant = 'default',
  className = '',
  size = 'sm',
  dot = false,
  animated = false,
  icon: Icon,
  glow = false,
  ...props
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-indigo-100 text-indigo-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    info: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    outline: 'border border-gray-200 text-gray-600 bg-transparent',
    'outline-primary': 'border border-indigo-300 text-indigo-600 bg-transparent',
    'outline-success': 'border border-emerald-300 text-emerald-600 bg-transparent',
    gradient: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
    'gradient-success': 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white',
    'gradient-warning': 'bg-gradient-to-r from-amber-500 to-orange-400 text-white',
    'gradient-danger': 'bg-gradient-to-r from-rose-500 to-red-400 text-white',
  }

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  const glowColors = {
    primary: 'shadow-indigo-500/30',
    success: 'shadow-emerald-500/30',
    warning: 'shadow-amber-500/30',
    danger: 'shadow-rose-500/30',
    purple: 'shadow-purple-500/30',
  }

  const Wrapper = animated ? motion.span : 'span'

  return (
    <Wrapper
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-300',
        variants[variant] || variants.default,
        sizes[size],
        glow && `shadow-lg ${glowColors[variant] || 'shadow-indigo-500/20'}`,
        className
      )}
      {...(animated ? { 
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.3, type: 'spring', stiffness: 500 }
      } : {})}
      {...props}
    >
      {dot && (
        <span className={clsx(
          'h-1.5 w-1.5 rounded-full',
          variant === 'gradient' || variant.includes('gradient') ? 'bg-white' : 'bg-current'
        )} />
      )}
      {Icon && <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />}
      {children}
    </Wrapper>
  )
}

export { Badge }
export default Badge
