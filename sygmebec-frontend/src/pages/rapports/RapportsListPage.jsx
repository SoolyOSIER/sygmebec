import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiAlertTriangle, FiCheck, FiClock, FiDownload, FiFileText, FiFilter, FiPlus, FiSearch, FiUsers } from 'react-icons/fi'
import { useDownloadRapport, useRapports } from '../../hooks/useRapports'
import { formatDate } from '../../utils/formatDate'
import '../programmeReference.css'

const list = (value) => value?.results || value || []
const tone = ['green', 'blue', 'purple', 'amber']
const typeName = (report) => report.type_rapport || report.type || 'Rapport des membres'

export default function RapportsListPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useRapports({ page, page_size: 100 })
  const { mutate: download, isPending: isDownloading } = useDownloadRapport()
  const reports = list(data)
  const filtered = reports.filter((report) => `${report.titre || ''} ${typeName(report)} ${report.genere_par?.nom || report.genere_par?.identifiant || ''}`.toLowerCase().includes(search.toLowerCase()))
  const available = reports.filter((report) => report.fichier).length
  const pending = reports.filter((report) => !report.fichier && !String(report.statut || '').toLowerCase().includes('echec')).length
  const failed = reports.filter((report) => String(report.statut || '').toLowerCase().includes('echec')).length
  const types = useMemo(() => Object.entries(reports.reduce((all, report) => { const name = typeName(report); all[name] = (all[name] || 0) + 1; return all }, {})), [reports])
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10))
  const rows = filtered.slice((page - 1) * 10, page * 10)
  const models = [['Rapport des membres', 'Registre, statuts et coordonnées', FiUsers], ['Rapport financier', 'Synthèse des entrées et sorties', FiFileText], ['Rapport statistique', 'Indicateurs et évolution du programme', FiFilter], ['Rapport d’événements', 'Participation et activités prévues', FiClock]]

  return <div className="programme-page reports-page">
    <div className="programme-search"><FiSearch /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Rechercher un rapport, un auteur, un critère…" /></div>
    <div className="programme-head"><div><span>Gestion des rapports</span><h1>Rapports de l’assemblée</h1><p>Générez, suivez et exportez les rapports issus des données de votre espace.</p></div><div><button type="button" className="programme-button"><FiFilter />Filtrer</button><Link to="/rapports/generer" className="programme-button primary"><FiPlus />Générer un rapport</Link></div></div>
    <div className="programme-result"><b><FiCheck />{filtered.length} rapport{filtered.length > 1 ? 's' : ''}</b><i /> <small>{reports[0]?.dateGeneration ? `Dernière génération · ${formatDate(reports[0].dateGeneration)}` : 'Aucun rapport généré pour le moment'}</small></div>
    <section className="programme-stats">{[['Total rapports', reports.length, FiFileText, 'blue', '+ rapports générés'], ['Disponibles', available, FiDownload, 'green', 'Prêts à être téléchargés'], ['En cours', pending, FiClock, 'amber', pending ? 'Génération active' : 'Aucune génération active'], ['Échoués', failed, FiAlertTriangle, 'purple', failed ? 'À relancer manuellement' : 'Aucun échec']].map(([label, value, Icon, color, note]) => <article key={label} className={color}><i><Icon /></i><strong>{value}</strong><p>{label}</p><small>{note}</small></article>)}</section>
    <section className="programme-overview"><article className="programme-card"><CardHead title="Répartition par type" text="Rapports générés selon leur catégorie" tag={`${reports.length} au total`} /><div className="programme-donut-area"><Donut total={reports.length} values={types.map(([, value]) => value)} /><div className="programme-legend">{types.length ? types.slice(0, 4).map(([name, value], index) => <p key={name}><i className={tone[index]} /><span>{name}</span><b>{value}</b></p>) : <p className="programme-empty">Aucun rapport disponible.</p>}</div></div></article><article className="programme-card"><CardHead title="Activité de génération" text="Derniers événements liés à vos rapports" tag="7 derniers jours" /><div className="programme-feed">{reports.slice(0, 4).map((report, index) => <div key={report.id}><i className={report.fichier ? (index % 2 ? 'blue' : 'green') : 'amber'}>{report.fichier ? <FiCheck /> : <FiClock />}</i><p><b>{report.titre || typeName(report)}</b> {report.fichier ? `généré avec succès${report.genere_par?.nom ? ` par ${report.genere_par.nom}` : ''}` : 'en cours de génération'}<small>{formatDate(report.dateGeneration)}</small></p></div>)}{!reports.length && <p className="programme-empty">Les prochaines générations apparaîtront ici.</p>}</div></article></section>
    <section className="programme-kpis"><Mini value="—" title="Temps moyen" text="Génération par rapport" color="green" /><Mini value={reports.filter((report) => new Date(report.dateGeneration).getMonth() === new Date().getMonth()).length} title="Rapports ce mois" text="Toutes catégories confondues" color="blue" /><Mini value={reports.length ? `${Math.round((available / reports.length) * 100)}%` : '—'} title="Taux de réussite" text="Rapports disponibles" color="purple" /><Mini value="3" title="Formats exportés" text="PDF · Excel · CSV" color="amber" /></section>
    <section className="programme-card programme-models"><CardHead title="Modèles disponibles" text="Lancez rapidement un rapport à partir d’un modèle existant" tag="4 modèles" /><div>{models.map(([name, description, Icon], index) => <Link to="/rapports/generer" key={name} className={tone[index]}><i><Icon /></i><b>{name}</b><small>{description}</small></Link>)}</div></section>
    <section className="programme-table-card"><header><div><h2>Rapports générés</h2><p>Consultez, téléchargez et suivez l’état de chaque rapport.</p></div></header><div className="programme-scroll"><table><thead><tr><th>Titre</th><th>Généré par</th><th>Critères</th><th>Format</th><th>Date de génération</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{isLoading ? <tr><td colSpan="7" className="programme-loading">Chargement des rapports…</td></tr> : rows.length ? rows.map((report) => <tr key={report.id}><td><b>{report.titre || typeName(report)}</b><small>{typeName(report)}</small></td><td>{report.genere_par?.nom || report.genere_par?.identifiant || '—'}</td><td>{report.critere?.statut || report.critere?.periode || 'Tous les membres'}</td><td>PDF</td><td>{formatDate(report.dateGeneration)}</td><td><span className={`programme-status ${report.fichier ? 'ready' : 'pending'}`}>{report.fichier ? 'Disponible' : 'En cours'}</span></td><td>{report.fichier && <button type="button" onClick={() => download(report.id)} disabled={isDownloading}><FiDownload />Télécharger</button>}</td></tr>) : <tr><td colSpan="7" className="programme-loading">Aucun rapport ne correspond à cette recherche.</td></tr>}</tbody></table></div><footer><span>Affichage de {rows.length ? (page - 1) * 10 + 1 : 0} à {Math.min(page * 10, filtered.length)} sur {filtered.length} rapports</span><div><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>‹</button><b>{page}</b><button disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>›</button></div></footer></section>
  </div>
}

function CardHead({ title, text, tag }) { return <header className="programme-card-head"><div><h3>{title}</h3><p>{text}</p></div><span>{tag}</span></header> }
function Mini({ value, title, text, color }) { return <article className="programme-mini"><i className={color}>{value}</i><div><b>{title}</b><small>{text}</small></div></article> }
function Donut({ total, values }) { const colors = ['#1fa060', '#3768d6', '#7c50d1', '#c17f18']; let cursor = 0; const stops = values.map((value, index) => { const start = cursor; cursor += total ? (value / total) * 100 : 0; return `${colors[index % colors.length]} ${start}% ${cursor}%` }).join(', '); return <div className="programme-donut" style={{ background: stops ? `conic-gradient(${stops})` : '#f0ece0' }}><div><b>{total}</b><small>RAPPORTS</small></div></div> }
