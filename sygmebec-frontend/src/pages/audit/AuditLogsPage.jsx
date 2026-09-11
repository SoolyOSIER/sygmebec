import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axiosClient'
import { apiError, downloadFile } from '../../api/settingsApi'
import ConfirmAction from '../../components/ui/ConfirmAction'
import '../systemConsole.css'

const initial = { search:'', module:'', action:'', severity:'', status:'', actor:'', date_debut:'', date_fin:'', archived:'false', page:1, page_size:25 }
const labels = {SUCCESS:'? R?ussi',FAILURE:'? ?chou?',DENIED:'? Refus?',PENDING:'? En cours',INFO:'Information',WARNING:'Attention',SECURITY:'S?curit?',CRITICAL:'Critique'}
const date = value => value ? new Date(value).toLocaleString('fr-FR') : '?'
function Detail({ id, onClose }) {
  const ref=useRef(null)
  const {data,error,isLoading}=useQuery({queryKey:['audit-detail',id],queryFn:()=>api.get(`audit-logs/${id}/`).then(r=>r.data)})
  useEffect(()=>{ref.current?.showModal()},[])
  return <dialog className="system-dialog system-console" ref={ref} onCancel={onClose} aria-labelledby="audit-detail-title">
    <header><h2 id="audit-detail-title">D?tail de l?activit?</h2><button onClick={onClose}>Fermer</button></header>
    {isLoading ? <p>Chargement?</p> : error ? <p role="alert">{apiError(error)}</p> : <>
      <h3>{data.action_label || data.action}</h3><p>{data.summary}</p>
      <dl><dt>Date</dt><dd>{date(data.timestamp)}</dd><dt>Utilisateur / r?le</dt><dd>{data.actor_identifier || 'Syst?me'} ? {data.actor_role || '?'}</dd><dt>Cible</dt><dd>{data.content_type} #{data.object_id || '?'}</dd><dt>R?sultat</dt><dd>{labels[data.status]}</dd><dt>Adresse IP</dt><dd>{data.ip_address || 'Non collect?e'}</dd><dt>Navigateur</dt><dd>{data.user_agent || 'Non collect?'}</dd><dt>R?f?rence de requ?te</dt><dd>{data.request_id || '?'}</dd></dl>
      <h3>Champs modifi?s</h3><div className="system-table-wrap"><table><thead><tr><th>Champ</th><th>Avant</th><th>Apr?s</th></tr></thead><tbody>{(data.changed_fields || []).map(key=><tr key={key}><td>{key}</td><td><pre>{JSON.stringify(data.before_data?.[key] ?? '?',null,2)}</pre></td><td><pre>{JSON.stringify(data.after_data?.[key] ?? '?',null,2)}</pre></td></tr>)}</tbody></table></div>
      {!data.changed_fields?.length && <p>Aucun changement de champ enregistr? pour cette action.</p>}
    </>}
  </dialog>
}
export default function AuditLogsPage() {
  const [filters,setFilters]=useState(initial)
  const [detail,setDetail]=useState(null)
  const [archive,setArchive]=useState(false)
  const [message,setMessage]=useState('')
  const [search,setSearch]=useState('')
  useEffect(()=>{const timer=setTimeout(()=>setFilters(f=>({...f,search,page:1})),350);return()=>clearTimeout(timer)},[search])
  const query=useQuery({queryKey:['audit',filters],queryFn:()=>api.get('audit-logs/',{params:filters}).then(r=>r.data),keepPreviousData:true})
  const stats=useQuery({queryKey:['audit-statistics',filters],queryFn:()=>api.get('audit-logs/statistics/',{params:filters}).then(r=>r.data)})
  const set=(key,value)=>setFilters(f=>({...f,[key]:value,page:1}))
  const refresh=()=>{query.refetch();stats.refetch()}
  const period=(days)=>{const end=new Date();const start=new Date();start.setDate(end.getDate()-days+1);const local=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;setFilters(f=>({...f,date_debut:local(start),date_fin:local(end),page:1}))}
  return <div className="system-console">
    <header><div><small>ADMINISTRATION ? TRA?ABILIT?</small><h1>Journal d?activit?</h1><p>Historique s?curis? des actions du syst?me.</p></div><div><button onClick={refresh}>Actualiser</button> <button onClick={async()=>{try{await downloadFile('audit-logs/export/','audit-sygmebec.csv',filters);refresh()}catch(e){setMessage(apiError(e))}}}>Exporter CSV</button> <button onClick={()=>setArchive(true)}>Archiver</button></div></header>
    {message && <p className="system-status" role="status">{message}</p>}
    <div className="system-metrics"><article><small>?v?nements filtr?s</small><strong>{stats.data?.total ?? '?'}</strong></article><article><small>Connexions ?chou?es</small><strong>{stats.data?.failed_logins ?? '?'}</strong></article><article><small>Alertes de s?curit?</small><strong>{stats.data?.security ?? '?'}</strong></article></div>
    <section className="system-card"><div><button onClick={()=>period(1)}>Aujourd?hui</button> <button onClick={()=>period(7)}>7 jours</button> <button onClick={()=>period(30)}>30 jours</button></div>
    <div className="system-filters">
      <label>Recherche<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Utilisateur, action, cible?" /></label>
      <label>Du<input type="date" value={filters.date_debut} onChange={e=>set('date_debut',e.target.value)} /></label><label>Au<input type="date" value={filters.date_fin} onChange={e=>set('date_fin',e.target.value)} /></label>
      {[['module','Module',['AUTH','USERS','MEMBERS','REGISTRATION','EVENTS','GALLERY','REPORTS','LETTERS','SETTINGS','SYSTEM']],['severity','Gravit?',['INFO','WARNING','SECURITY','CRITICAL']],['status','R?sultat',['SUCCESS','FAILURE','DENIED','PENDING']],['action','Action',stats.data?.actions || []]].map(([key,label,values])=><label key={key}>{label}<select value={filters[key]} onChange={e=>set(key,e.target.value)}><option value="">Tous</option>{values.map(v=><option key={v} value={v}>{labels[v] || v}</option>)}</select></label>)}
      <label>Utilisateur<select value={filters.actor} onChange={e=>set('actor',e.target.value)}><option value="">Tous</option>{stats.data?.actors?.map(a=><option key={a.actor_id} value={a.actor_id}>{a.actor_identifier}</option>)}</select></label>
      <label>Conservation<select value={filters.archived} onChange={e=>set('archived',e.target.value)}><option value="false">Journaux actifs</option><option value="true">Archives</option><option value="all">Tous les journaux</option></select></label>
    </div><button onClick={()=>{setFilters(initial);setSearch('')}}>R?initialiser les filtres</button></section>
    <section className="system-card">
      {query.isLoading ? <div aria-busy="true">{[1,2,3,4].map(i=><div key={i} className="system-skeleton" />)}</div> : query.error ? <div role="alert"><p>{query.error.response?.status===403 ? 'Acc?s r?serv? ? l?administrateur principal.' : apiError(query.error)}</p><button onClick={refresh}>R?essayer</button></div> : <>
        <div className="system-table-wrap"><table><thead><tr>{['Date et heure','Utilisateur','Action','Module','Cible','R?sultat','Gravit?','D?tail'].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>{query.data?.results?.map(row=><tr key={row.id}><td>{date(row.timestamp)}</td><td>{row.actor_identifier || row.actor?.identifiant || 'Syst?me'}</td><td>{row.action_label || row.action}</td><td>{row.module}</td><td>{row.object_repr || '?'}</td><td><span className="system-pill">{labels[row.status]}</span></td><td><span className={`system-pill ${row.severity}`}>{labels[row.severity]}</span></td><td><button aria-label={`Voir le d?tail de l?activit? ${row.id}`} onClick={()=>setDetail(row.id)}>Voir</button></td></tr>)}</tbody></table></div>
        {!query.data?.results?.length && <p className="system-empty">Aucune activit? pour les filtres choisis.</p>}
        <footer><label>Lignes<select value={filters.page_size} onChange={e=>set('page_size',Number(e.target.value))}>{[10,25,50,100].map(n=><option key={n}>{n}</option>)}</select></label><button disabled={!query.data?.previous || query.isFetching} onClick={()=>setFilters(f=>({...f,page:f.page-1}))}>Pr?c?dent</button><span>Page {query.data?.current_page || 1} / {query.data?.total_pages || 1}</span><button disabled={!query.data?.next || query.isFetching} onClick={()=>setFilters(f=>({...f,page:f.page+1}))}>Suivant</button></footer>
      </>}
    </section>
    {detail && <Detail id={detail} onClose={()=>setDetail(null)} />}
    {archive && <ConfirmAction title="Archiver les anciennes activit?s" description="Les journaux ant?rieurs ? la dur?e de conservation seront class?s dans les archives. Aucune entr?e ne sera supprim?e." word="ARCHIVER" onClose={()=>setArchive(false)} onConfirm={async data=>{try{const r=await api.post('audit-logs/archive/',data);setMessage(`${r.data.count} ?v?nement(s) archiv?(s).`);refresh()}catch(e){throw new Error(apiError(e))}}} />}
  </div>
}
