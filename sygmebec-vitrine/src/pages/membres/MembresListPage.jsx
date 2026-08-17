// ============================================
// src/pages/membres/MembresListPage.jsx - Version Complète
// ============================================
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPlus, FiSearch, FiFilter, FiX, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useMembres, useStatuts, useFonctions } from '../../hooks/useMembres'
import { useAuthStore } from '../../store/authStore'
import { useFiltersStore } from '../../store/filtersStore'
import { canDelete } from '../../utils/roleHierarchy'
import { formatDate } from '../../utils/formatDate'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import DataTable from '../../components/ui/DataTable'
import StatutBadge from '../../components/membres/StatutBadge'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useDeleteMembre } from '../../hooks/useMembres'

export default function MembresListPage() {
  const { role } = useAuthStore()
  const { search, statutFiltre, setSearch, setStatutFiltre, resetFilters } = useFiltersStore()
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useMembres({
    search: search || undefined,
    statut: statutFiltre || undefined,
    page,
    page_size: 10,
  })
  const { data: statuts } = useStatuts()
  const { data: fonctions } = useFonctions()
  const { mutate: deleteMembre, isPending: isDeleting } = useDeleteMembre()

  const membres = data?.results || []
  const totalPages = Math.ceil((data?.count || 0) / 10)

  const handleDelete = () => {
    if (deleteTarget) {
      deleteMembre(deleteTarget)
      setDeleteTarget(null)
    }
  }

  const columns = [
    {
      key: 'nom',
      label: 'Membre',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="font-medium text-secondary-900">
            {item.nom} {item.prenom || ''}
          </div>
          <div className="text-xs text-secondary-400">ID: #{item.id}</div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (value, item) => (
        <div>
          <div className="text-sm">{item.telephone || '—'}</div>
          <div className="text-xs text-secondary-400">{item.email || '—'}</div>
        </div>
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      sortable: true,
      render: (value, item) => <StatutBadge statut={item.statut?.libelle} />,
    },
    {
      key: 'fonctions',
      label: 'Fonctions',
      render: (value, item) => (
        <div className="flex flex-wrap gap-1">
          {item.fonctions?.slice(0, 2).map((f) => (
            <Badge key={f.id} variant="info" className="text-xs">{f.nomFonction}</Badge>
          ))}
          {(item.fonctions?.length || 0) > 2 && (
            <Badge variant="default">+{item.fonctions.length - 2}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'date_adhesion',
      label: 'Adhésion',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (value, item) => (
        <div className="flex items-center justify-end gap-1">
          <Link to={`/membres/${item.id}`}>
            <Button variant="ghost" size="sm" icon={FiEye} className="hover:bg-primary-50">
              Voir
            </Button>
          </Link>
          <Link to={`/membres/${item.id}/modifier`}>
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
          <h1 className="text-2xl font-bold text-secondary-900">Membres</h1>
          <p className="text-secondary-500 mt-1">Gestion des membres de l'église</p>
        </div>
        <Link to="/membres/nouveau">
          <Button icon={FiPlus} size="lg">
            Nouveau membre
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Rechercher un membre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={FiSearch}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            icon={FiFilter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtres
          </Button>
          {(search || statutFiltre) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              icon={FiX}
            >
              Réinitialiser
            </Button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Select
              value={statutFiltre}
              onChange={(e) => setStatutFiltre(e.target.value)}
              placeholder="Tous les statuts"
              label="Statut"
              options={statuts?.map(s => ({ value: s.libelle, label: s.libelle })) || []}
            />
          </motion.div>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={membres}
        loading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        totalItems={data?.count || 0}
        itemsPerPage={10}
        onPageChange={setPage}
        searchable
        searchPlaceholder="Rechercher un membre..."
        onSearch={setSearch}
        onRowClick={(item) => window.location.href = `/membres/${item.id}`}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer le membre"
        message="Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible."
        isLoading={isDeleting}
      />
    </div>
  )
}