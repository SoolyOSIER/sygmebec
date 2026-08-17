// src/components/common/Loader.jsx
import { motion } from 'framer-motion'

const Loader = ({ size = 'md', variant = 'primary', fullScreen = false, text = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  }

  const colors = {
    primary: 'border-primary-200 border-t-primary-700',
    gold: 'border-gold-200 border-t-gold-500',
    white: 'border-white/20 border-t-white',
  }

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 rounded-full ${colors[variant]} animate-spin`} />
        <div className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-transparent rounded-full animate-pulse`} />
      </div>
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

export default Loader