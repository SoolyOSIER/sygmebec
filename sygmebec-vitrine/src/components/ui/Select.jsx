// ============================================
// src/components/ui/Select.jsx - Version Complète
// ============================================
import { forwardRef } from 'react'
import clsx from 'clsx'
import { FiChevronDown } from 'react-icons/fi'

const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder,
  className,
  icon: Icon,
  helpText,
  multiple = false,
  ...props
}, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className="h-5 w-5 text-secondary-400" />
          </div>
        )}
        <select
          ref={ref}
          multiple={multiple}
          className={clsx(
            'w-full appearance-none rounded-lg border bg-white text-secondary-900',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed',
            Icon ? 'pl-10' : 'pl-4',
            'pr-10 py-2.5',
            multiple ? 'min-h-[80px]' : '',
            error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-gray-300',
            className
          )}
          {...props}
        >
          {placeholder && !multiple && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {!multiple && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FiChevronDown className="h-5 w-5 text-secondary-400" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-danger animate-fade-in-up">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-xs text-secondary-400">{helpText}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'
export default Select
