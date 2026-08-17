// src/components/common/Bouton.jsx
import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        primary: 'bg-primary-700 text-white hover:bg-primary-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        gold: 'bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 text-white hover:from-gold-500 hover:via-gold-600 hover:to-gold-700 shadow-lg shadow-gold-200 hover:shadow-xl hover:-translate-y-0.5',
        outline: 'border-2 border-primary-700 bg-transparent text-primary-700 hover:bg-primary-700 hover:text-white',
        outlineGold: 'border-2 border-gold-500 bg-transparent text-gold-600 hover:bg-gold-500 hover:text-white',
        ghost: 'hover:bg-gray-100',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        success: 'bg-green-600 text-white hover:bg-green-700',
      },
      size: {
        default: 'h-12 px-8 py-3',
        sm: 'h-10 px-6 py-2.5 text-sm',
        lg: 'h-14 px-10 py-4 text-lg',
        xl: 'h-16 px-12 py-5 text-xl',
        icon: 'h-12 w-12',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      fullWidth: false,
    },
  }
)

const Bouton = React.forwardRef(({ className, variant, size, fullWidth, asChild = false, children, ...props }, ref) => {
  const Comp = asChild ? 'span' : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      ref={ref}
      {...props}
    >
      {children}
    </Comp>
  )
})
Bouton.displayName = 'Bouton'

export { Bouton, buttonVariants }