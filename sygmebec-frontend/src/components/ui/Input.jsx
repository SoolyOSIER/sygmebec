// ============================================
// src/components/ui/Input.jsx - Premium
// ============================================
import { forwardRef, useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

const Input = forwardRef(({
  label,
  icon: Icon,
  type = 'text',
  error,
  helper,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-secondary-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          className={`
            w-full rounded-xl border bg-white px-4 py-2.5 text-secondary-900 
            placeholder:text-secondary-400 outline-none transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
      {helper && !error && <p className="text-xs text-secondary-400">{helper}</p>}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
