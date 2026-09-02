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
import Avatar from '../../components/ui/Avatar'
import './membreDetailPremium.css'

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
    <div className="member-detail-premium space-y-6">
      {/* Header */}
      <div className="member-premium-topbar flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

      <AnimatedCard className="member-premium-hero overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl" delay={0.05}>
        <div className="grid md:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.45fr)]">
          <div className="member-premium-identity relative overflow-hidden bg-gradient-to-br from-indigo-800 via-indigo-700 to-violet-700 p-7 text-white">
            <div className="absolute -right-16 -top-12 h-48 w-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-fuchsia-400/20" />
            <div className="relative flex h-full flex-col items-center text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-100">EBEC · SYGMEBEC</p>
              <Avatar name={membre.nom_complet || `${membre.prenom || ''} ${membre.nom || ''}`} src={membre.photo} size="2xl" className="mt-6 ring-4 ring-white/80 shadow-xl" />
              <h2 className="mt-4 text-2xl font-bold">{membre.nom} {membre.prenom || ''}</h2>
              <p className="mt-1 text-sm text-indigo-100">Carte officielle de membre</p>
              <div className="mt-6 w-full rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-left">
                <p className="text-[10px] uppercase tracking-wider text-indigo-100">Numéro de membre</p>
                <p className="mt-1 text-lg font-bold tracking-wide">EBEC-{String(membre.id).padStart(5, '0')}</p>
              </div>
            </div>
          </div>
          <div className="member-premium-summary p-7">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-5">
              <div><p className="text-sm text-secondary-400">Fiche d'identification</p><h3 className="mt-1 text-xl font-bold text-secondary-900">Informations du membre</h3></div>
              <StatutBadge statut={membre.statut?.libelle} />
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 pt-6 sm:grid-cols-2">
              <div><p className="text-xs uppercase tracking-wide text-secondary-400">Nom complet</p><p className="mt-1 font-semibold text-secondary-900">{membre.nom} {membre.prenom || ''}</p></div>
              <div><p className="text-xs uppercase tracking-wide text-secondary-400">Fonction</p><p className="mt-1 font-semibold text-secondary-900">{membre.fonctions?.[0] ? (typeof membre.fonctions[0] === 'string' ? membre.fonctions[0] : membre.fonctions[0].nomFonction) : 'Membre'}</p></div>
              <div><p className="text-xs uppercase tracking-wide text-secondary-400">Téléphone</p><p className="mt-1 flex items-center gap-2 font-semibold text-secondary-900"><FiPhone className="text-indigo-500" size={15} />{membre.telephone || 'Non renseigné'}</p></div>
              <div><p className="text-xs uppercase tracking-wide text-secondary-400">Courriel</p><p className="mt-1 flex items-center gap-2 truncate font-semibold text-secondary-900"><FiMail className="shrink-0 text-indigo-500" size={15} />{membre.email || 'Non renseigné'}</p></div>
              <div><p className="text-xs uppercase tracking-wide text-secondary-400">Date de naissance</p><p className="mt-1 flex items-center gap-2 font-semibold text-secondary-900"><FiCalendar className="text-indigo-500" size={15} />{membre.date_naissance ? formatDate(membre.date_naissance) : 'Non renseignée'}</p></div>
              <div><p className="text-xs uppercase tracking-wide text-secondary-400">Membre depuis</p><p className="mt-1 flex items-center gap-2 font-semibold text-secondary-900"><FiCalendar className="text-indigo-500" size={15} />{formatDate(membre.date_adhesion)}</p></div>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AnimatedCard className="member-premium-section bg-white rounded-2xl shadow-card border border-gray-100/80 p-6">
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
          <AnimatedCard className="member-premium-section bg-white rounded-2xl shadow-card border border-gray-100/80 p-6" delay={0.1}>
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
          <AnimatedCard className="member-premium-section bg-white rounded-2xl shadow-card border border-gray-100/80 p-6" delay={0.15}>
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
          <AnimatedCard className="member-premium-membership relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-800 via-indigo-700 to-violet-800 p-6 text-white shadow-xl" delay={0.15}>
            <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-fuchsia-400/15" />
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-100">Église Baptiste de l'Espoir du Cap-Haïtien</p>
                  <h3 className="mt-2 text-lg font-bold">Carte de membre</h3>
                </div>
                <span className="rounded-lg bg-white/15 px-2 py-1 text-xs font-semibold">#{membre.id}</span>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <Avatar name={membre.nom_complet || `${membre.prenom || ''} ${membre.nom || ''}`} src={membre.photo} size="2xl" className="ring-4 ring-white/70 shadow-lg" />
                <div className="min-w-0">
                  <p className="truncate text-xl font-bold">{membre.nom} {membre.prenom || ''}</p>
                  <div className="mt-2"><StatutBadge statut={membre.statut?.libelle} /></div>
                  {membre.fonctions?.[0] && <p className="mt-2 truncate text-sm text-indigo-100">{typeof membre.fonctions[0] === 'string' ? membre.fonctions[0] : membre.fonctions[0].nomFonction}</p>}
                </div>
              </div>
              <div className="mt-6 border-t border-white/20 pt-3 text-xs text-indigo-100">Membre depuis le {formatDate(membre.date_adhesion)}</div>
            </div>
          </AnimatedCard>
          <AnimatedCard className="member-premium-section bg-white rounded-2xl shadow-card border border-gray-100/80 p-6" delay={0.2}>
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
        title="Mettre le membre à la corbeille"
        message={`${membre.nom} ${membre.prenom || ''} sera placé dans la corbeille et pourra être restauré par un administrateur.`}
        isLoading={isDeleting}
      />
    </div>
  )
}
