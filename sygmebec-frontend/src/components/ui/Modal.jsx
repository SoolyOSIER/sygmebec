import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn.js'

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  className,
  hideHeader = false,
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={cn(
          'w-full max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl border border-white/60 dark:bg-slate-900 dark:border-slate-700',
          sizes[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {!hideHeader && <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-primary-600 dark:text-slate-100">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>}
        <div className={hideHeader ? 'max-h-[90vh] overflow-y-auto px-5 py-5' : 'max-h-[calc(90vh-73px)] overflow-y-auto px-5 py-5'}>{children}</div>
      </div>
    </div>
  )
}
