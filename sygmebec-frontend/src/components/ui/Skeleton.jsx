// ============================================
// src/components/ui/Skeleton.jsx - Nouveau
// ============================================
import clsx from 'clsx'

export default function Skeleton({ 
  variant = 'text', 
  className, 
  width, 
  height, 
  rounded = 'rounded-lg',
}) {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    avatar: 'h-12 w-12',
    card: 'h-32 w-full',
    badge: 'h-6 w-16',
    button: 'h-10 w-24',
    table: 'h-12 w-full',
  }

  return (
    <div
      className={clsx(
        'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer',
        rounded,
        variants[variant],
        className
      )}
      style={{
        width: width,
        height: height,
        backgroundSize: '200% 100%',
      }}
    />
  )
}