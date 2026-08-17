// ============================================
// src/components/ui/Avatar.jsx - Premium
// ============================================
import { useState } from 'react'
import { FiUser } from 'react-icons/fi'

const Avatar = ({
  name,
  src,
  size = 'md',
  className = '',
  fallback = null,
  ...props
}) => {
  const [error, setError] = useState(false)

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl',
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  const colors = [
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-cyan-100 text-cyan-700',
  ]

  const colorIndex = name ? name.length % colors.length : 0

  if (src && !error) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        onError={() => setError(true)}
        className={`rounded-full object-cover ${sizes[size]} ${className}`}
        {...props}
      />
    )
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold ${sizes[size]} ${colors[colorIndex]} ${className}`}
      {...props}
    >
      {fallback || getInitials(name) || <FiUser size={20} />}
    </div>
  )
}

export default Avatar