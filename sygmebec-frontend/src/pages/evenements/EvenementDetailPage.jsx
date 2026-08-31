// ============================================
// src/pages/evenements/EvenementDetailPage.jsx - Version complète
// ============================================
import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiArrowLeft, FiEdit2, FiCalendar, FiMapPin, FiUser, 
  FiClock, FiTrash2, FiUsers 
} from 'react-icons/fi'
import { useEvenement } from '../../hooks/useEvenements'
import { useAuthStore } from '../../store/authStore'
import { canDelete } from '../../utils/roleHierarchy'
import { formatDate, formatDateTime } from '../../utils/formatDate'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import AnimatedCard from '../../components/ui/AnimatedCard'
import { useDeleteEvenement } from '../../hooks/useEvenements'

export default function EvenementDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role } = useAuthStore()
  const { data: evenement, isLoading } = useEvenement(id)
  const { mutate: deleteEvenement, isPending: isDeleting } = useDeleteEvenement()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-secondary-400">Chargement...</span>
        </div>
      </div>
    )
  }

  if (!evenement) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
          <FiCalendar className="text-gray-400" size={28} />
        </div>
        <p className="text-secondary-400">Événement non trouvé</p>
        <Link to="/evenements" className="text-primary-600 hover:underline mt-2 inline-block">
          Retour à la liste
        </Link>
      </div>
    )
  }

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

  const handleDelete = () => {
    deleteEvenement(id, {
      onSuccess: () => {
        navigate('/evenements')
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/evenements">
            <Button variant="ghost" icon={FiArrowLeft} size="sm">
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-secondary-900 truncate">{evenement.titre}</h1>
          {getStatusBadge()}
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/evenements/${id}/modifier`}>
            <Button icon={FiEdit2}>Modifier</Button>
          </Link>
          {canDelete(role) && (
            <Button variant="danger" icon={FiTrash2} onClick={() => setShowDeleteConfirm(true)}>
              Supprimer
            </Button>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${getStatusColor()} p-8 text-white`}>
        <div className="absolute inset-0 hero-pattern opacity-50" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{evenement.titre}</h2>
            <p className="opacity-80 mt-1">{evenement.lieu}</p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-lg font-semibold">
              {formatDate(evenement.date, 'dd/MM/yyyy')}
            </p>
            <p className="opacity-80 text-sm">{formatDate(evenement.date, 'HH:mm')}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AnimatedCard className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-6">
            <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
              <FiCalendar className="text-primary-500" />
              Informations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50">
                <label className="text-xs text-secondary-400 uppercase tracking-wider">Date et heure</label>
                <p className="text-secondary-900 font-medium mt-1">
                  {formatDateTime(evenement.date)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50">
                <label className="text-xs text-secondary-400 uppercase tracking-wider">Lieu</label>
                <p className="text-secondary-900 font-medium mt-1 flex items-center gap-2">
                  <FiMapPin className="text-primary-500" />
                  {evenement.lieu}
                </p>
              </div>
              {evenement.responsable && (
                <div className="p-4 rounded-xl bg-gray-50">
                  <label className="text-xs text-secondary-400 uppercase tracking-wider">Responsable</label>
                  <Link 
                    to={`/membres/${evenement.responsable.id}`}
                    className="text-secondary-900 font-medium mt-1 flex items-center gap-2 hover:text-primary-600 transition-colors"
                  >
                    <FiUser className="text-primary-500" />
                    {evenement.responsable.nom} {evenement.responsable.prenom || ''}
                  </Link>
                </div>
              )}
              <div className="p-4 rounded-xl bg-gray-50">
                <label className="text-xs text-secondary-400 uppercase tracking-wider">Date de création</label>
                <p className="text-secondary-900 font-medium mt-1 flex items-center gap-2">
                  <FiClock className="text-primary-500" />
                  {formatDateTime(evenement.dateCreation)}
                </p>
              </div>
            </div>
          </AnimatedCard>

          {evenement.description && (
            <AnimatedCard className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-6" delay={0.1}>
              <h3 className="font-semibold text-secondary-900 mb-4">Description</h3>
              <p className="text-secondary-600 whitespace-pre-wrap leading-relaxed">
                {evenement.description}
              </p>
            </AnimatedCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AnimatedCard className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-6" delay={0.15}>
            <h3 className="font-semibold text-secondary-900 mb-4">Statut</h3>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              {getStatusBadge()}
              <span className="text-sm text-secondary-600">
                {isPast ? 'Événement terminé' : isToday ? 'Événement en cours' : 'À venir'}
              </span>
            </div>
          </AnimatedCard>

          {evenement.responsable && (
            <AnimatedCard className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-6" delay={0.2}>
              <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                <FiUser className="text-primary-500" />
                Responsable
              </h3>
              <Link 
                to={`/membres/${evenement.responsable.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                  {evenement.responsable.nom?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-secondary-900 group-hover:text-primary-600 transition-colors">
                    {evenement.responsable.nom} {evenement.responsable.prenom || ''}
                  </p>
                  <p className="text-xs text-secondary-400">Membre de l'église</p>
                </div>
              </Link>
            </AnimatedCard>
          )}

          <AnimatedCard className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-6" delay={0.25}>
            <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
              <FiUsers className="text-primary-500" />
              Actions rapides
            </h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-center" size="sm">
                Partager l'événement
              </Button>
              <Button variant="outline" className="w-full justify-center" size="sm">
                Exporter en PDF
              </Button>
            </div>
          </AnimatedCard>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Mettre l’événement à la corbeille"
        message={`« ${evenement.titre} » sera placé dans la corbeille et pourra être restauré par un administrateur.`}
        isLoading={isDeleting}
      />
    </div>
  )
}
