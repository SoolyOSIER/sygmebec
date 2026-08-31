// ============================================
// src/components/ui/Tooltip.jsx - Nouveau
// ============================================
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export default function Tooltip({ 
  children, 
  content, 
  position = 'top',
  delay = 300,
  className,
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'bottom-[-6px] left-1/2 -translate-x-1/2 border-t-gray-800',
    bottom: 'top-[-6px] left-1/2 -translate-x-1/2 border-b-gray-800',
    left: 'right-[-6px] top-1/2 -translate-y-1/2 border-l-gray-800',
    right: 'left-[-6px] top-1/2 -translate-y-1/2 border-r-gray-800',
  }

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current)
    setIsVisible(false)
  }

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              'absolute z-50 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-xl',
              positionClasses[position],
              className
            )}
          >
            {content}
            <div className={clsx(
              'absolute w-0 h-0 border-4 border-transparent',
              arrowClasses[position]
            )} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}