import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FiCalendar, FiRefreshCw, FiTrash2, FiUser } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { membresApi } from '../api/membresApi'
import { evenementsApi } from '../api/evenementsApi'

const list = (value) => value?.results || value || []
const displayDate = (value) => value ? new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : 'Date inconnue'

export default function CorbeillePage() {
  const queryClient = useQueryClient()
  const membres = useQuery({ queryKey: ['corbeille', 'membres'], queryFn: () => membresApi.getCorbeille().then((res) => res.data) })
  const evenements = useQuery({ queryKey: ['corbeille', 'evenements'], queryFn: () => evenementsApi.getCorbeille().then((res) => res.data) })
  const refresh = () => { membres.refetch(); evenements.refetch() }
  const restore = useMutation({
    mutationFn: ({ type, id }) => type === 'membre' ? membresApi.restaurer(id) : evenementsApi.restaurer(id),
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: ['corbeille'] })
      queryClient.invalidateQueries({ queryKey: [type === 'membre' ? 'membres' : 'evenements'] })
      if (type === 'membre') queryClient.invalidateQueries({ queryKey: ['membres-statistiques'] })
      toast.success('Élément restauré avec toutes ses informations.')
    },
    onError: () => toast.error('La restauration est impossible pour le moment.'),
  })
  const memberItems = list(membres.data)
  const eventItems = list(evenements.data)
  const loading = membres.isLoading || evenements.isLoading

  return <div className="mx-auto max-w-6xl space-y-7">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div><div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-700"><FiTrash2 />Administration</div><h1 className="text-3xl font-bold text-secondary-900">Corbeille</h1><p className="mt-2 text-secondary-500">Les membres et événements supprimés restent conservés ici. Leur restauration récupère toutes leurs informations.</p></div>
      <button type="button" onClick={refresh} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-secondary-700 shadow-sm hover:bg-gray-50"><FiRefreshCw />Actualiser</button>
    </header>
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">Seuls les administrateurs ont accès à cette page. Aucun bouton de suppression définitive n’est proposé.</div>
    {loading ? <p className="rounded-2xl bg-white p-8 text-center text-secondary-400 shadow-card">Chargement de la corbeille…</p> : <div className="grid gap-6 lg:grid-cols-2">
      <TrashSection title="Membres" icon={FiUser} items={memberItems} empty="Aucun membre dans la corbeille." render={(item) => <><b>{`${item.prenom || ''} ${item.nom || ''}`.trim() || 'Membre sans nom'}</b><p>{item.email || item.telephone || 'Coordonnées non renseignées'}</p></>} onRestore={(id) => restore.mutate({ type: 'membre', id })} busy={restore.isPending} />
      <TrashSection title="Événements" icon={FiCalendar} items={eventItems} empty="Aucun événement dans la corbeille." render={(item) => <><b>{item.titre || 'Événement sans titre'}</b><p>{item.lieu || 'Lieu non renseigné'}{item.date ? ` · ${new Date(item.date).toLocaleDateString('fr-FR')}` : ''}</p></>} onRestore={(id) => restore.mutate({ type: 'evenement', id })} busy={restore.isPending} />
    </div>}
  </div>
}

function TrashSection({ title, icon: Icon, items, empty, render, onRestore, busy }) {
  return <section className="overflow-hidden rounded-2xl bg-white shadow-card"><header className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><h2 className="flex items-center gap-2 font-bold text-secondary-900"><Icon className="text-amber-600" />{title}</h2><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">{items.length}</span></header>{items.length ? <ul className="divide-y divide-gray-100">{items.map((item) => <li key={item.id} className="flex items-center gap-4 px-5 py-4"><div className="min-w-0 flex-1 text-sm text-secondary-500">{render(item)}<small className="mt-1 block">Supprimé le {displayDate(item.deleted_at)}{item.deleted_by_nom ? ` par ${item.deleted_by_nom}` : ''}</small></div><button type="button" disabled={busy} onClick={() => onRestore(item.id)} className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">Restaurer</button></li>)}</ul> : <p className="px-5 py-10 text-center text-sm text-secondary-400">{empty}</p>}</section>
}
