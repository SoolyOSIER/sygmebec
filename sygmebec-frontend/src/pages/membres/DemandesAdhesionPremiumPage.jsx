import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  FiActivity, FiCalendar, FiCheck, FiCheckCircle, FiClock, FiEye, FiGlobe,
  FiMail, FiPhone, FiRefreshCw, FiSearch, FiUsers, FiX,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../api/axiosClient'
import Button from '../../components/ui/Button'
import './demandesAdhesionPremium.css'

const statusLabel = { EN_ATTENTE: 'À traiter', VALIDEE: 'Validée', REJETEE: 'Rejetée' }
const dateFormat = (value) => value ? new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const initials = (item) => `${item.prenom || ''} ${item.nom || ''}`.trim().split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase() || '—'
const errorText = (error) => error.response?.data?.error?.message || error.response?.data?.detail || error.response?.data?.message || 'Cette demande ne peut pas être traitée.'

function StatusPill({ status }) { return <span className={`registration-pill ${String(status || '').toLowerCase()}`}>{statusLabel[status] || status}</span> }

export default function DemandesAdhesionPremiumPage() {
  const queryClient = useQueryClient()
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('TOUTES')
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/demandes-adhesion/', { params: { page_size: 100 } })
      setDemandes(data.results || data || [])
    } catch {
      toast.error('Impossible de charger les inscriptions en ligne.')
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const stats = useMemo(() => ({
    pending: demandes.filter((item) => item.statut === 'EN_ATTENTE').length,
    validated: demandes.filter((item) => item.statut === 'VALIDEE').length,
    rejected: demandes.filter((item) => item.statut === 'REJETEE').length,
    total: demandes.length,
  }), [demandes])
  const visible = useMemo(() => demandes.filter((item) => {
    const matchesFilter = filter === 'TOUTES' || item.statut === filter
    const haystack = `${item.prenom || ''} ${item.nom || ''} ${item.email || ''} ${item.telephone || ''}`.toLowerCase()
    return matchesFilter && haystack.includes(search.trim().toLowerCase())
  }), [demandes, filter, search])
  const activity = useMemo(() => [...demandes].sort((a, b) => new Date(b.date_demande || 0) - new Date(a.date_demande || 0)).slice(0, 3), [demandes])
  const validationRate = stats.total ? Math.round((stats.validated / stats.total) * 100) : 0
  const monthCount = demandes.filter((item) => { const date = new Date(item.date_demande); const now = new Date(); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() }).length
  const donut = { valid: stats.total ? Math.round(stats.validated / stats.total * 100) : 0, pending: stats.total ? Math.round(stats.pending / stats.total * 100) : 0, rejected: stats.total ? Math.round(stats.rejected / stats.total * 100) : 0 }

  const process = async (demande, action) => {
    if (action === 'rejeter' && !window.confirm(`Rejeter la demande de ${demande.prenom} ${demande.nom} ?`)) return
    setProcessingId(demande.id)
    try {
      await api.post(`/demandes-adhesion/${demande.id}/${action}/`, action === 'rejeter' ? { motif_rejet: 'Demande rejetée depuis le tableau de bord.' } : {})
      if (action === 'valider') {
        queryClient.invalidateQueries({ queryKey: ['membres'] })
        queryClient.invalidateQueries({ queryKey: ['membres-statistiques'] })
      }
      toast.success(action === 'valider' ? 'Membre créé à partir de la demande.' : 'Demande rejetée.')
      setSelected(null)
      await load()
    } catch (error) { toast.error(errorText(error))
    } finally { setProcessingId(null) }
  }

  const filterItems = [['TOUTES', `Toutes (${stats.total})`], ['EN_ATTENTE', `À traiter (${stats.pending})`], ['VALIDEE', `Validées (${stats.validated})`], ['REJETEE', `Rejetées (${stats.rejected})`]]
  return <div className="registration-reference">
    <header className="registration-page-head"><div><span className="registration-eyebrow">Gestion des inscriptions</span><h1>Inscriptions en ligne</h1><p>Consultez, validez et suivez les demandes envoyées depuis le site vitrine.</p></div><div className="registration-head-actions"><label className="registration-search"><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une demande…" /></label><button type="button" className="registration-refresh" onClick={load} disabled={loading}><FiRefreshCw className={loading ? 'spin' : ''} />Actualiser</button></div></header>
    <div className="registration-results"><span><FiCheckCircle />{stats.total} demande{stats.total > 1 ? 's' : ''} reçue{stats.total > 1 ? 's' : ''}</span><i /> <small>Synchronisé automatiquement avec le site vitrine</small></div>

    <section className="registration-stats-grid"><Stat icon={FiClock} tone="amber" value={stats.pending} label="À traiter" note="En attente de décision" /><Stat icon={FiCheck} tone="green" value={stats.validated} label="Validées" note="Profils ajoutés au registre" /><Stat icon={FiX} tone="red" value={stats.rejected} label="Rejetées" note="Demandes non retenues" /><Stat icon={FiUsers} tone="blue" value={stats.total} label="Total des demandes" note="Depuis le site vitrine" /></section>

    <section className="registration-overview-grid"><article className="registration-panel"><PanelHead title="Répartition des demandes" text="Vue d’ensemble par statut de traitement" tag={`${stats.total} au total`} /><div className="registration-donut-body"><div className="registration-donut" style={{ background: stats.total ? `conic-gradient(#1fa060 0 ${donut.valid}%, #c17f18 ${donut.valid}% ${donut.valid + donut.pending}%, #c94f43 ${donut.valid + donut.pending}% 100%)` : '#f0ece0' }}><div><b>{stats.total}</b><small>DEMANDE{stats.total > 1 ? 'S' : ''}</small></div></div><div className="registration-legend"><Legend color="green" label="Validées" value={stats.validated} /><Legend color="amber" label="À traiter" value={stats.pending} /><Legend color="red" label="Rejetées" value={stats.rejected} /></div></div></article><article className="registration-panel"><PanelHead title="Activité récente" text="Derniers mouvements sur les demandes" tag="En direct" /><div className="registration-feed">{activity.length ? activity.map((item) => <div className={`registration-feed-item ${item.statut === 'VALIDEE' ? 'green' : item.statut === 'REJETEE' ? 'red' : 'blue'}`} key={item.id}><span>{item.statut === 'VALIDEE' ? <FiCheck /> : item.statut === 'REJETEE' ? <FiX /> : <FiUsers />}</span><p><b>{item.prenom} {item.nom}</b> — {item.statut === 'VALIDEE' ? 'demande validée et profil créé' : item.statut === 'REJETEE' ? 'demande rejetée' : 'nouvelle demande à examiner'}<small>{dateFormat(item.date_demande)}</small></p></div>) : <p className="registration-empty">Les nouvelles demandes apparaîtront ici automatiquement.</p>}</div></article></section>

    <section className="registration-kpi-grid"><Kpi value={stats.pending ? 'À suivre' : '—'} label="Délai de traitement" tone="green" /><Kpi value={monthCount} label="Ce mois-ci" tone="blue" /><Kpi value={`${validationRate}%`} label="Taux de validation" tone="purple" /><Kpi value={stats.total} label="Source : site vitrine" tone="amber" /></section>

    <section className="registration-panel registration-sources"><PanelHead title="Sources d’inscription" text="Origine des demandes reçues en ligne" tag="4 canaux" /><div className="registration-source-grid"><Source icon={FiGlobe} label="Site vitrine" value={`${stats.total} demande${stats.total > 1 ? 's' : ''}`} tone="green" /><Source icon={FiMail} label="Réseaux sociaux" value="0 demande" tone="blue" /><Source icon={FiUsers} label="Recommandation" value="0 demande" tone="purple" /><Source icon={FiCalendar} label="Événement" value="0 demande" tone="amber" /></div></section>

    <section className="registration-list-section"><header><div><h2>Demandes reçues</h2><p>Examinez les informations avant de valider ou de rejeter une inscription.</p></div></header><nav>{filterItems.map(([id, label]) => <button type="button" key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}</nav><div className="registration-table-wrap"><table><thead><tr><th>Membre</th><th>Coordonnées</th><th>Envoyée le</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="5" className="registration-empty">Chargement des demandes…</td></tr> : visible.length ? visible.map((item) => <tr key={item.id}><td><div className="registration-person"><span>{initials(item)}</span><div><b>{item.prenom} {item.nom}</b><small>{item.eglise_origine || 'Église non renseignée'}</small></div></div></td><td><div className="registration-contact"><span><FiMail />{item.email || 'E-mail non renseigné'}</span><span><FiPhone />{item.telephone || 'Téléphone non renseigné'}</span></div></td><td><div className="registration-date"><b>{dateFormat(item.date_demande).split(' à ')[0]}</b><small>{dateFormat(item.date_demande).split(' à ')[1] || ''}</small></div></td><td><StatusPill status={item.statut} /></td><td><div className="registration-actions"><button type="button" className="view" onClick={() => setSelected(item)}><FiEye />Détails</button>{item.statut === 'EN_ATTENTE' && <><button type="button" className="accept" disabled={processingId === item.id} onClick={() => process(item, 'valider')}><FiCheck />Valider</button><button type="button" className="reject" disabled={processingId === item.id} onClick={() => process(item, 'rejeter')}><FiX />Rejeter</button></>}</div></td></tr>) : <tr><td colSpan="5" className="registration-empty">Aucune demande ne correspond à ce filtre.</td></tr>}</tbody></table></div><footer><span>Affichage de {visible.length} demande{visible.length > 1 ? 's' : ''} sur {stats.total}</span><span><FiActivity /> Mise à jour automatique</span></footer></section>

    {selected && <DetailModal demande={selected} processing={processingId === selected.id} onClose={() => setSelected(null)} onProcess={process} />}
  </div>
}

function Stat({ icon: Icon, tone, value, label, note }) { return <article className={tone}><i><Icon /></i><strong>{value}</strong><p>{label}</p><small>{note}</small></article> }
function PanelHead({ title, text, tag }) { return <header className="registration-panel-head"><div><h3>{title}</h3><p>{text}</p></div><span>{tag}</span></header> }
function Legend({ color, label, value }) { return <p><i className={color} /><span>{label}</span><b>{value}</b></p> }
function Kpi({ value, label, tone }) { return <article><i className={tone}>{value}</i><div><b>{label}</b><small>Suivi des inscriptions</small></div></article> }
function Source({ icon: Icon, label, value, tone }) { return <article className={tone}><i><Icon /></i><b>{label}</b><small>{value}</small></article> }

function DetailModal({ demande, processing, onClose, onProcess }) {
  const fields = [['E-mail', demande.email], ['Téléphone', demande.telephone], ['Téléphone secondaire', demande.telephone_secondaire], ['Adresse', demande.adresse], ["Église d'origine", demande.eglise_origine], ['Date de naissance', demande.date_naissance], ['Date de présentation', demande.date_presentation], ['Date de conversion', demande.date_conversion], ["Date d'affiliation", demande.date_affiliation], ['Date de baptême', demande.date_bapteme], ['État matrimonial', demande.etat_matrimonial], ["Ancienneté à l'EBEC", demande.anciennete_ebec]]
  return <div className="registration-modal" role="dialog" aria-modal="true" onClick={onClose}><article onClick={(event) => event.stopPropagation()}><header><div><span>Demande d’adhésion</span><h2>{demande.prenom} {demande.nom}</h2><p>Informations transmises depuis le site vitrine</p></div><button type="button" onClick={onClose}><FiX /></button></header><div className="registration-modal-grid">{fields.map(([label, value]) => <div key={label}><small>{label}</small><b>{value || '—'}</b></div>)}</div>{demande.message && <div className="registration-message"><small>Message</small><p>{demande.message}</p></div>}{demande.statut === 'EN_ATTENTE' && <footer><button type="button" className="reject" disabled={processing} onClick={() => onProcess(demande, 'rejeter')}><FiX />Rejeter</button><button type="button" className="accept" disabled={processing} onClick={() => onProcess(demande, 'valider')}><FiCheck />Valider et créer le membre</button></footer>}</article></div>
}
