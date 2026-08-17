// ============================================
// src/components/ui/Breadcrumb.jsx - Nouveau
// ============================================
import { Link } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'
import clsx from 'clsx'

export default function Breadcrumb({ items, className }) {
  return (
    <nav className={clsx('flex items-center gap-1 text-sm', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <div key={item.label} className="flex items-center gap-1">
            {index > 0 && <FiChevronRight className="text-secondary-400" size={14} />}
            {isLast ? (
              <span className="font-medium text-secondary-900">{item.label}</span>
            ) : (
              <Link
                to={item.path}
                className="text-secondary-500 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}