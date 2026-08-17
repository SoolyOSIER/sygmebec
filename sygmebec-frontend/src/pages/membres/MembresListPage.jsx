import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiActivity, FiCheck, FiDownload, FiEdit2, FiEye, FiMail, FiPhone, FiPlus, FiSearch, FiStar, FiTrash2, FiUserCheck, FiUsers, FiUserX } from 'react-icons/fi'
import { useDeleteMembre, useFonctions, useMembreStatistiques, useMembres, useStatuts } from '../../hooks/useMembres'
import { useAuthStore } from '../../store/authStore'
import { useFiltersStore } from '../../store/filtersStore'
import { canDelete } from '../../utils/roleHierarchy'
import { formatDate } from '../../utils/formatDate'
import Avatar from '../../components/ui/Avatar'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import './membresReference.css'

const normalize = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const list = (value) => value?.results || value || []
const initials = (member) => `${member.prenom || ''} ${member.nom || ''}`.trim().split(' ').filter(Boolean).map((word) => word[0]).join('').slice(0, 2).toUpperCase() || '?'
const statusKind = (value) => { const status = normalize(value); if (status.includes('inactif')) return 'inactive'; if (status.includes('nouveau')) return 'new'; if (status.includes('transf') || status.includes('deced')) return 'departed'; if (status.includes('actif')) return 'active'; return 'other' }
const relativeDate = (value) => { if (!value) return 'Date non renseignée'; const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000)); return days === 0 ? "Aujourd’hui" : days === 1 ? 'Il y a 1 jour' : `Il y a ${days} jours` }

export default function MembresListPage() {
  const { role } = useAuthStore()
  const { search, statutFiltre, setSearch, setStatutFiltre, resetFilters } = useFiltersStore()
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { data, isLoading } = useMembres({ search: search || undefined, 'statut__libelle': statutFiltre || undefined, page, page_size: 10 })
  const { data: statistics } = useMembreStatistiques()
  const { data: statuts } = useStatuts()
  const { data: fonctions } = useFonctions()
  const { mutate: deleteMembre, isPending: isDeleting } = useDeleteMembre()
  const membres = list(data)
  const total = statistics?.total ?? data?.count ?? 0
  const statuses = list(statuts)
  const functions = list(fonctions)
  const totalPages = Math.max(1, Math.ceil((data?.count || 0) / 10))
  const statusCount = (kind) => Object.entries(statistics?.by_status || {}).reduce((sum, [label, value]) => sum + (statusKind(label) === kind ? value : 0), 0)
  const activeCount = statusCount('active')
  const inactiveCount = statusCount('inactive')
  const newCount = statusCount('new')
  const departedCount = statusCount('departed')
  const activeRate = total ? Math.round((activeCount / total) * 100) : 0
  const incomplete = membres.filter((member) => !member.telephone || !member.email).length
  const recentMembers = useMemo(() => [...membres].sort((a, b) => new Date(b.created_at || b.date_adhesion || 0) - new Date(a.created_at || a.date_adhesion || 0)).slice(0, 4), [membres])
  const groups = useMemo(() => functions.slice(0, 4).map((fonction, index) => ({ name: fonction.nomFonction || fonction.nom || 'Ministère', count: membres.filter((member) => (member.fonctions || []).some((item) => String(typeof item === 'object' ? item.id : item) === String(fonction.id))).length, tone: ['green', 'blue', 'purple', 'amber'][index] })) || [], [functions, membres])
  const groupCards = groups.length ? groups : ['Louange', 'Accueil', 'Jeunesse', 'Intercession'].map((name, index) => ({ name, count: 0, tone: ['green', 'blue', 'purple', 'amber'][index] }))
  const getFilterValue = (kind) => statuses.find((status) => statusKind(status.libelle) === kind)?.libelle || ''
  const chipItems = [['all', `Tous (${total})`], ['active', `Actifs (${activeCount})`], ['new', `Nouveaux convertis (${newCount})`], ['inactive', `Inactifs (${inactiveCount})`]]
  const currentChip = !statutFiltre ? 'all' : statusKind(statutFiltre)

  const exportMembers = () => {
    const header = ['Membre', 'Téléphone', 'E-mail', 'Statut', 'Adhésion']
    const rows = membres.map((member) => [`${member.prenom || ''} ${member.nom || ''}`.trim(), member.telephone || '', member.email || '', member.statut?.libelle || '', formatDate(member.date_adhesion)])
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }))
    link.download = 'membres-sygmebec.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }
  const changeChip = (kind) => { setStatutFiltre(kind === 'all' ? '' : getFilterValue(kind)); setPage(1) }

  return <div className="members-reference">
    <header className="members-top-search"><div className="members-search"><FiSearch /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Rechercher un membre, un numéro, un e-mail…" /></div></header>
    <div className="members-content">
      <div className="members-page-head"><div><span className="members-eyebrow">Gestion des membres</span><h1>Membres de l’assemblée</h1><p>Consultez, filtrez et gérez la fiche de chaque membre enregistré.</p></div><div className="members-head-actions"><button type="button" className="members-button" onClick={exportMembers}><FiDownload />Exporter</button><Link to="/membres/nouveau" className="members-button members-primary"><FiPlus />Ajouter un membre</Link></div></div>
      <div className="members-results"><span><FiCheck />{data?.count ?? 0} résultat{(data?.count ?? 0) > 1 ? 's' : ''}</span><i /> <small>{search || statutFiltre ? 'Filtres appliqués' : 'Registre des membres à jour'}</small>{(search || statutFiltre) && <button type="button" onClick={() => { resetFilters(); setPage(1) }}>Réinitialiser</button>}</div>
      <section className="members-stats">{[
        ['Membres enregistrés', total, FiUsers, 'green', '+ nouveaux inscrits'], ['Membres actifs', activeCount, FiUserCheck, 'blue', `${activeRate} % de l’effectif total`], ['Membres inactifs', inactiveCount, FiUserX, 'amber', inactiveCount ? 'À accompagner' : 'Aucun changement'], ['Transférés ou décédés', departedCount, FiActivity, 'purple', departedCount ? 'Historique du registre' : 'Aucun changement'],
      ].map(([label, value, Icon, tone, note]) => <article key={label} className={`members-stat ${tone}`}><span><Icon /></span><strong>{value}</strong><p>{label}</p><small>{note}</small></article>)}</section>
      <section className="members-overview">
        <article className="members-panel members-status-panel"><header><div><h3>Répartition des membres</h3><p>Vue d’ensemble par statut d’engagement</p></div><span>{total} au total</span></header><div className="members-donut-body"><div className="members-donut" style={{ background: `conic-gradient(#1fa060 0 ${activeRate}%, #7c50d1 ${activeRate}% ${activeRate + (total ? Math.round((newCount / total) * 100) : 0)}%, #eae5d8 0)` }}><div><b>{total}</b><small>MEMBRES</small></div></div><div className="members-legend">{[['Actifs', activeCount, 'green'], ['Nouveaux convertis', newCount, 'purple'], ['Inactifs', inactiveCount, 'gray'], ['Transférés / décédés', departedCount, 'gray']].map(([label, value, tone]) => <p key={label}><i className={tone} /><span>{label}</span><b>{value}</b></p>)}</div></div></article>
        <article className="members-panel"><header><div><h3>Activité récente</h3><p>Derniers mouvements dans le registre des membres</p></div><span>7 derniers jours</span></header><div className="members-feed">{recentMembers.length ? recentMembers.map((member, index) => <div key={member.id}><i className={['green', 'purple', 'blue', 'amber'][index]}>{index === 0 ? <FiPlus /> : index === 1 ? <FiStar /> : <FiEdit2 />}</i><p><b>{`${member.prenom || ''} ${member.nom || ''}`.trim() || 'Membre'}</b> {index === 0 ? `a été ajouté au registre — Membre #${member.id}` : 'a mis à jour sa fiche membre'}<small>{relativeDate(member.created_at || member.date_adhesion)}</small></p></div>) : <p className="members-empty">Aucune activité récente.</p>}</div></article>
      </section>
      <section className="members-kpis"><Kpi value={`${activeRate}%`} label="Taux de rétention" sub="Selon les statuts actifs" tone="green" /><Kpi value={total ? `${Math.max(1, Math.round(total / Math.max(1, groupCards.filter((group) => group.count).length || 1)))} membres` : '—'} label="Moyenne par groupe" sub="Ministères et cellules" tone="blue" /><Kpi value={incomplete} label="Fiches incomplètes" sub="À compléter cette semaine" tone="amber" /><Kpi value={groupCards.filter((group) => group.count).length} label="Groupes actifs" sub="Ministères et cellules" tone="purple" /></section>
      <section className="members-panel members-groups"><header><div><h3>Répartition par groupe</h3><p>Implication des membres dans les ministères de l’assemblée</p></div><span>{groupCards.length} groupes</span></header><div>{groupCards.map((group, index) => <article key={`${group.name}-${index}`} className={group.tone}><i>{index === 0 ? <FiActivity /> : index === 1 ? <FiUsers /> : index === 2 ? <FiUserCheck /> : <FiStar />}</i><b>{group.name}</b><small>{group.count} membre{group.count > 1 ? 's' : ''}</small></article>)}</div></section>
      <section className="members-list"><header><div><h2>Liste des membres enregistrés</h2><p>Cliquez sur « Voir » pour ouvrir la carte complète du membre.</p></div></header><nav>{chipItems.map(([kind, label]) => <button type="button" key={kind} onClick={() => changeChip(kind)} className={currentChip === kind ? 'active' : ''}>{label}</button>)}</nav><div className="members-table-wrap"><table><thead><tr><th>Membre</th><th>Contact</th><th>Statut</th><th>Fonction</th><th>Engagement</th><th>Adhésion</th><th>Actions</th></tr></thead><tbody>{isLoading ? <tr><td colSpan="7" className="members-loading">Chargement des membres…</td></tr> : membres.length ? membres.map((member) => { const status = member.statut?.libelle || 'Sans statut'; const kind = statusKind(status); const engagement = kind === 'active' ? 82 : kind === 'new' ? 45 : kind === 'inactive' ? 25 : 60; const functionsOfMember = member.fonctions || []; return <tr key={member.id}><td><div className="members-member"><Avatar name={`${member.prenom || ''} ${member.nom || ''}`} src={member.photo} size="md" fallback={initials(member)} /><div><b>{`${member.nom || ''} ${member.prenom || ''}`.trim() || 'Membre sans nom'}</b><small>Membre #{member.id}</small></div></div></td><td><div className="members-contact">{member.telephone ? <span><FiPhone />{member.telephone}</span> : <em>Téléphone non renseigné</em>}{member.email && <span><FiMail />{member.email}</span>}</div></td><td><span className={`members-status ${kind}`}>{status}</span></td><td><div className="members-functions">{functionsOfMember.length ? functionsOfMember.slice(0, 2).map((fonction) => <span key={typeof fonction === 'object' ? fonction.id : fonction}>{typeof fonction === 'object' ? fonction.nomFonction : fonction}</span>) : '—'}</div></td><td><div className="members-engagement"><i><b style={{ width: `${engagement}%` }} /></i><span>{engagement}%</span></div></td><td><div className="members-date"><b>{formatDate(member.date_adhesion)}</b><small>{relativeDate(member.date_adhesion)}</small></div></td><td><div className="members-actions"><Link to={`/membres/${member.id}`}><FiEye />Voir</Link><Link to={`/membres/${member.id}/modifier`}><FiEdit2 />Modifier</Link>{canDelete(role) && <button type="button" onClick={() => setDeleteTarget(member.id)}><FiTrash2 />Supprimer</button>}</div></td></tr> }) : <tr><td colSpan="7" className="members-loading">Aucun membre ne correspond à votre recherche.</td></tr>}</tbody></table></div><footer><span>Affichage de {membres.length ? ((page - 1) * 10) + 1 : 0} à {Math.min(page * 10, data?.count || 0)} sur {data?.count || 0} membres</span><div><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>‹</button><b>{page}</b><button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>›</button></div></footer></section>
    </div>
    <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) { deleteMembre(deleteTarget); setDeleteTarget(null) } }} title="Supprimer le membre" message="Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible." isLoading={isDeleting} />
  </div>
}

function Kpi({ value, label, sub, tone }) { return <article className="members-kpi"><i className={tone}>{value}</i><div><b>{label}</b><small>{sub}</small></div></article> }
