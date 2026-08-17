import { useEffect, useMemo, useState } from 'react'
import { FiCheck, FiClock, FiEye, FiRefreshCw, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

import api from '../../api/axiosClient'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import AnimatedCard from '../../components/ui/AnimatedCard'

const dateFormat = (value) => value ? new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const statusVariant = { EN_ATTENTE: 'warning', VALIDEE: 'success', REJETEE: 'danger' }
const statusLabel = { EN_ATTENTE: 'En attente', VALIDEE: 'Validée', REJETEE: 'Rejetée' }

const getApiError = (error) => {
  const data = error.response?.data
  const message = data?.error?.message ?? data?.detail ?? data?.message
  if (Array.isArray(message)) return message.join(' ')
  if (typeof message === 'string') return message
  if (message && typeof message === 'object') return Object.values(message).flat().join(' ')
  return 'Cette demande ne peut pas être traitée.'
}

export default function DemandesAdhesionPage() {
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/demandes-adhesion/', { params: { page_size: 100 } })
      setDemandes(data.results || data || [])
    } catch {
      toast.error('Impossible de charger les inscriptions en ligne.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const pending = useMemo(() => demandes.filter((demande) => demande.statut === 'EN_ATTENTE'), [demandes])
  const process = async (demande, action) => {
    if (action === 'rejeter' && !window.confirm(`Rejeter la demande de ${demande.prenom} ${demande.nom} ?`)) return
    setProcessingId(demande.id)
    try {
      await api.post(`/demandes-adhesion/${demande.id}/${action}/`, action === 'rejeter' ? { motif_rejet: 'Demande rejetée depuis le tableau de bord.' } : {})
      toast.success(action === 'valider' ? 'Membre créé à partir de la demande.' : 'Demande rejetée.')
      setSelected(null)
      await load()
    } catch (error) {
      toast.error(getApiError(error))
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-bold text-secondary-900">Inscriptions en ligne</h1><p className="mt-1 text-secondary-500">Demandes envoyées depuis le site vitrine, à valider avant création du membre.</p></div><Button icon={FiRefreshCw} variant="outline" onClick={load} isLoading={loading}>Actualiser</Button></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><AnimatedCard className="rounded-xl border border-amber-100 bg-amber-50 p-4"><p className="text-sm text-amber-700">À traiter</p><p className="text-3xl font-bold text-amber-900">{pending.length}</p></AnimatedCard><AnimatedCard className="rounded-xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-sm text-emerald-700">Validées</p><p className="text-3xl font-bold text-emerald-900">{demandes.filter((item) => item.statut === 'VALIDEE').length}</p></AnimatedCard><AnimatedCard className="rounded-xl border border-gray-100 bg-white p-4"><p className="text-sm text-secondary-500">Total</p><p className="text-3xl font-bold text-secondary-900">{demandes.length}</p></AnimatedCard></div>
      <AnimatedCard className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
        <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-100"><thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-secondary-500"><tr><th className="px-5 py-3">Membre</th><th className="px-5 py-3">Coordonnées</th><th className="px-5 py-3">Envoyée le</th><th className="px-5 py-3">Statut</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{loading ? <tr><td colSpan="5" className="px-5 py-10 text-center text-secondary-400">Chargement…</td></tr> : demandes.length === 0 ? <tr><td colSpan="5" className="px-5 py-10 text-center text-secondary-400">Aucune inscription en ligne.</td></tr> : demandes.map((demande) => <tr key={demande.id} className="hover:bg-gray-50"><td className="px-5 py-4"><p className="font-medium text-secondary-900">{demande.prenom} {demande.nom}</p><p className="text-xs text-secondary-400">{demande.eglise_origine || 'Église non renseignée'}</p></td><td className="px-5 py-4 text-sm"><p>{demande.email}</p><p className="text-secondary-500">{demande.telephone || '—'}</p></td><td className="px-5 py-4 text-sm text-secondary-500">{dateFormat(demande.date_demande)}</td><td className="px-5 py-4"><Badge variant={statusVariant[demande.statut] || 'default'}>{statusLabel[demande.statut] || demande.statut}</Badge></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" icon={FiEye} onClick={() => setSelected(demande)}>Détails</Button>{demande.statut === 'EN_ATTENTE' && <><Button size="sm" variant="success" icon={FiCheck} isLoading={processingId === demande.id} onClick={() => process(demande, 'valider')}>Valider</Button><Button size="sm" variant="danger" icon={FiX} disabled={processingId === demande.id} onClick={() => process(demande, 'rejeter')}>Rejeter</Button></>}</div></td></tr>)}</tbody></table></div>
      </AnimatedCard>
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={() => setSelected(null)}><div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="mb-5 flex items-start justify-between"><div><h2 className="text-xl font-bold text-secondary-900">{selected.prenom} {selected.nom}</h2><p className="text-sm text-secondary-500">Demande d’inscription en ligne</p></div><Button variant="ghost" icon={FiX} onClick={() => setSelected(null)}>Fermer</Button></div><div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">{[['E-mail', selected.email], ['Téléphone', selected.telephone], ['Téléphone secondaire', selected.telephone_secondaire], ['Adresse', selected.adresse], ["Église d'origine", selected.eglise_origine], ['Date de naissance', selected.date_naissance], ['Date de présentation', selected.date_presentation], ['Date de conversion', selected.date_conversion], ["Date d'affiliation", selected.date_affiliation], ['Date de baptême', selected.date_bapteme], ['État matrimonial', selected.etat_matrimonial], ["Ancienneté à l'EBEC", selected.anciennete_ebec]].map(([label, value]) => <div key={label} className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-secondary-400">{label}</p><p className="font-medium text-secondary-800">{value || '—'}</p></div>)}</div>{selected.message && <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm"><p className="mb-1 text-xs text-secondary-400">Message</p>{selected.message}</div>}{selected.statut === 'EN_ATTENTE' && <div className="mt-5 flex justify-end gap-2"><Button variant="danger" icon={FiX} onClick={() => process(selected, 'rejeter')}>Rejeter</Button><Button variant="success" icon={FiCheck} onClick={() => process(selected, 'valider')}>Valider et créer le membre</Button></div>}</div></div>}
    </div>
  )
}
