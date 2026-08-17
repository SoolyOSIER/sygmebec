// ============================================
// src/components/ui/StatCard.jsx - Version Premium (votre version améliorée)
// ============================================
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

const gradientMap = {
  primary: 'from-indigo-500 to-indigo-400',
  success: 'from-emerald-500 to-teal-400',
  warning: 'from-amber-500 to-orange-400',
  danger: 'from-rose-500 to-red-400',
  info: 'from-blue-500 to-indigo-400',
  purple: 'from-purple-500 to-pink-400',
}

const iconBgMap = {
  primary: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100',
  success: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
  warning: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
  danger: 'bg-rose-50 text-rose-600 group-hover:bg-rose-100',
  info: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
  purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  color = 'primary',
  subtitle,
  loading = false,
  delay = 0,
}) {
  const isPositive = change > 0
  const changeColor = isPositive ? 'text-emerald-600' : 'text-rose-600'
  const ChangeIcon = isPositive ? FiTrendingUp : FiTrendingDown

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="stat-card-premium group"
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-400 uppercase tracking-wider">
              {title}
            </p>
            {loading ? (
              <div className="mt-2 h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-secondary-900 mt-1">
                {typeof value === 'number' ? (
                  <CountUp end={value} duration={2} separator=" " />
                ) : (
                  value
                )}
              </p>
            )}
            {subtitle && (
              <p className="text-xs text-secondary-400 mt-1">{subtitle}</p>
            )}
            {change !== undefined && change !== null && (
              <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${changeColor}`}>
                <ChangeIcon size={14} />
                <span>{Math.abs(change)}%</span>
                <span className="text-secondary-400 font-normal">vs mois dernier</span>
              </div>
            )}
          </div>
          <div className={`icon-wrapper ${iconBgMap[color]}`}>
            <Icon size={24} />
          </div>
        </div>
      </div>
      
      {/* Gradient accent bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientMap[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    </motion.div>
  )
}