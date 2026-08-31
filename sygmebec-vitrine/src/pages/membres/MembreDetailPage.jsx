// ============================================
// src/pages/membres/MembreDetailPage.jsx
// ============================================
import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiArrowLeft, FiEdit2, FiRefreshCw, FiMail, FiPhone, 
  FiMapPin, FiCalendar, FiUser, FiTrash2 
} from 'react-icons/fi'
import { useMembre, useStatuts, useChangerStatut } from '../../hooks/useMembres'
import { useAuthStore } from '../../store/authStore'
import { canDelete } from '../../utils/roleHierarchy'
import { formatDate } from '../../utils/formatDate'
import Button from '../../components/ui/Button'
import StatutBadge from '../../components/membres/StatutBadge'
import Badge from '../../components/ui/Badge'
import HistoriqueStatutList from '../../components/membres/HistoriqueStatutList'
import ChangerStatutModal from '../../components/membres/ChangerStatutModal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import AnimatedCard from '../../components/ui/AnimatedCard'
import { useDeleteMembre } from '../../hooks/useMembres'

export default function MembreDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role } = useAuthStore()
  const { data: membre, isLoading } = useMembre(id)
  const { data: statuts } = useStatuts()
  const statutsList = Array.isArray(statuts) ? statuts : (statuts && statuts.results) ? statuts.results : []
  const { mutate: changerStatut, isPending: isChanging } = useChangerStatut()
  const { mutate: deleteMembre, isPending: isDeleting } = useDeleteMembre()
  
  const [showStatutModal, setShowStatutModal] = useState(false)
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

  if (!membre) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
          <FiUser className="text-gray-400" size={28} />
        </div>
        <p className="text-secondary-400">Membre non trouvé</p>
        <Link to="/membres" className="text-primary-600 hover:underline mt-2 inline-block">
          Retour à la liste
        </Link>
      </div>
    )
  }

  const handleChangerStatut = (data) => {
    changerStatut({ id, data }, {
      onSuccess: () => {
        setShowStatutModal(false)
      },
    })
  }

  const handleDelete = () => {
    deleteMembre(id, {
      onSuccess: () => {
        navigate('/membres')
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/membres">
            <Button variant="ghost" icon={FiArrowLeft} size="sm">
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-secondary-900 truncate">
            {membre.nom} {membre.prenom || ''}
          </h1>
          <StatutBadge statut={membre.statut?.libelle} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            icon={FiRefreshCw}
            onClick={() => setShowStatutModal(true)}
            size="sm"
          >
            Changer statut
          </Button>
          <Link to={`/membres/${id}/modifier`}>
            <Button icon={FiEdit2} size="sm">Modifier</Button>
          </Link>
          {canDelete(role) && (
            <Button
              variant="danger"
              icon={FiTrash2}
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Supprimer
            </Button>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AnimatedCard className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-6">
            <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
              <FiUser className="text-primary-500" />
              Informations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50">
                <label className="text-xs text-secondary-400 uppercase tracking-wider">Statut</label>
                <div className="mt-1">
                  <StatutBadge statut={membre.statut?.libelle} />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50">
                <label className="text-xs text-secondary-400 uppercase tracking-wider">Date d'adhésion</label>
                <p className="text-secondary-900 font-medium mt-1 flex items-center gap-2">
                  <FiCalendar className="text-primary-500" />
                  {formatDate(membre.date_adhesion)}
                </p>
              </div>
              {membre.date_naissance && (
                <div className="p-4 rounded-xl bg-gray-50">
                  <label className="text-xs text-secondary-400 uppercase tracking-wider">Date de naissance</label>
                  <p className="text-secondary-900 font-medium mt-1">
                    {formatDate(membre.date_naissance)}
                  </p>
                </div>
              )}
              <div className="p-4 rounded-xl bg-gray-50">
                <label className="text-xs text-secondary-400 uppercase tracking-wider">ID</label>
                <p className="text-secondary-900 font-medium mt-1">#{membre.id}</p>
              </div>
            </div>
          </AnimatedCard>

          {/* Contact */}
          <AnimatedCard className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-6" delay={0.1}>
            <h3 className="font-semibold text-secondary-900 mb-4">Contact</h3>
            <div className="space-y-3">
              {membre.telephone && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-secondary-600">
                  <FiPhone className="text-primary-500" />
                  <span>{membre.telephone}</span>
                </div>
              )}
              {membre.email && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-secondary-600">
                  <FiMail className="text-primary-500" />
                  <span>{membre.email}</span>
                </div>
              )}
              {membre.adresse && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-secondary-600">
                  <FiMapPin className="text-primary-500" />
                  <span>{membre.adresse}</span>
                </div>
              )}
              {!membre.telephone && !membre.email && !membre.adresse && (
                <p className="text-secondary-400 text-sm">Aucune information de contact</p>
              )}
            </div>
          </AnimatedCard>

          {/* Fonctions */}
          <AnimatedCard className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-6" delay={0.15}>
            <h3 className="font-semibold text-secondary-900 mb-4">Fonctions</h3>
            {membre.fonctions?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {membre.fonctions.map((f) => (
                  <Badge key={f.id} variant="info" className="text-sm">
                    {f.nomFonction}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-secondary-400 text-sm">Aucune fonction assignée</p>
            )}
          </AnimatedCard>
        </div>

        {/* Historique */}
        <div className="lg:col-span-1">
          <AnimatedCard className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-6" delay={0.2}>
            <h3 className="font-semibold text-secondary-900 mb-4">Historique des statuts</h3>
            <HistoriqueStatutList historique={membre.historiques_statut} />
          </AnimatedCard>
        </div>
      </div>

      {/* Modals */}
      <ChangerStatutModal
        isOpen={showStatutModal}
        onClose={() => setShowStatutModal(false)}
        onConfirm={handleChangerStatut}
        currentStatut={membre.statut?.libelle}
        statuts={statutsList}
        isLoading={isChanging}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer le membre"
        message={`Êtes-vous sûr de vouloir supprimer ${membre.nom} ${membre.prenom || ''} ? Cette action est irréversible.`}
        isLoading={isDeleting}
      />
    </div>
  )
}