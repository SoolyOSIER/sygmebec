import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axiosClient'
import { apiError, downloadFile } from '../../api/settingsApi'
import ConfirmAction from '../../components/ui/ConfirmAction'
import '../systemConsole.css'

const initialFilters = { search: '', module: '', action: '', severity: '', status: '', actor: '', date_debut: '', date_fin: '', archived: 'false', page: 1, page_size: 25 }
const labels = {
  SUCCESS: '✓ Réussi', FAILURE: '✕ Échoué', DENIED: '⛔ Refusé', PENDING: '◷ En cours',
  INFO: 'Information', WARNING: 'Attention', SECURITY: 'Sécurité', CRITICAL: 'Critique',
}

const formatDate = (value) => value ? new Date(value).toLocaleString('fr-FR') : '—'
const fieldsValue = (value) => JSON.stringify(value ?? '—', null, 2)

function targetLink(entry) {
  if (entry.content_type === 'Membre' && entry.object_id) return <Link to={`/membres/${entry.object_id}`}>{entry.object_repr || `Membre #${entry.object_id}`}</Link>
  if (entry.content_type === 'Evenement' && entry.object_id) return <Link to={`/evenements/${entry.object_id}`}>{entry.object_repr || `Événement #${entry.object_id}`}</Link>
  return entry.object_repr || '—'
}

function DetailPanel({ id, onClose }) {
  const dialog = useRef(null)
  const query = useQuery({ queryKey: ['audit-detail', id], queryFn: () => api.get(`audit-logs/${id}/`).then((response) => response.data) })
  useEffect(() => { dialog.current?.showModal() }, [])

  return <dialog ref={dialog} className="system-dialog system-console" onCancel={onClose} aria-labelledby="audit-detail-title">
    <header><h2 id="audit-detail-title">Détail de l’activité</h2><button type="button" onClick={onClose}>Fermer</button></header>
    {query.isLoading && <p>Chargement…</p>}
    {query.error && <p role="alert">{apiError(query.error)}</p>}
    {query.data && <>
      <h3>{query.data.action_label || query.data.action}</h3><p>{query.data.summary}</p>
      <dl className="audit-detail-list"><dt>Date</dt><dd>{formatDate(query.data.timestamp)}</dd><dt>Utilisateur / rôle</dt><dd>{query.data.actor_identifier || 'Système'} · {query.data.actor_role || '—'}</dd><dt>Cible</dt><dd>{targetLink(query.data)}</dd><dt>Résultat</dt><dd>{labels[query.data.status] || query.data.status}</dd><dt>Gravité</dt><dd>{labels[query.data.severity] || query.data.severity}</dd><dt>Adresse IP</dt><dd>{query.data.ip_address || 'Non collectée'}</dd><dt>Navigateur</dt><dd>{query.data.user_agent || 'Non collecté'}</dd><dt>Référence de requête</dt><dd>{query.data.request_id || '—'}</dd></dl>
      <h3>Champs modifiés</h3>
      {query.data.changed_fields?.length ? <div className="system-table-wrap"><table><thead><tr><th>Champ</th><th>Avant</th><th>Après</th></tr></thead><tbody>{query.data.changed_fields.map((key) => <tr key={key}><td>{key}</td><td><pre>{fieldsValue(query.data.before_data?.[key])}</pre></td><td><pre>{fieldsValue(query.data.after_data?.[key])}</pre></td></tr>)}</tbody></table></div> : <p>Aucun changement de champ enregistré pour cette action.</p>}
    </>}
  </dialog>
}

export default function AuditLogsPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [search, setSearch] = useState('')
  const [detailId, setDetailId] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setFilters((current) => ({ ...current, search, page: 1 })), 300)
    return () => clearTimeout(timer)
  }, [search])

  const activity = useQuery({ queryKey: ['audit-logs', filters], queryFn: () => api.get('audit-logs/', { params: filters }).then((response) => response.data), keepPreviousData: true })
  const statistics = useQuery({ queryKey: ['audit-statistics', filters], queryFn: () => api.get('audit-logs/statistics/', { params: filters }).then((response) => response.data) })
  const refresh = () => { activity.refetch(); statistics.refetch() }
  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: 1 }))

  const choosePeriod = (days) => {
    const finish = new Date()
    const start = new Date()
    start.setDate(finish.getDate() - days + 1)
    const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    setFilters((current) => ({ ...current, date_debut: localDate(start), date_fin: localDate(finish), page: 1 }))
  }

  const options = [
    ['module', 'Module', ['AUTH', 'USERS', 'MEMBERS', 'REGISTRATION', 'EVENTS', 'GALLERY', 'REPORTS', 'LETTERS', 'SETTINGS', 'SYSTEM']],
    ['severity', 'Gravité', ['INFO', 'WARNING', 'SECURITY', 'CRITICAL']],
    ['status', 'Résultat', ['SUCCESS', 'FAILURE', 'DENIED', 'PENDING']],
    ['action', 'Action', statistics.data?.actions || []],
  ]

  return <div className="system-console">
    <header><div><small>ADMINISTRATION · TRAÇABILITÉ</small><h1>Journal d’activité</h1><p>Historique sécurisé des actions du système.</p></div><div><button onClick={refresh}>Actualiser</button> <button onClick={() => setConfirmation({ type: 'export' })}>Exporter CSV</button> <button onClick={() => setConfirmation({ type: 'archive' })}>Archiver</button></div></header>
    {message && <p className="system-status" role="status">{message}</p>}
    <div className="system-metrics"><article><small>Événements filtrés</small><strong>{statistics.data?.total ?? '—'}</strong></article><article><small>Connexions échouées</small><strong>{statistics.data?.failed_logins ?? '—'}</strong></article><article><small>Alertes de sécurité</small><strong>{statistics.data?.security ?? '—'}</strong></article></div>
    <section className="system-card"><div className="audit-periods"><button onClick={() => choosePeriod(1)}>Aujourd’hui</button> <button onClick={() => choosePeriod(7)}>7 jours</button> <button onClick={() => choosePeriod(30)}>30 jours</button></div><div className="system-filters"><label>Recherche<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Utilisateur, action, cible…" /></label><label>Du<input type="date" value={filters.date_debut} onChange={(event) => setFilter('date_debut', event.target.value)} /></label><label>Au<input type="date" value={filters.date_fin} onChange={(event) => setFilter('date_fin', event.target.value)} /></label>{options.map(([key, label, values]) => <label key={key}>{label}<select value={filters[key]} onChange={(event) => setFilter(key, event.target.value)}><option value="">Tous</option>{values.map((value) => <option key={value} value={value}>{labels[value] || value}</option>)}</select></label>)}<label>Utilisateur<select value={filters.actor} onChange={(event) => setFilter('actor', event.target.value)}><option value="">Tous</option>{statistics.data?.actors?.map((actor) => <option key={actor.actor_id} value={actor.actor_id}>{actor.actor_identifier}</option>)}</select></label><label>Conservation<select value={filters.archived} onChange={(event) => setFilter('archived', event.target.value)}><option value="false">Journaux actifs</option><option value="true">Archives</option><option value="all">Tous les journaux</option></select></label></div><button onClick={() => { setFilters(initialFilters); setSearch('') }}>Réinitialiser les filtres</button></section>
    <section className="system-card">{activity.isLoading ? <div aria-busy="true">{[1, 2, 3, 4].map((item) => <div key={item} className="system-skeleton" />)}</div> : activity.error ? <div role="alert"><p>{activity.error.response?.status === 403 ? 'Accès réservé à l’administrateur principal.' : apiError(activity.error)}</p><button onClick={refresh}>Réessayer</button></div> : <><div className="system-table-wrap"><table><thead><tr>{['Date et heure', 'Utilisateur', 'Action', 'Module', 'Cible', 'Résultat', 'Gravité', 'Détail'].map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{activity.data?.results?.map((entry) => <tr key={entry.id}><td>{formatDate(entry.timestamp)}</td><td>{entry.actor_identifier || entry.actor?.identifiant || 'Système'}</td><td>{entry.action_label || entry.action}</td><td>{entry.module}</td><td>{targetLink(entry)}</td><td><span className="system-pill">{labels[entry.status] || entry.status}</span></td><td><span className={`system-pill ${entry.severity}`}>{labels[entry.severity] || entry.severity}</span></td><td><button aria-label={`Voir le détail de l’activité ${entry.id}`} onClick={() => setDetailId(entry.id)}>Voir</button></td></tr>)}</tbody></table></div>{!activity.data?.results?.length && <p className="system-empty">Aucune activité pour les filtres choisis.</p>}<footer><label>Lignes<select value={filters.page_size} onChange={(event) => setFilter('page_size', Number(event.target.value))}>{[10, 25, 50, 100].map((count) => <option key={count}>{count}</option>)}</select></label><button disabled={!activity.data?.previous || activity.isFetching} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}>Précédent</button><span>Page {activity.data?.current_page || 1} / {activity.data?.total_pages || 1}</span><button disabled={!activity.data?.next || activity.isFetching} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>Suivant</button></footer></>}</section>
    {detailId && <DetailPanel id={detailId} onClose={() => setDetailId(null)} />}
    {confirmation?.type === 'export' && <ConfirmAction title="Exporter le journal filtré" description="Le fichier CSV contiendra uniquement les résultats filtrés. L’export sera enregistré dans le journal." word="EXPORTER" onClose={() => setConfirmation(null)} onConfirm={async () => { try { await downloadFile('audit-logs/export/', 'audit-sygmebec.csv', filters); setMessage('Export généré.'); refresh() } catch (error) { throw new Error(apiError(error)) } }} />}
    {confirmation?.type === 'archive' && <ConfirmAction title="Archiver les anciennes activités" description="Les journaux antérieurs à la durée de conservation seront classés dans les archives. Aucune entrée ne sera supprimée." word="ARCHIVER" onClose={() => setConfirmation(null)} onConfirm={async (data) => { try { const response = await api.post('audit-logs/archive/', data); setMessage(`${response.data.count} événement(s) archivé(s).`); refresh() } catch (error) { throw new Error(apiError(error)) } }} />}
  </div>
}
