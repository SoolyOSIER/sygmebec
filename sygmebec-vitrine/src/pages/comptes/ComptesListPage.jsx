// ============================================
// src/pages/comptes/ComptesListPage.jsx - Version complète
// ============================================
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiUser, FiRefreshCw, FiTrash2, FiSearch, FiX } from 'react-icons/fi'
import {
  useCreateUtilisateur,
  useDeleteUtilisateur,
  useResetPassword,
  useUpdateUtilisateur,
  useUtilisateurs,
} from '../../hooks/useUtilisateurs'
import { useMembres } from '../../hooks/useMembres'
import { getRoleLabel } from '../../utils/roleHierarchy'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import UtilisateurForm from '../../components/comptes/UtilisateurForm'
import AnimatedCard from '../../components/ui/AnimatedCard'

export default function ComptesListPage() {
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useUtilisateurs({
    search: search || undefined,
    page,
    page_size: 10,
  })
  const { data: membres } = useMembres({ page_size: 1000 })
  const { mutate: createUser, isPending: isCreating } = useCreateUtilisateur()
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUtilisateur()
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUtilisateur()
  const { mutate: resetPassword, isPending: isResetting } = useResetPassword()

  const utilisateurs = data?.results || []
  const totalPages = Math.ceil((data?.count || 0) / 10)

  const handleCreate = (data) => {
    createUser(data, {
      onSuccess: () => {
        setShowCreateModal(false)
      },
    })
  }

  const handleEdit = (data) => {
    updateUser({ id: editTarget, data }, {
      onSuccess: () => {
        setShowEditModal(false)
        setEditTarget(null)
      },
    })
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteUser(deleteTarget)
      setDeleteTarget(null)
    }
  }

  const columns = [
    {
      key: 'identifiant',
      label: 'Identifiant',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="font-medium text-secondary-900">{item.identifiant}</div>
          <div className="text-xs text-secondary-400">ID: #{item.id}</div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (value, item) => (
        <Badge variant="info">{getRoleLabel(item.role_acces?.nomRole)}</Badge>
      ),
    },
    {
      key: 'membre',
      label: 'Membre associé',
      render: (value, item) => (
        item.membre ? (
          <div className="flex items-center gap-2">
            <span className="text-sm">{item.membre.nom}</span>
            <Badge variant="default" className="text-xs">Associé</Badge>
          </div>
        ) : (
          <span className="text-sm text-secondary-400">—</span>
        )
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value, item) => (
        item.is_active ? (
          <Badge variant="success">Actif</Badge>
        ) : (
          <Badge variant="danger">Inactif</Badge>
        )
      ),
    },
    {
      key: 'dernier_acces',
      label: 'Dernier accès',
      sortable: true,
      render: (value) => (
        <span className="text-sm">
          {value ? new Date(value).toLocaleDateString() : 'Jamais'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (value, item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={FiRefreshCw}
            onClick={() => resetPassword(item.id)}
            isLoading={isResetting}
            className="hover:bg-amber-50"
          >
            Reset
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={FiUser}
            onClick={() => {
              setEditTarget(item.id)
              setShowEditModal(true)
            }}
            className="hover:bg-blue-50"
          >
            Modifier
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={FiTrash2}
            className="text-danger hover:bg-red-50"
            onClick={() => setDeleteTarget(item.id)}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Comptes utilisateurs</h1>
          <p className="text-secondary-500 mt-1">Gestion des comptes et des rôles</p>
        </div>
        <Button icon={FiPlus} onClick={() => setShowCreateModal(true)} size="lg">
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatedCard className="bg-white rounded-xl shadow-card border border-gray-100/80 p-4" delay={0.1}>
          <p className="text-sm text-secondary-400">Total</p>
          <p className="text-2xl font-bold text-secondary-900">{data?.count || 0}</p>
        </AnimatedCard>
        <AnimatedCard className="bg-white rounded-xl shadow-card border border-gray-100/80 p-4" delay={0.15}>
          <p className="text-sm text-secondary-400">Actifs</p>
          <p className="text-2xl font-bold text-emerald-600">
            {utilisateurs.filter(u => u.is_active).length}
          </p>
        </AnimatedCard>
        <AnimatedCard className="bg-white rounded-xl shadow-card border border-gray-100/80 p-4" delay={0.2}>
          <p className="text-sm text-secondary-400">Administrateurs</p>
          <p className="text-2xl font-bold text-purple-600">
            {utilisateurs.filter(u => u.role_acces?.nomRole === 'ADMINISTRATEUR').length}
          </p>
        </AnimatedCard>
        <AnimatedCard className="bg-white rounded-xl shadow-card border border-gray-100/80 p-4" delay={0.25}>
          <p className="text-sm text-secondary-400">Pasteurs</p>
          <p className="text-2xl font-bold text-blue-600">
            {utilisateurs.filter(u => u.role_acces?.nomRole === 'PASTEUR').length}
          </p>
        </AnimatedCard>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={utilisateurs}
        loading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        totalItems={data?.count || 0}
        itemsPerPage={10}
        onPageChange={setPage}
        searchable
        searchPlaceholder="Rechercher un utilisateur..."
        onSearch={setSearch}
      />

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Créer un utilisateur"
        size="md"
      >
        <UtilisateurForm
          onSubmit={handleCreate}
          isLoading={isCreating}
          membres={membres?.results || []}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditTarget(null)
        }}
        title="Modifier l'utilisateur"
        size="md"
      >
        {editTarget && (
          <UtilisateurForm
            initialData={utilisateurs.find(u => u.id === editTarget)}
            onSubmit={handleEdit}
            isLoading={isUpdating}
            membres={membres?.results || []}
            isEditing
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
        isLoading={isDeleting}
      />
    </div>
  )
}
