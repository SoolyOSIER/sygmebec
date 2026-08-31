// ============================================
// src/components/ui/Spinner.jsx - Nouveau
// ============================================
import clsx from 'clsx'

export default function Spinner({ 
  size = 'md', 
  color = 'primary',
  className,
}) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  }

  const colors = {
    primary: 'border-primary-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-300 border-t-transparent',
    success: 'border-emerald-500 border-t-transparent',
    danger: 'border-rose-500 border-t-transparent',
  }

  return (
    <div
      className={clsx(
        'rounded-full animate-spin',
        sizes[size],
        colors[color],
        className
      )}
    />
  )
}