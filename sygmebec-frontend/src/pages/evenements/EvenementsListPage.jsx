// ============================================
// src/pages/evenements/EvenementsListPage.jsx - Version complète
// ============================================
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPlus, FiSearch, FiX, FiEye, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi'
import { useEvenements } from '../../hooks/useEvenements'
import { useAuthStore } from '../../store/authStore'
import { canDelete } from '../../utils/roleHierarchy'
import { formatDate } from '../../utils/formatDate'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useDeleteEvenement } from '../../hooks/useEvenements'
import AnimatedCard from '../../components/ui/AnimatedCard'

export default function EvenementsListPage() {
  const { role } = useAuthStore()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useEvenements({
    search: search || undefined,
    page,
    page_size: 10,
  })
  const { mutate: deleteEvenement, isPending: isDeleting } = useDeleteEvenement()

  const evenements = data?.results || []
  const totalPages = Math.ceil((data?.count || 0) / 10)

  const handleDelete = () => {
    if (deleteTarget) {
      deleteEvenement(deleteTarget)
      setDeleteTarget(null)
    }
  }

  const getStatusBadge = (date) => {
    const eventDate = new Date(date)
    const now = new Date()
    if (eventDate < now) return <Badge variant="default">Passé</Badge>
    if (eventDate.toDateString() === now.toDateString()) return <Badge variant="success">Aujourd'hui</Badge>
    return <Badge variant="info">À venir</Badge>
  }

  const columns = [
    {
      key: 'titre',
      label: 'Titre',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="font-medium text-secondary-900">{item.titre}</div>
          <div className="text-xs text-secondary-400">ID: #{item.id}</div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <div>
          <div className="text-sm">{formatDate(value, 'dd/MM/yyyy')}</div>
          <div className="text-xs text-secondary-400">{formatDate(value, 'HH:mm')}</div>
        </div>
      ),
    },
    {
      key: 'lieu',
      label: 'Lieu',
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: 'responsable',
      label: 'Responsable',
      render: (value, item) => (
        <span className="text-sm">
          {item.responsable?.nom || '—'}
        </span>
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value, item) => getStatusBadge(item.date),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (value, item) => (
        <div className="flex items-center justify-end gap-1">
          <Link to={`/evenements/${item.id}`}>
            <Button variant="ghost" size="sm" icon={FiEye} className="hover:bg-primary-50">
              Voir
            </Button>
          </Link>
          <Link to={`/evenements/${item.id}/modifier`}>
            <Button variant="ghost" size="sm" icon={FiEdit2} className="hover:bg-amber-50">
              Modifier
            </Button>
          </Link>
          {canDelete(role) && (
            <Button
              variant="ghost"
              size="sm"
              icon={FiTrash2}
              className="text-danger hover:bg-red-50"
              onClick={() => setDeleteTarget(item.id)}
            >
              Supprimer
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Événements</h1>
          <p className="text-secondary-500 mt-1">Gestion des événements de l'église</p>
        </div>
        <Link to="/evenements/nouveau">
          <Button icon={FiPlus} size="lg">
            Nouvel événement
          </Button>
        </Link>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatedCard className="bg-white rounded-xl shadow-card border border-gray-100/80 p-4" delay={0.1}>
          <p className="text-sm text-secondary-400">Total</p>
          <p className="text-2xl font-bold text-secondary-900">{data?.count || 0}</p>
        </AnimatedCard>
        <AnimatedCard className="bg-white rounded-xl shadow-card border border-gray-100/80 p-4" delay={0.15}>
          <p className="text-sm text-secondary-400">À venir</p>
          <p className="text-2xl font-bold text-emerald-600">
            {evenements.filter(e => new Date(e.date) >= new Date()).length}
          </p>
        </AnimatedCard>
        <AnimatedCard className="bg-white rounded-xl shadow-card border border-gray-100/80 p-4" delay={0.2}>
          <p className="text-sm text-secondary-400">Aujourd'hui</p>
          <p className="text-2xl font-bold text-blue-600">
            {evenements.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).length}
          </p>
        </AnimatedCard>
        <AnimatedCard className="bg-white rounded-xl shadow-card border border-gray-100/80 p-4" delay={0.25}>
          <p className="text-sm text-secondary-400">Passés</p>
          <p className="text-2xl font-bold text-secondary-400">
            {evenements.filter(e => new Date(e.date) < new Date()).length}
          </p>
        </AnimatedCard>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={evenements}
        loading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        totalItems={data?.count || 0}
        itemsPerPage={10}
        onPageChange={setPage}
        searchable
        searchPlaceholder="Rechercher un événement..."
        onSearch={setSearch}
        onRowClick={(item) => window.location.href = `/evenements/${item.id}`}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer l'événement"
        message="Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible."
        isLoading={isDeleting}
      />
    </div>
  )
}