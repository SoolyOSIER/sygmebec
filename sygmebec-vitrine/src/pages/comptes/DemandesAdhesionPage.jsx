import { useState } from 'react'
import { FiCheck, FiInbox, FiX } from 'react-icons/fi'

import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import {
  useDemandesAdhesion,
  useRejeterDemandeAdhesion,
  useValiderDemandeAdhesion,
} from '../../hooks/useDemandesAdhesion'

const STATUTS = {
  EN_ATTENTE: { label: 'En attente', variant: 'warning' },
  VALIDEE: { label: 'Validée', variant: 'success' },
  REJETEE: { label: 'Rejetée', variant: 'danger' },
}

function StatutDemande({ statut }) {
  const config = STATUTS[statut] || { label: statut, variant: 'default' }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export default function DemandesAdhesionPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState('EN_ATTENTE')
  const [actionTarget, setActionTarget] = useState(null)

  const { data, isLoading } = useDemandesAdhesion({
    page,
    page_size: 10,
    search: search || undefined,
    statut: statut || undefined,
  })
  const { mutate: valider, isPending: validationEnCours } = useValiderDemandeAdhesion()
  const { mutate: rejeter, isPending: rejetEnCours } = useRejeterDemandeAdhesion()

  const demandes = data?.results || []
  const totalPages = Math.max(1, Math.ceil((data?.count || 0) / 10))

  const confirmerAction = () => {
    if (!actionTarget) return
    const { demande, type } = actionTarget
    const onSuccess = () => setActionTarget(null)
    if (type === 'valider') {
      valider(demande.id, { onSuccess })
      return
    }
    rejeter({ id: demande.id, data: {} }, { onSuccess })
  }

  const columns = [
    {
      key: 'demandeur',
      label: 'Demandeur',
      render: (_, demande) => (
        <div>
          <p className="font-medium text-secondary-900">{demande.prenom} {demande.nom}</p>
          <p className="text-xs text-secondary-400">{demande.email}</p>
        </div>
      ),
    },
    {
      key: 'telephone',
      label: 'Téléphone',
      render: (telephone) => telephone || '—',
    },
    {
      key: 'message',
      label: 'Message',
      render: (message) => <span className="block max-w-xs truncate" title={message}>{message || '—'}</span>,
    },
    {
      key: 'date_demande',
      label: 'Reçue le',
      render: (date) => new Date(date).toLocaleDateString('fr-FR'),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value) => <StatutDemande statut={value} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (_, demande) => demande.statut === 'EN_ATTENTE' ? (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="success" icon={FiCheck} onClick={() => setActionTarget({ type: 'valider', demande })}>
            Valider
          </Button>
          <Button size="sm" variant="danger" icon={FiX} onClick={() => setActionTarget({ type: 'rejeter', demande })}>
            Rejeter
          </Button>
        </div>
      ) : (
        <span className="text-xs text-secondary-400">{demande.traite_par_identifiant || 'Traité'}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Demandes d’adhésion</h1>
          <p className="mt-1 text-secondary-500">Demandes reçues depuis le site vitrine public.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={statut === 'EN_ATTENTE' ? 'primary' : 'secondary'} size="sm" onClick={() => { setStatut('EN_ATTENTE'); setPage(1) }}>
            À traiter
          </Button>
          <Button variant={statut === '' ? 'primary' : 'secondary'} size="sm" onClick={() => { setStatut(''); setPage(1) }}>
            Toutes
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-card">
          <FiInbox className="mb-2 text-amber-500" size={22} />
          <p className="text-sm text-secondary-400">Demandes affichées</p>
          <p className="text-2xl font-bold text-secondary-900">{data?.count || 0}</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={demandes}
        loading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        totalItems={data?.count || 0}
        itemsPerPage={10}
        onPageChange={setPage}
        searchable
        searchPlaceholder="Rechercher une demande..."
        onSearch={(value) => { setSearch(value); setPage(1) }}
      />

      <ConfirmDialog
        isOpen={Boolean(actionTarget)}
        onClose={() => setActionTarget(null)}
        onConfirm={confirmerAction}
        loading={validationEnCours || rejetEnCours}
        title={actionTarget?.type === 'valider' ? 'Valider la demande' : 'Rejeter la demande'}
        message={actionTarget?.type === 'valider'
          ? 'Une fiche membre sera créée avec les coordonnées du demandeur.'
          : 'Cette demande sera marquée comme rejetée.'}
      />
    </div>
  )
}
