// ============================================
// src/components/ui/Avatar.jsx - Premium
// ============================================
import { useState } from 'react'
import { FiUser } from 'react-icons/fi'
import { getMediaUrl } from '../../utils/media'

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
    'bg-primary-100 text-primary-700',
    'bg-primary-200 text-primary-700',
    'bg-primary-50 text-primary-700',
    'bg-primary-100 text-primary-600',
    'bg-primary-200 text-primary-800',
    'bg-primary-50 text-primary-600',
    'bg-primary-100 text-primary-800',
    'bg-primary-200 text-primary-600',
  ]

  const colorIndex = name ? name.length % colors.length : 0

  if (src && !error) {
    return (
      <img
        src={getMediaUrl(src)}
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
