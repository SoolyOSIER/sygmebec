import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCalendar, FiCheck, FiClock, FiDownload, FiEdit2, FiEye, FiMapPin, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi'
import { useDeleteEvenement, useEvenements } from '../../hooks/useEvenements'
import { useAuthStore } from '../../store/authStore'
import { canDelete } from '../../utils/roleHierarchy'
import { formatDate } from '../../utils/formatDate'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import useT from '../../i18n/useT'
import '../programmeReference.css'
import '../referenceForms.css'

const locations = (events) => Object.entries(events.reduce((all, event) => { const name = event.lieu || 'Lieu non renseigné'; all[name] = (all[name] || 0) + 1; return all }, {}))
const status = (date, t) => { const value = new Date(date); const today = new Date(); if (value.toDateString() === today.toDateString()) return ['today', t('events.today')]; return value < today ? ['past', t('events.past')] : ['upcoming', t('events.upcoming')] }
const fullName = (event) => event.responsable_nom || event.responsable?.nom_complet || event.responsable?.nom || '—'

function CardHead({ title, text, tag }) { return <header className="programme-card-head"><div><h3>{title}</h3><p>{text}</p></div><span>{tag}</span></header> }
function Donut({ total, values }) { const colors = ['#c17f18', '#7c50d1', '#3768d6', '#1fa060']; let cursor = 0; const stops = values.map((value, index) => { const start = cursor; cursor += total ? (value / total) * 100 : 0; return `${colors[index % colors.length]} ${start}% ${cursor}%` }).join(', '); return <div className="programme-donut" style={{ background: stops ? `conic-gradient(${stops})` : '#f0ece0' }}><div><b>{total}</b><small>ÉVÉNEMENTS</small></div></div> }

export default function EvenementsListPage() {
  const { t, locale } = useT()
  const { role } = useAuthStore()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { data, isLoading } = useEvenements({ page, page_size: 100, search: search || undefined })
  const { mutate: deleteEvenement, isPending: isDeleting } = useDeleteEvenement()
  const events = data?.results || []
  const counts = data?.count ?? events.length
  const today = new Date()
  const upcoming = events.filter((event) => new Date(event.date) > today)
  const todayEvents = events.filter((event) => new Date(event.date).toDateString() === today.toDateString())
  const past = events.filter((event) => new Date(event.date) < today && new Date(event.date).toDateString() !== today.toDateString())
  const placeList = useMemo(() => locations(events), [events])
  const pageCount = Math.max(1, Math.ceil(events.length / 10))
  const rows = events.slice((page - 1) * 10, page * 10)
  const exportEvents = () => {
    const header = ['Titre', 'Date', 'Lieu', 'Responsable', 'Statut']
    const values = events.map((event) => [event.titre, new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(event.date)), event.lieu, fullName(event), status(event.date, t)[1]])
    const text = [header, ...values].map((row) => row.map((value) => `"${String(value || '').replaceAll('"', '""')}"`).join(';')).join('\n')
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' })); link.download = 'evenements-sygmebec.csv'; link.click(); URL.revokeObjectURL(link.href)
  }
  return <div className="programme-page events-reference">
    <div className="programme-search"><FiSearch /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Rechercher un événement, un lieu…" /></div>
    <div className="programme-head"><div><span>Gestion des événements</span><h1>Événements de l'église</h1><p>Planifiez, suivez et publiez toutes les activités de l'assemblée.</p></div><div><button type="button" className="programme-button" onClick={exportEvents}><FiDownload />Exporter</button><Link to="/evenements/nouveau" className="programme-button primary"><FiPlus />Nouvel événement</Link></div></div>
    <div className="programme-result"><b><FiCheck />{counts} événement{counts > 1 ? 's' : ''}</b><i /> <small>{upcoming[0] ? `Prochain événement · ${new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(upcoming[0].date))}` : 'Aucun événement à venir'}</small></div>
    <section className="programme-stats">{[['blue', FiCalendar, counts, 'Total événements', counts ? `${counts} enregistré${counts > 1 ? 's' : ''}` : 'Aucun événement'], ['purple', FiClock, upcoming.length, 'À venir', upcoming[0] ? `Prochain · ${formatDate(upcoming[0].date)}` : 'Aucun événement programmé'], ['green', FiCheck, todayEvents.length, "Aujourd'hui", todayEvents.length ? 'Activité en cours' : 'Aucun événement prévu'], ['amber', FiCalendar, past.length, 'Passés', 'Archivés automatiquement']].map(([color, Icon, value, label, note]) => <article key={label} className={color}><i><Icon /></i><strong>{value}</strong><p>{label}</p><small>{note}</small></article>)}</section>
    <section className="programme-overview"><article className="programme-card"><CardHead title="Répartition par lieu" text="Les événements enregistrés selon leur emplacement" tag={`${placeList.length} lieu${placeList.length > 1 ? 'x' : ''}`} /><div className="programme-donut-area"><Donut total={counts} values={placeList.map(([, value]) => value)} /><div className="programme-legend">{placeList.length ? placeList.slice(0, 4).map(([name, value], index) => <p key={name}><i className={['amber', 'purple', 'blue', 'green'][index]} /><span>{name}</span><b>{value}</b></p>) : <p className="programme-empty">Aucun événement disponible.</p>}</div></div></article><article className="programme-card"><CardHead title="Activité récente" text="Les dernières activités ajoutées à votre calendrier" tag="7 derniers jours" /><div className="programme-feed">{events.slice(0, 4).map((event, index) => <div key={event.id}><i className={index % 3 === 1 ? 'blue' : index % 3 === 2 ? 'amber' : ''}><FiPlus /></i><p><b>{event.titre}</b> a été planifié pour {formatDate(event.date)}<small>{event.dateCreation ? formatDate(event.dateCreation) : 'Récemment ajouté'}</small></p></div>)}{!events.length && <p className="programme-empty">Les prochaines activités apparaîtront ici.</p>}</div></article></section>
    <section className="programme-table-card"><header><div><h2>Calendrier des événements</h2><p>Consultez, modifiez ou supprimez les événements de l'assemblée.</p></div><span>{counts} au total</span></header><div className="programme-scroll"><table><thead><tr><th>Événement</th><th>Date</th><th>Lieu</th><th>Responsable</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{isLoading ? <tr><td colSpan="6" className="programme-loading">Chargement des événements…</td></tr> : rows.length ? rows.map((event) => { const [tone, label] = status(event.date, t); return <tr key={event.id}><td><b>{event.titre}</b><small>{event.type_evenement?.nom || event.categorie || 'Événement'}</small></td><td>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(event.date))}</td><td><span className="inline-flex items-center gap-1"><FiMapPin />{event.lieu}</span></td><td>{fullName(event)}</td><td><span className={`event-status ${tone}`}>{label}</span></td><td><div className="event-actions"><Link to={`/evenements/${event.id}`}><FiEye />Voir</Link><Link to={`/evenements/${event.id}/modifier`}><FiEdit2 />Modifier</Link>{canDelete(role) && <button type="button" onClick={() => setDeleteTarget(event.id)}><FiTrash2 />Supprimer</button>}</div></td></tr> }) : <tr><td colSpan="6" className="programme-loading">Aucun événement ne correspond à cette recherche.</td></tr>}</tbody></table></div><footer><span>Affichage de {rows.length ? (page - 1) * 10 + 1 : 0} à {Math.min(page * 10, events.length)} sur {events.length} événements</span><div><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>‹</button><b>{page}</b><button disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>›</button></div></footer></section>
    <ConfirmDialog isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={() => { deleteEvenement(deleteTarget); setDeleteTarget(null) }} title="Mettre l’événement à la corbeille" message="L’événement ne sera pas perdu : seul un administrateur pourra le restaurer avec toutes ses informations." isLoading={isDeleting} />
  </div>
}
