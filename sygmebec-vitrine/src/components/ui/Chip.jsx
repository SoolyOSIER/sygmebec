// ============================================
// src/components/ui/Chip.jsx - Nouveau
// ============================================
import clsx from 'clsx'
import { FiX } from 'react-icons/fi'

const chipStyles = {
  default: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  primary: 'bg-primary-100 text-primary-700 hover:bg-primary-200',
  success: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  warning: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  danger: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
  info: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
}

export default function Chip({
  children,
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  className,
  icon: Icon,
}) {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200',
      chipStyles[variant],
      sizes[size],
      removable && 'pr-1',
      className
    )}>
      {Icon && <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="p-0.5 rounded-full hover:bg-black/10 transition-colors"
        >
          <FiX size={size === 'sm' ? 12 : 14} />
        </button>
      )}
    </span>
  )
}