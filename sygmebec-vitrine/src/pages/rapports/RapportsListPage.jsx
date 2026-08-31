// ============================================
// src/pages/rapports/RapportsListPage.jsx - Version complète
// ============================================
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiDownload, FiFileText, FiCalendar, FiUser } from 'react-icons/fi'
import { useRapports, useDownloadRapport } from '../../hooks/useRapports'
import { formatDate } from '../../utils/formatDate'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import AnimatedCard from '../../components/ui/AnimatedCard'

export default function RapportsListPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useRapports({ page, page_size: 10 })
  const { mutate: download, isPending: isDownloading } = useDownloadRapport()

  const rapports = data?.results || []
  const totalPages = Math.ceil((data?.count || 0) / 10)

  const handleDownload = (id) => {
    download(id)
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
      key: 'genere_par',
      label: 'Généré par',
      render: (value, item) => (
        <div className="flex items-center gap-2">
          <FiUser className="text-secondary-400" size={14} />
          <span>{item.genere_par?.nom || '—'}</span>
        </div>
      ),
    },
    {
      key: 'dateGeneration',
      label: 'Date de génération',
      sortable: true,
      render: (value) => (
        <div>
          <div className="text-sm">{formatDate(value, 'dd/MM/yyyy')}</div>
          <div className="text-xs text-secondary-400">{formatDate(value, 'HH:mm')}</div>
        </div>
      ),
    },
    {
      key: 'critere',
      label: 'Critères',
      render: (value, item) => (
        <div className="flex flex-wrap gap-1">
          {item.critere?.statut && (
            <Badge variant="info">{item.critere.statut}</Badge>
          )}
          {item.critere?.periode && (
            <Badge variant="default">{item.critere.periode}</Badge>
          )}
          {!item.critere?.statut && !item.critere?.periode && (
            <span className="text-sm text-secondary-400">Tous</span>
          )}
        </div>
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value, item) => (
        item.fichier ? (
          <Badge variant="success">Disponible</Badge>
        ) : (
          <Badge variant="warning">En cours</Badge>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (value, item) => (
        item.fichier && (
          <Button
            variant="ghost"
            size="sm"
            icon={FiDownload}
            onClick={() => handleDownload(item.id)}
            isLoading={isDownloading}
            className="hover:bg-primary-50"
          >
            Télécharger
          </Button>
        )
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Rapports</h1>
          <p className="text-secondary-500 mt-1">Gestion des rapports générés</p>
        </div>
        <Link to="/rapports/generer">
          <Button icon={FiPlus} size="lg">
            Générer un rapport
          </Button>
        </Link>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatedCard className="bg-white rounded-xl shadow-card border border-gray-100/80 p-4" delay={0.1}>
          <p className="text-sm text-secondary-400">Total rapports</p>
          <p className="text-2xl font-bold text-secondary-900">{data?.count || 0}</p>
        </AnimatedCard>
        <AnimatedCard className="bg-white rounded-xl shadow-card border border-gray-100/80 p-4" delay={0.15}>
          <p className="text-sm text-secondary-400">Disponibles</p>
          <p className="text-2xl font-bold text-emerald-600">
            {rapports.filter(r => r.fichier).length}
          </p>
        </AnimatedCard>
        <AnimatedCard className="bg-white rounded-xl shadow-card border border-gray-100/80 p-4" delay={0.2}>
          <p className="text-sm text-secondary-400">En cours</p>
          <p className="text-2xl font-bold text-amber-600">
            {rapports.filter(r => !r.fichier).length}
          </p>
        </AnimatedCard>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={rapports}
        loading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        totalItems={data?.count || 0}
        itemsPerPage={10}
        onPageChange={setPage}
      />
    </div>
  )
}