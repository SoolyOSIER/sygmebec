// ============================================
// src/components/membres/MembreCard.jsx - Version Complète
// ============================================
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiArrowRight } from 'react-icons/fi'
import StatutBadge from './StatutBadge'
import { formatDate } from '../../utils/formatDate'
import Badge from '../ui/Badge'

export default function MembreCard({ membre, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      className="group"
    >
      <Link
        to={`/membres/${membre.id}`}
        className="block bg-white rounded-2xl shadow-card hover:shadow-2xl border border-gray-100/80 p-5 transition-all duration-300 relative overflow-hidden"
      >
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-700 flex items-center justify-center font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                {membre.nom?.charAt(0).toUpperCase() || 'M'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h4 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                {membre.nom} {membre.prenom || ''}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <StatutBadge statut={membre.statut?.libelle} />
                {membre.fonctions?.length > 0 && (
                  <Badge variant="info" className="text-xs">
                    {membre.fonctions.length} fonction{membre.fonctions.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FiArrowRight className="text-primary-500" size={20} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-1.5 text-sm text-secondary-500">
          {membre.telephone && (
            <div className="flex items-center gap-1.5">
              <FiPhone size={13} className="text-secondary-400" />
              <span>{membre.telephone}</span>
            </div>
          )}
          {membre.email && (
            <div className="flex items-center gap-1.5 truncate">
              <FiMail size={13} className="text-secondary-400 flex-shrink-0" />
              <span className="truncate">{membre.email}</span>
            </div>
          )}
          {membre.adresse && (
            <div className="flex items-center gap-1.5 col-span-2 truncate">
              <FiMapPin size={13} className="text-secondary-400 flex-shrink-0" />
              <span className="truncate">{membre.adresse}</span>
            </div>
          )}
        </div>

        {membre.date_adhesion && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-secondary-400">
            <div className="flex items-center gap-1.5">
              <FiCalendar size={12} />
              <span>Membre depuis le {formatDate(membre.date_adhesion)}</span>
            </div>
            <span className="text-primary-500 text-[10px] font-medium uppercase tracking-wider">
              #{membre.id}
            </span>
          </div>
        )}
      </Link>
    </motion.div>
  )
}