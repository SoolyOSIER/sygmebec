import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsApi, apiError, downloadFile } from '../api/settingsApi'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../store/authStore'
import { applyPreferences } from '../components/ui/PreferenceSync'
import ConfirmAction from '../components/ui/ConfirmAction'
import './systemConsole.css'

const tabs=[['account','Mon compte'],['appearance','Apparence et accessibilit?'],['preferences','Pr?f?rences de l?application'],['personal-notifications','Mes notifications'],['users','Gestion des utilisateurs',true],['roles','R?les et permissions',true],['backups','Donn?es et sauvegardes',true],['security','S?curit? et sessions',true],['notifications','Communications',true],['general','Configuration de l??glise',true],['organization-theme','Th?me de l?organisation',true],['audit','Audit et maintenance',true]]
const personalKeys={appearance:['theme_mode','use_organization_theme','accent','ui_brightness','font_family','text_scale','heading_weight','line_height','interface_density','reduce_motion','high_contrast','blue_light_reduction','disable_shadows'],preferences:['language','timezone','sidebar_collapsed','landing_page','date_format','hour_format','table_page_size'],'personal-notifications':['email_notifications','internal_notifications','browser_notifications','digest']}
function Field({name,field,value,onChange}) {
  if(field.type==='boolean') return <label className="check-field"><input type="checkbox" checked={!!value} onChange={e=>onChange(name,e.target.checked)} />{field.label}</label>
  return <label>{field.label}{field.type==='select' ? <select value={value ?? ''} onChange={e=>onChange(name,typeof field.default==='number'?Number(e.target.value):e.target.value)}>{field.options.map(v=><option key={v} value={v}>{v}</option>)}</select> : <input type={field.type} min={field.min} max={field.max} value={value ?? ''} onChange={e=>onChange(name,field.type==='number'?Number(e.target.value):e.target.value)} />}</label>
}
function DataEditor({title,description,schema,data,onSave,onPreview,extra}) {
  const [draft,setDraft]=useState(data)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const dirty=JSON.stringify(draft)!==JSON.stringify(data)
  useEffect(()=>{setDraft(data)},[data])
  useEffect(()=>{if(!dirty)return;const handler=e=>{e.preventDefault();e.returnValue=''};window.addEventListener('beforeunload',handler);return()=>window.removeEventListener('beforeunload',handler)},[dirty])
  const update=(key,value)=>{const next={...draft,[key]:value};setDraft(next);onPreview?.(next)}
  return <section className="system-card"><h2>{title}</h2><p>{description}</p>
    {message && <p className="system-status" role="status">{message}</p>}
    <form onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage('');try{await onSave(draft);setMessage('Modifications enregistr?es.')}catch(err){setMessage(apiError(err))}finally{setBusy(false)}}}>
      <div className="system-grid">{Object.entries(schema).map(([key,field])=><Field key={key} name={key} field={field} value={draft[key]} onChange={update} />)}</div>
      {onPreview && <div className="system-preview"><h3>Aper?u du titre</h3><p>Les membres et les ?v?nements restent faciles ? lire.</p><label>Exemple de champ<input readOnly value="?glise Baptiste de l?Espoir" /></label><button type="button" className="primary">Exemple de bouton</button></div>}
      {extra}
      <footer><small>{dirty?'Modifications non enregistr?es':'? jour'}</small><button type="button" disabled={!dirty || busy} onClick={()=>{setDraft(data);onPreview?.(data);setMessage('Modifications annul?es.')}}>Annuler</button><button className="primary" disabled={!dirty || busy}>{busy?'Enregistrement?':'Enregistrer'}</button></footer>
    </form>
  </section>
}
function Profile({confirm}) {
  const user=useAuthStore(s=>s.user)
  const setUser=useAuthStore(s=>s.setUser)
  const [profile,setProfile]=useState({prenom:user?.membre?.prenom || '',nom:user?.membre?.nom || '',email:user?.membre?.email || '',telephone:user?.membre?.telephone || user?.telephone || ''})
  const [pw,setPw]=useState({current_password:'',new_password:'',new_password_confirm:''})
  const [message,setMessage]=useState('')
  const schema=Object.fromEntries([['prenom','Pr?nom'],['nom','Nom'],['email','E-mail'],['telephone','T?l?phone']].map(([k,label])=>[k,{label,type:k==='email'?'email':'text'}]))
  return <>
    <DataEditor title="Mon compte" description="Vos informations personnelles sont enregistr?es dans votre profil." schema={schema} data={profile} onSave={async data=>{const response=await authApi.updateMyProfile(data);setUser(response.data.user || {...user,membre:response.data.membre});setProfile(data)}} />
    <section className="system-card"><h2>Photo de profil</h2>{user?.membre?.photo && <img className="system-logo" alt="Votre profil" src={user.membre.photo} />}<label>Importer une image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{const data=new FormData();data.append('photo',file);const r=await authApi.updateMyProfile(data);setUser(r.data.user || {...user,membre:r.data.membre});setMessage('Photo enregistr?e.')}catch(err){setMessage(apiError(err))}}} /></label></section>
    <section className="system-card"><h2>Changer mon mot de passe</h2><p>Au moins 12 caract?res, avec majuscule, minuscule, chiffre et caract?re sp?cial. La politique de l?organisation peut imposer une longueur sup?rieure.</p><form onSubmit={async e=>{e.preventDefault();try{await authApi.changeMyPassword(pw);setPw({current_password:'',new_password:'',new_password_confirm:''});setMessage('Mot de passe modifi?.')}catch(err){setMessage(apiError(err))}}}><div className="system-grid">{[['current_password','Mot de passe actuel'],['new_password','Nouveau mot de passe'],['new_password_confirm','Confirmer le mot de passe']].map(([key,label])=><label key={key}>{label}<input type="password" required autoComplete={key==='current_password'?'current-password':'new-password'} value={pw[key]} onChange={e=>setPw({...pw,[key]:e.target.value})} /></label>)}</div><footer><button className="primary">Modifier le mot de passe</button></footer></form><p role="status">{message}</p></section>
    <Sessions confirm={confirm} />
    <section className="system-card"><h2>D?sactivation du compte</h2><p>Une demande sera envoy?e ? l?administrateur pour examen.</p><button onClick={()=>confirm({title:'Demander la d?sactivation',description:'Votre compte reste actif pendant l?examen de la demande.',run:data=>settingsApi.act('deactivation-request',data)})}>Envoyer une demande</button></section>
  </>
}
function Sessions({all=false,confirm}) {
  const query=useQuery({queryKey:['sessions',all],queryFn:()=>settingsApi.get(all?'sessions/?all=true'.replace('/?','?'):'sessions')})
  // API helper expects the slash before query parameters; use a dedicated getter below.
  return <section className="system-card"><h2>Sessions ouvertes</h2>{query.error && <p role="alert">{apiError(query.error)}</p>}
    <div className="system-table-wrap"><table><thead><tr><th>Utilisateur</th><th>Appareil</th><th>IP</th><th>Expiration</th><th>Action</th></tr></thead><tbody>{query.data?.map(row=><tr key={row.id}><td>{row.user}{row.current?' (cet appareil)':''}</td><td>{row.user_agent || 'Inconnu'}</td><td>{row.ip_address || '?'}</td><td>{new Date(row.expires_at).toLocaleString('fr-FR')}</td><td><button onClick={()=>confirm({title:'R?voquer cette session',description:'L?appareil devra se reconnecter.',run:async data=>{await settingsApi.act('sessions',{...data,id:row.id});query.refetch()}})}>R?voquer</button></td></tr>)}</tbody></table></div>
    {!query.data?.length && <p>Aucune session active ? afficher.</p>}
    <footer><button onClick={()=>confirm({title:'D?connecter les autres appareils',description:'Seule votre session actuelle restera ouverte.',run:async data=>{await settingsApi.act('sessions',{...data,scope:'others'});query.refetch()}})}>D?connecter mes autres appareils</button>{all && <button onClick={()=>confirm({title:'Fermer toutes les sessions',description:'Tous les utilisateurs devront se reconnecter, y compris vous.',run:data=>settingsApi.act('sessions',{...data,scope:'all'})})}>Fermer toutes les sessions</button>}</footer>
  </section>
}
function Roles({confirm}) {
  const query=useQuery({queryKey:['role-policy'],queryFn:()=>settingsApi.get('roles')})
  const [draft,setDraft]=useState(null)
  useEffect(()=>{if(query.data)setDraft(query.data.data)},[query.data])
  if(query.error)return <p role="alert">{apiError(query.error)}</p>
  if(!draft)return <p>Chargement des permissions?</p>
  return <section className="system-card"><h2>R?les et permissions</h2><p>Les r?les syst?me sont conserv?s. Cette matrice restreint les acc?s m?tiers d?j? autoris?s ; l?administration reste r?serv?e au compte principal.</p><div className="system-table-wrap"><table><thead><tr><th>Module / permission</th><th>Pasteur</th><th>Secr?taire</th><th>Administrateur principal</th></tr></thead><tbody>{Object.entries(query.data.modules).flatMap(([module,actions])=>actions.map(action=><tr key={`${module}.${action}`}><td>{module} ? {action}</td>{['PASTEUR','SECRETAIRE'].map(role=><td key={role}><input aria-label={`${role} ${module} ${action}`} type="checkbox" checked={draft[role][module][action]} onChange={e=>setDraft({...draft,[role]:{...draft[role],[module]:{...draft[role][module],[action]:e.target.checked}}})} /></td>)}<td>? Autoris?</td></tr>))}</tbody></table></div><footer><button onClick={()=>setDraft(query.data.data)}>Annuler</button><button className="primary" onClick={()=>confirm({title:'Modifier les permissions',description:'Ces restrictions seront appliqu?es par le serveur aux prochaines requ?tes.',run:async data=>{await settingsApi.save('roles',{...data,data:draft});query.refetch()}})}>Enregistrer les permissions</button></footer></section>
}
function Backups({confirm}) {
  const query=useQuery({queryKey:['backups'],queryFn:()=>settingsApi.get('backups'),refetchInterval:10000})
  const [error,setError]=useState('')
  return <section className="system-card"><header><div><h2>Sauvegardes chiffr?es</h2><p>Donn?es et m?dias. Le journal d?audit reste ind?pendant des restaurations.</p></div><button className="primary" onClick={()=>confirm({title:'Cr?er une sauvegarde',description:'Une copie chiffr?e des donn?es et m?dias sera cr??e sur le serveur.',run:async data=>{await settingsApi.act('backups',data);query.refetch()}})}>Cr?er une sauvegarde</button></header>{(error || query.error) && <p role="alert">{error || apiError(query.error)}</p>}<div className="system-table-wrap"><table><thead><tr><th>Date</th><th>Auteur</th><th>?tat</th><th>Taille</th><th>Actions</th></tr></thead><tbody>{query.data?.map(row=><tr key={row.id}><td>{new Date(row.created_at).toLocaleString('fr-FR')}</td><td>{row.created_by__identifiant || 'Syst?me'}</td><td>{row.status}{row.error && <p>{row.error}</p>}</td><td>{(row.size/1024/1024).toFixed(2)} Mo</td><td>{row.status==='SUCCESS' && <><button onClick={async()=>{try{await downloadFile(`settings/backups/${row.id}/download/`,`backup-${row.id}.sygmebec`)}catch(e){setError(apiError(e))}}}>T?l?charger</button> <button onClick={()=>confirm({title:'Restaurer par fusion',word:'RESTAURER',passwordRequired:true,description:'Les anciennes valeurs seront restaur?es. Les ajouts post?rieurs et les audits seront conserv?s. Une sauvegarde de s?curit? sera cr??e ; toutes les sessions seront r?voqu?es.',run:data=>settingsApi.act(`backups/${row.id}/restore`,data)})}>Restaurer</button></>}</td></tr>)}</tbody></table></div>{!query.data?.length && <p>Aucune sauvegarde. Cr?ez la premi?re copie.</p>}</section>
}
function Maintenance({confirm}) {
  const query=useQuery({queryKey:['maintenance'],queryFn:()=>settingsApi.get('maintenance')})
  const alerts=useQuery({queryKey:['admin-alerts'],queryFn:()=>settingsApi.get('notifications'),refetchInterval:30000})
  return <><section className="system-card"><h2>?tat du syst?me</h2>{query.error ? <p>{apiError(query.error)}</p>:<><p>Frontend {query.data?.frontend} ? Django {query.data?.backend}</p><p>M?dias : {((query.data?.media_bytes || 0)/1024/1024).toFixed(2)} Mo</p><p>Derni?re sauvegarde : {query.data?.last_backup ? new Date(query.data.last_backup.created_at).toLocaleString('fr-FR'):'Aucune'}</p><p>Dernier ?chec : {query.data?.last_failure?.action || 'Aucun'}</p><Link className="system-link" to="/audit-logs">Ouvrir le journal d?activit?</Link></>}
    <footer>{[['statistics','Recalculer les statistiques'],['cleanup','Nettoyer les fichiers temporaires'],['notification','Tester une notification']].map(([operation,label])=><button key={operation} onClick={()=>confirm({title:label,description:'Cette op?ration sera enregistr?e dans le journal.',run:async data=>{await settingsApi.act('maintenance',{...data,operation});query.refetch();alerts.refetch()}})}>{label}</button>)}</footer></section>
    <section className="system-card"><h2>Alertes administratives</h2>{alerts.error && <p>{apiError(alerts.error)}</p>}{alerts.data?.map(row=><article key={row.id}><strong>{row.title}</strong><p>{new Date(row.created_at).toLocaleString('fr-FR')} ? {row.read_at?'Lue':'Nouvelle'}</p>{!row.read_at && <button onClick={async()=>{await settingsApi.act('notifications',{id:row.id});alerts.refetch()}}>Marquer comme lue</button>}</article>)}{!alerts.data?.length && <p>Aucune alerte.</p>}</section></>
}
export default function SettingsPage() {
  const user=useAuthStore(s=>s.user)
  const admin=!!(user?.is_administrateur_principal || user?.est_administrateur_principal)
  const [params,setParams]=useSearchParams()
  const selected=params.get('tab') || 'account'
  const tab=tabs.some(([id,,restricted])=>id===selected && (!restricted || admin))?selected:'account'
  const queryClient=useQueryClient()
  const personal=useQuery({queryKey:['preferences',user?.id],queryFn:()=>settingsApi.get('me')})
  const org=useQuery({queryKey:['organization'],queryFn:()=>settingsApi.get('organization'),enabled:admin})
  const [confirmation,setConfirmation]=useState(null)
  const [message,setMessage]=useState('')
  const [recipient,setRecipient]=useState('')
  const orgSection=tab==='organization-theme'?'appearance':tab
  const refresh=()=>{personal.refetch();if(admin)org.refetch()}
  const schema=personal.data?.schema || {}
  const pdata=personal.data?.data || {}
  const personalSection=!!personalKeys[tab]
  return <div className="system-console system-settings"><header><div><small>SYGMEBEC ? CONFIGURATION</small><h1>Param?tres</h1><p>Vos pr?f?rences et les r?glages de votre organisation.</p></div><button onClick={refresh}>Actualiser</button></header>
    {message && <p className="system-status" role="status">{message}</p>}
    <div className="system-layout"><nav aria-label="Sections des param?tres">{tabs.filter(([, ,restricted])=>!restricted || admin).map(([id,label])=><button key={id} aria-current={tab===id} onClick={()=>setParams({tab:id})}>{label}</button>)}</nav><main>
      {personal.isLoading ? <div aria-busy="true" className="system-skeleton"/>:personal.error ? <p role="alert">{apiError(personal.error)} <button onClick={refresh}>R?essayer</button></p>:<>
        {tab==='account' && <Profile confirm={setConfirmation} />}
        {personalSection && <DataEditor key={tab} title={tabs.find(t=>t[0]===tab)?.[1]} description="Pr?f?rences personnelles enregistr?es dans votre compte. L?aper?u est imm?diat ; Enregistrer conserve vos choix." schema={Object.fromEntries(personalKeys[tab].filter(k=>schema[k]).map(k=>[k,schema[k]]))} data={Object.fromEntries(personalKeys[tab].map(k=>[k,pdata[k]]))} onPreview={tab==='appearance'?data=>applyPreferences({...pdata,...data},personal.data.organization_theme):undefined} onSave={async data=>{if(data.browser_notifications && 'Notification' in window)await Notification.requestPermission();const saved=await settingsApi.save('me',data);queryClient.setQueryData(['preferences',user?.id],saved);applyPreferences(saved.data,saved.organization_theme)}} />}
        {admin && tab==='users' && <section className="system-card"><h2>Gestion des utilisateurs</h2><p>Cr?er des comptes, modifier les profils et les r?les, activer ou d?sactiver un utilisateur et r?initialiser un mot de passe.</p><Link className="system-link" to="/comptes">Ouvrir la gestion des comptes</Link></section>}
        {admin && tab==='roles' && <Roles confirm={setConfirmation} />}
        {admin && org.isLoading && !personalSection && <p>Chargement de la configuration?</p>}
        {admin && org.error && <p role="alert">{apiError(org.error)}</p>}
        {admin && org.data?.schema?.[orgSection] && <DataEditor key={orgSection} title={tabs.find(t=>t[0]===tab)?.[1]} description="Ces r?glages sont partag?s par l?organisation et contr?l?s par le serveur." schema={org.data.schema[orgSection]} data={org.data.data[orgSection]} onSave={async data=>{if(orgSection==='security'){setConfirmation({title:'Modifier la politique de s?curit?',description:'Les nouveaux param?tres seront appliqu?s aux prochaines connexions.',run:async payload=>{await settingsApi.save('organization',{[orgSection]:data,...payload});org.refetch()}});return}await settingsApi.save('organization',{[orgSection]:data});await org.refetch();await personal.refetch()}} extra={orgSection==='appearance' && <button type="button" onClick={async()=>{try{const official=Object.fromEntries(Object.entries(org.data.schema.appearance).map(([k,v])=>[k,v.default]));await settingsApi.save('organization',{appearance:official});refresh()}catch(e){setMessage(apiError(e))}}}>Restaurer le th?me officiel SYGMEBEC</button>} />}
        {admin && tab==='general' && <section className="system-card"><h2>Logo officiel</h2>{org.data?.logo && <img className="system-logo" src={org.data.logo} alt="Logo officiel" />}<label>Image PNG, JPEG ou WebP (5 Mo maximum)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{const data=new FormData();data.append('logo',file);await settingsApi.save('organization',data);org.refetch();setMessage('Logo enregistr?.')}catch(err){setMessage(apiError(err))}}}/></label></section>}
        {admin && tab==='security' && <Sessions all confirm={setConfirmation} />}
        {admin && tab==='backups' && <Backups confirm={setConfirmation} />}
        {admin && tab==='notifications' && <section className="system-card"><h2>Test d?envoi</h2><label>Destinataire<input type="email" value={recipient} onChange={e=>setRecipient(e.target.value)} /></label><footer><button onClick={()=>setConfirmation({title:'Envoyer un e-mail de test',description:`Un message sera envoy? ? ${recipient}.`,run:data=>settingsApi.act('maintenance',{...data,operation:'email',recipient})})}>Tester l?envoi</button></footer></section>}
        {admin && tab==='audit' && <Maintenance confirm={setConfirmation} />}
      </>}
    </main></div>
    {confirmation && <ConfirmAction {...confirmation} onClose={()=>setConfirmation(null)} onConfirm={async data=>{try{const result=await confirmation.run(data);setMessage(result?.detail || 'Op?ration termin?e.')}catch(e){throw new Error(apiError(e))}}} />}
  </div>
}
