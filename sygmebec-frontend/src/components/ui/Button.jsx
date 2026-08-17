// ============================================
// src/components/ui/Button.jsx - Premium
// ============================================
import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}, ref) => {
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-indigo-200/50',
    secondary: 'bg-secondary-100 hover:bg-secondary-200 text-secondary-700',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-emerald-200/50',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-rose-200/50',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-amber-200/50',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
    ghost: 'hover:bg-gray-100 text-secondary-600',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  }

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-medium
        transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon && iconPosition === 'left' ? (
        <Icon size={18} />
      ) : null}
      {children}
      {Icon && iconPosition === 'right' && !isLoading && <Icon size={18} />}
    </motion.button>
  )
})

Button.displayName = 'Button'

export default Button