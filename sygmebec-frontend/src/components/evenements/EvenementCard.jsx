// ============================================
// src/components/evenements/EvenementCard.jsx - Version Complète
// ============================================
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCalendar, FiMapPin, FiUser, FiClock, FiArrowRight } from 'react-icons/fi'
import { formatDate } from '../../utils/formatDate'
import Badge from '../ui/Badge'

export default function EvenementCard({ evenement, index = 0 }) {
  const isPast = new Date(evenement.date) < new Date()
  const isToday = new Date(evenement.date).toDateString() === new Date().toDateString()

  const getStatusBadge = () => {
    if (isPast) return <Badge variant="default">Passé</Badge>
    if (isToday) return <Badge variant="success">Aujourd'hui</Badge>
    return <Badge variant="info">À venir</Badge>
  }

  const getStatusColor = () => {
    if (isPast) return 'from-gray-400 to-gray-500'
    if (isToday) return 'from-emerald-500 to-teal-400'
    return 'from-primary-500 to-purple-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      className="group"
    >
      <Link
        to={`/evenements/${evenement.id}`}
        className="block bg-white rounded-2xl shadow-card hover:shadow-2xl border border-gray-100/80 p-5 transition-all duration-300 relative overflow-hidden"
      >
        {/* Status bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getStatusColor()} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

        <div className="flex items-start gap-4">
          {/* Date badge */}
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col items-center justify-center text-primary-700">
            <span className="text-lg font-bold">
              {formatDate(evenement.date, 'dd')}
            </span>
            <span className="text-[10px] font-medium uppercase">
              {formatDate(evenement.date, 'MMM')}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors truncate">
                  {evenement.titre}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {getStatusBadge()}
                  <span className="text-xs text-secondary-400 flex items-center gap-1">
                    <FiClock size={12} />
                    {formatDate(evenement.date, 'HH:mm')}
                  </span>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0">
                <FiArrowRight className="text-primary-500" size={20} />
              </div>
            </div>

            <div className="mt-2 space-y-1 text-sm text-secondary-500">
              <div className="flex items-center gap-1.5">
                <FiMapPin size={14} className="text-secondary-400 flex-shrink-0" />
                <span className="truncate">{evenement.lieu}</span>
              </div>
              {evenement.responsable && (
                <div className="flex items-center gap-1.5">
                  <FiUser size={14} className="text-secondary-400 flex-shrink-0" />
                  <span className="truncate">Responsable : {evenement.responsable.nom}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {evenement.description && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-secondary-400 line-clamp-2">
            {evenement.description}
          </div>
        )}
      </Link>
    </motion.div>
  )
}