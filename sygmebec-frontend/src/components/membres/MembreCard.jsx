// ============================================
// src/components/membres/MembreCard.jsx - Version Complète
// ============================================
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiArrowRight } from 'react-icons/fi'
import StatutBadge from './StatutBadge'
import { formatDate } from '../../utils/formatDate'
import Badge from '../ui/Badge'
import Avatar from '../ui/Avatar'

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
        className="block bg-white rounded-3xl shadow-card hover:shadow-2xl border border-gray-100/80 transition-all duration-300 relative overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700" />
        <div className="absolute top-0 right-0 h-32 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative p-5 pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar
                name={membre.nom_complet || `${membre.prenom || ''} ${membre.nom || ''}`}
                src={membre.photo}
                size="xl"
                className="ring-4 ring-white shadow-lg group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h4 className="font-bold text-white">
                {membre.nom} {membre.prenom || ''}
              </h4>
              <p className="mt-0.5 text-xs text-indigo-100">Fiche membre · #{membre.id}</p>
            </div>
            </div>
            <div className="rounded-xl bg-white/15 p-2 text-white opacity-80 transition-opacity group-hover:opacity-100">
              <FiArrowRight size={20} />
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <StatutBadge statut={membre.statut?.libelle} />
            {membre.fonctions?.slice(0, 1).map((fonction) => (
              <Badge key={typeof fonction === 'string' ? fonction : fonction.id} variant="info" className="text-xs">
                {typeof fonction === 'string' ? fonction : fonction.nomFonction}
              </Badge>
            ))}
            {(membre.fonctions?.length || 0) > 1 && <Badge variant="default" className="text-xs">+{membre.fonctions.length - 1}</Badge>}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-secondary-500">
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
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-secondary-400">
              <div className="flex items-center gap-1.5">
                <FiCalendar size={12} />
                <span>Membre depuis le {formatDate(membre.date_adhesion)}</span>
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
