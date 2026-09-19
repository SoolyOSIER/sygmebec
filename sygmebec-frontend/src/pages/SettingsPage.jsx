import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { apiError, downloadFile, settingsApi } from '../api/settingsApi'
import ConfirmAction from '../components/ui/ConfirmAction'
import { applyPreferences } from '../components/ui/PreferenceSync'
import { useAuthStore } from '../store/authStore'
import { getMediaUrl } from '../utils/media'
import './systemConsole.css'

const tabs = [
  ['account', 'Mon compte'],
  ['appearance', 'Apparence et accessibilité'],
  ['preferences', 'Préférences de l’application'],
  ['personal-notifications', 'Mes notifications'],
  ['users', 'Gestion des utilisateurs', true],
  ['roles', 'Rôles et permissions', true],
  ['backups', 'Données et sauvegardes', true],
  ['security', 'Sécurité et sessions', true],
  ['notifications', 'Communications', true],
  ['general', 'Configuration de l’église', true],
  ['organization-theme', 'Thème de l’organisation', true],
  ['audit', 'Audit et maintenance', true],
]

const personalSections = {
  appearance: ['theme_mode', 'use_organization_theme', 'accent', 'ui_brightness', 'font_family', 'text_scale', 'heading_weight', 'line_height', 'interface_density', 'reduce_motion', 'high_contrast', 'blue_light_reduction', 'disable_shadows'],
  preferences: ['language', 'timezone', 'sidebar_collapsed', 'landing_page', 'date_format', 'hour_format', 'table_page_size'],
  'personal-notifications': ['email_notifications', 'internal_notifications', 'browser_notifications', 'digest'],
}

function sectionTitle(id) {
  return tabs.find(([tab]) => tab === id)?.[1] || 'Paramètres'
}

function Field({ name, config, value, onChange }) {
  if (config.type === 'boolean') {
    return <label className="check-field"><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(name, event.target.checked)} />{config.label}</label>
  }

  if (config.type === 'select') {
    return <label>{config.label}<select value={value ?? ''} onChange={(event) => onChange(name, typeof config.default === 'number' ? Number(event.target.value) : event.target.value)}>{config.options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
  }

  if (config.type === 'json') {
    return null
  }

  if (config.multiline) {
    return <label className="system-span-two">{config.label}<textarea rows="5" value={value ?? ''} onChange={(event) => onChange(name, event.target.value)} /></label>
  }

  return <label>{config.label}<input type={config.type || 'text'} min={config.min} max={config.max} value={value ?? ''} onChange={(event) => onChange(name, config.type === 'number' ? Number(event.target.value) : event.target.value)} /></label>
}

function DataEditor({ title, description, schema, data, onSave, onPreview, extra }) {
  const [draft, setDraft] = useState(data)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const dirty = JSON.stringify(draft) !== JSON.stringify(data)

  useEffect(() => setDraft(data), [data])
  useEffect(() => {
    if (!dirty) return undefined
    const preventUnload = (event) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', preventUnload)
    return () => window.removeEventListener('beforeunload', preventUnload)
  }, [dirty])

  const update = (key, value) => {
    const next = { ...draft, [key]: value }
    setDraft(next)
    onPreview?.(next)
  }

  const reset = () => {
    setDraft(data)
    onPreview?.(data)
    setMessage('Modifications annulées.')
  }

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const completed = await onSave(draft)
      if (completed !== false) setMessage('Modifications enregistrées.')
    } catch (error) {
      setMessage(apiError(error))
    } finally {
      setBusy(false)
    }
  }

  return <section className="system-card">
    <h2>{title}</h2><p>{description}</p>
    {message && <p className="system-status" role="status">{message}</p>}
    <form onSubmit={submit}>
      <div className="system-grid">{Object.entries(schema).map(([key, config]) => <Field key={key} name={key} config={config} value={draft[key]} onChange={update} />)}</div>
      {onPreview && <div className="system-preview"><h3>Aperçu en direct</h3><p>Les membres et les événements restent faciles à lire.</p><label>Exemple de champ<input readOnly value="Église Baptiste de l’Espoir" /></label><button type="button" className="primary">Exemple de bouton</button></div>}
      {extra}
      <footer><small>{dirty ? 'Modifications non enregistrées' : 'À jour'}</small><button type="button" disabled={!dirty || busy} onClick={reset}>Annuler</button><button className="primary" disabled={!dirty || busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button></footer>
    </form>
  </section>
}

function Profile({ confirm }) {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const [profile, setProfile] = useState({
    prenom: user?.membre?.prenom || '', nom: user?.membre?.nom || '',
    email: user?.membre?.email || '', telephone: user?.membre?.telephone || user?.telephone || '',
  })
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', new_password_confirm: '' })
  const [message, setMessage] = useState('')
  const schema = {
    prenom: { label: 'Prénom', type: 'text' }, nom: { label: 'Nom', type: 'text' },
    email: { label: 'E-mail', type: 'email' }, telephone: { label: 'Téléphone', type: 'text' },
  }

  const updateUser = (response) => setUser(response.data.user || { ...user, membre: response.data.membre })

  return <>
    <DataEditor title="Mon compte" description="Vos informations personnelles sont enregistrées dans votre profil." schema={schema} data={profile} onSave={async (data) => { const response = await authApi.updateMyProfile(data); updateUser(response); setProfile(data) }} />
    <section className="system-card"><h2>Photo de profil</h2>{user?.membre?.photo && <img className="system-logo" alt="Votre profil" src={getMediaUrl(user.membre.photo)} />}<label>Importer une image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { const body = new FormData(); body.append('photo', file); updateUser(await authApi.updateMyProfile(body)); setMessage('Photo enregistrée.') } catch (error) { setMessage(apiError(error)) } }} /></label>{message && <p role="status">{message}</p>}</section>
    <section className="system-card"><h2>Changer mon mot de passe</h2><p>Au moins 12 caractères, avec majuscule, minuscule, chiffre et caractère spécial. La politique de l’organisation peut imposer une longueur supérieure.</p><form onSubmit={async (event) => { event.preventDefault(); try { await authApi.changeMyPassword(passwords); setPasswords({ current_password: '', new_password: '', new_password_confirm: '' }); setMessage('Mot de passe modifié.') } catch (error) { setMessage(apiError(error)) } }}><div className="system-grid">{[['current_password', 'Mot de passe actuel'], ['new_password', 'Nouveau mot de passe'], ['new_password_confirm', 'Confirmer le mot de passe']].map(([key, label]) => <label key={key}>{label}<input type="password" required autoComplete={key === 'current_password' ? 'current-password' : 'new-password'} value={passwords[key]} onChange={(event) => setPasswords({ ...passwords, [key]: event.target.value })} /></label>)}</div><footer><button className="primary">Modifier le mot de passe</button></footer></form>{message && <p role="status">{message}</p>}</section>
    <Sessions confirm={confirm} />
    <section className="system-card"><h2>Désactivation du compte</h2><p>Une demande sera envoyée à l’administrateur pour examen.</p><button onClick={() => confirm({ title: 'Demander la désactivation', description: 'Votre compte reste actif pendant l’examen de la demande.', run: (data) => settingsApi.act('deactivation-request', data) })}>Envoyer une demande</button></section>
  </>
}

function Sessions({ all = false, confirm }) {
  const query = useQuery({ queryKey: ['sessions', all], queryFn: () => settingsApi.get(all ? 'sessions?all=true' : 'sessions') })
  const revoke = (payload, title, description) => confirm({ title, description, run: async (data) => { await settingsApi.act('sessions', { ...data, ...payload }); await query.refetch() } })

  return <section className="system-card"><h2>Sessions ouvertes</h2>{query.error && <p role="alert">{apiError(query.error)}</p>}<div className="system-table-wrap"><table><thead><tr><th>Utilisateur</th><th>Appareil</th><th>IP</th><th>Expiration</th><th>Action</th></tr></thead><tbody>{query.data?.map((row) => <tr key={row.id}><td>{row.user}{row.current ? ' (cet appareil)' : ''}</td><td>{row.user_agent || 'Inconnu'}</td><td>{row.ip_address || '—'}</td><td>{new Date(row.expires_at).toLocaleString('fr-FR')}</td><td><button onClick={() => revoke({ id: row.id }, 'Révoquer cette session', 'L’appareil devra se reconnecter.')}>Révoquer</button></td></tr>)}</tbody></table></div>{!query.data?.length && <p>Aucune session active à afficher.</p>}<footer><button onClick={() => revoke({ scope: 'others' }, 'Déconnecter les autres appareils', 'Seule votre session actuelle restera ouverte.')}>Déconnecter mes autres appareils</button>{all && <button onClick={() => revoke({ scope: 'all' }, 'Fermer toutes les sessions', 'Tous les utilisateurs devront se reconnecter, y compris vous.')}>Fermer toutes les sessions</button>}</footer></section>
}

function Roles({ confirm }) {
  const query = useQuery({ queryKey: ['role-policy'], queryFn: () => settingsApi.get('roles') })
  const [draft, setDraft] = useState(null)
  useEffect(() => { if (query.data) setDraft(query.data.data) }, [query.data])
  if (query.error) return <p role="alert">{apiError(query.error)}</p>
  if (!draft) return <p>Chargement des permissions…</p>

  const update = (role, module, action, value) => setDraft({ ...draft, [role]: { ...draft[role], [module]: { ...draft[role][module], [action]: value } } })
  return <section className="system-card"><h2>Rôles et permissions</h2><p>Les rôles système sont conservés. Cette matrice restreint les accès métiers déjà autorisés ; l’administration reste réservée au compte principal.</p><div className="system-table-wrap"><table><thead><tr><th>Module / permission</th><th>Pasteur</th><th>Secrétaire</th><th>Administrateur principal</th></tr></thead><tbody>{Object.entries(query.data.modules).flatMap(([module, actions]) => actions.map((action) => <tr key={`${module}.${action}`}><td>{module} · {action}</td>{['PASTEUR', 'SECRETAIRE'].map((role) => <td key={role}><input aria-label={`${role} ${module} ${action}`} type="checkbox" checked={draft[role][module][action]} onChange={(event) => update(role, module, action, event.target.checked)} /></td>)}<td>✓ Autorisé</td></tr>))}</tbody></table></div><footer><button onClick={() => setDraft(query.data.data)}>Annuler</button><button className="primary" onClick={() => confirm({ title: 'Modifier les permissions', description: 'Ces restrictions seront appliquées par le serveur aux prochaines requêtes.', run: async (data) => { await settingsApi.save('roles', { ...data, data: draft }); await query.refetch() } })}>Enregistrer les permissions</button></footer></section>
}

function Backups({ confirm }) {
  const query = useQuery({ queryKey: ['backups'], queryFn: () => settingsApi.get('backups'), refetchInterval: 10000 })
  const [error, setError] = useState('')
  return <section className="system-card"><header><div><h2>Sauvegardes chiffrées</h2><p>Données et médias. Le journal d’audit reste indépendant des restaurations.</p></div><button className="primary" onClick={() => confirm({ title: 'Créer une sauvegarde', description: 'Une copie chiffrée des données et médias sera créée sur le serveur.', run: async (data) => { await settingsApi.act('backups', data); await query.refetch() } })}>Créer une sauvegarde</button></header>{(error || query.error) && <p role="alert">{error || apiError(query.error)}</p>}<div className="system-table-wrap"><table><thead><tr><th>Date</th><th>Auteur</th><th>État</th><th>Taille</th><th>Actions</th></tr></thead><tbody>{query.data?.map((row) => <tr key={row.id}><td>{new Date(row.created_at).toLocaleString('fr-FR')}</td><td>{row.created_by__identifiant || 'Système'}</td><td>{row.status}{row.error && <p>{row.error}</p>}</td><td>{(row.size / 1024 / 1024).toFixed(2)} Mo</td><td>{row.status === 'SUCCESS' && <><button onClick={async () => { try { await downloadFile(`settings/backups/${row.id}/download/`, `backup-${row.id}.sygmebec`) } catch (requestError) { setError(apiError(requestError)) } }}>Télécharger</button> <button onClick={() => confirm({ title: 'Restaurer par fusion', word: 'RESTAURER', passwordRequired: true, description: 'Les anciennes valeurs seront restaurées. Les ajouts postérieurs et les audits seront conservés. Une sauvegarde de sécurité sera créée ; toutes les sessions seront révoquées.', run: (data) => settingsApi.act(`backups/${row.id}/restore`, data) })}>Restaurer</button></>}</td></tr>)}</tbody></table></div>{!query.data?.length && <p>Aucune sauvegarde. Créez la première copie.</p>}</section>
}

function Maintenance({ confirm }) {
  const system = useQuery({ queryKey: ['maintenance'], queryFn: () => settingsApi.get('maintenance') })
  const alerts = useQuery({ queryKey: ['admin-alerts'], queryFn: () => settingsApi.get('notifications'), refetchInterval: 30000 })
  const operation = (key, title) => confirm({ title, description: 'Cette opération sera enregistrée dans le journal.', run: async (data) => { await settingsApi.act('maintenance', { ...data, operation: key }); await system.refetch(); await alerts.refetch() } })
  return <><section className="system-card"><h2>État du système</h2>{system.error ? <p role="alert">{apiError(system.error)}</p> : <><p>Frontend {system.data?.frontend} · Django {system.data?.backend}</p><p>Médias : {((system.data?.media_bytes || 0) / 1024 / 1024).toFixed(2)} Mo</p><p>Dernière sauvegarde : {system.data?.last_backup ? new Date(system.data.last_backup.created_at).toLocaleString('fr-FR') : 'Aucune'}</p><p>Dernier échec : {system.data?.last_failure?.action || 'Aucun'}</p><Link className="system-link" to="/audit-logs">Ouvrir le journal d’activité</Link></>}<footer><button onClick={() => operation('statistics', 'Recalculer les statistiques')}>Recalculer les statistiques</button><button onClick={() => operation('cleanup', 'Nettoyer les fichiers temporaires')}>Nettoyer les fichiers temporaires</button><button onClick={() => operation('notification', 'Tester une notification')}>Tester une notification</button></footer></section><section className="system-card"><h2>Alertes administratives</h2>{alerts.error && <p role="alert">{apiError(alerts.error)}</p>}{alerts.data?.map((row) => <article key={row.id}><strong>{row.title}</strong><p>{new Date(row.created_at).toLocaleString('fr-FR')} · {row.read_at ? 'Lue' : 'Nouvelle'}</p>{!row.read_at && <button onClick={async () => { await settingsApi.act('notifications', { id: row.id }); await alerts.refetch() }}>Marquer comme lue</button>}</article>)}{!alerts.data?.length && <p>Aucune alerte.</p>}</section></>
}

function previewOrganizationTheme(theme) {
  const root = document.documentElement
  Object.entries(theme).forEach(([key, value]) => root.style.setProperty(`--org-${key}`, value))
}

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const isAdmin = Boolean(user?.is_administrateur_principal || user?.est_administrateur_principal)
  const [params, setParams] = useSearchParams()
  const queryClient = useQueryClient()
  const requested = params.get('tab') || 'account'
  const tab = tabs.some(([id, , restricted]) => id === requested && (!restricted || isAdmin)) ? requested : 'account'
  const personal = useQuery({ queryKey: ['preferences', user?.id], queryFn: () => settingsApi.get('me') })
  const organization = useQuery({ queryKey: ['organization'], queryFn: () => settingsApi.get('organization'), enabled: isAdmin })
  const [confirmation, setConfirmation] = useState(null)
  const [message, setMessage] = useState('')
  const [recipient, setRecipient] = useState('')
  // Les préférences personnelles et celles de l'organisation ont toutes deux
  // une section « appearance ». Celle de l'organisation est réservée à son
  // onglet dédié : sinon les deux formulaires s'affichaient en même temps.
  const orgSection = tab === 'organization-theme'
    ? 'appearance'
    : personalSections[tab]
      ? null
      : tab
  const schema = personal.data?.schema || {}
  const data = personal.data?.data || {}

  const refresh = () => { personal.refetch(); if (isAdmin) organization.refetch() }
  const closeConfirmation = () => setConfirmation(null)

  const savePersonal = async (next) => {
    if (next.browser_notifications && 'Notification' in window) await Notification.requestPermission()
    const saved = await settingsApi.save('me', next)
    queryClient.setQueryData(['preferences', user?.id], saved)
    applyPreferences(saved.data, saved.organization_theme)
  }

  const confirmRun = async (payload) => {
    try {
      const result = await confirmation.run(payload)
      setMessage(result?.detail || 'Opération terminée.')
    } catch (error) {
      throw new Error(apiError(error))
    }
  }

  return <div className="system-console system-settings"><header><div><small>SYGMEBEC · CONFIGURATION</small><h1>Paramètres</h1><p>Vos préférences et les réglages de votre organisation.</p></div><button onClick={refresh}>Actualiser</button></header>{message && <p className="system-status" role="status">{message}</p>}<div className="system-layout"><nav aria-label="Sections des paramètres">{tabs.filter(([, , restricted]) => !restricted || isAdmin).map(([id, label]) => <button type="button" key={id} aria-current={tab === id} aria-pressed={tab === id} onClick={() => setParams({ tab: id })}>{label}</button>)}</nav><main>{personal.isLoading ? <div aria-busy="true" className="system-skeleton" /> : personal.error ? <p role="alert">{apiError(personal.error)} <button onClick={refresh}>Réessayer</button></p> : <>
    {tab === 'account' && <Profile confirm={setConfirmation} />}
    {personalSections[tab] && <DataEditor key={tab} title={sectionTitle(tab)} description="Préférences personnelles enregistrées dans votre compte. L’aperçu est immédiat ; Enregistrer conserve vos choix." schema={Object.fromEntries(personalSections[tab].filter((key) => schema[key]).map((key) => [key, schema[key]]))} data={Object.fromEntries(personalSections[tab].map((key) => [key, data[key]]))} onPreview={tab === 'appearance' ? (next) => applyPreferences({ ...data, ...next }, personal.data.organization_theme) : undefined} onSave={savePersonal} />}
    {isAdmin && tab === 'users' && <section className="system-card"><h2>Gestion des utilisateurs</h2><p>Créer des comptes, modifier les profils et les rôles, activer ou désactiver un utilisateur et réinitialiser un mot de passe.</p><Link className="system-link" to="/comptes">Ouvrir la gestion des comptes</Link></section>}
    {isAdmin && tab === 'roles' && <Roles confirm={setConfirmation} />}
    {isAdmin && organization.isLoading && !personalSections[tab] && <p>Chargement de la configuration…</p>}
    {isAdmin && organization.error && <p role="alert">{apiError(organization.error)}</p>}
    {isAdmin && organization.data?.schema?.[orgSection] && <DataEditor key={orgSection} title={sectionTitle(tab)} description="Ces réglages sont partagés par l’organisation et contrôlés par le serveur." schema={organization.data.schema[orgSection]} data={organization.data.data[orgSection]} onPreview={orgSection === 'appearance' ? previewOrganizationTheme : undefined} onSave={async (next) => { if (orgSection === 'security') { setConfirmation({ title: 'Modifier la politique de sécurité', description: 'Les nouveaux paramètres seront appliqués aux prochaines connexions.', run: async (payload) => { await settingsApi.save('organization', { [orgSection]: next, ...payload }); await organization.refetch() } }); return false } await settingsApi.save('organization', { [orgSection]: next }); await organization.refetch(); await personal.refetch() }} extra={orgSection === 'appearance' && <button type="button" onClick={async () => { const official = Object.fromEntries(Object.entries(organization.data.schema.appearance).map(([key, config]) => [key, config.default])); await settingsApi.save('organization', { appearance: official }); previewOrganizationTheme(official); await organization.refetch() }}>Restaurer le thème officiel SYGMEBEC</button>} />}
    {isAdmin && tab === 'general' && <section className="system-card"><h2>Logo officiel</h2>{organization.data?.logo && <img className="system-logo" src={organization.data.logo} alt="Logo officiel" />}<label>Image PNG, JPEG ou WebP (5 Mo maximum)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { const form = new FormData(); form.append('logo', file); await settingsApi.save('organization', form); await organization.refetch(); setMessage('Logo enregistré.') } catch (error) { setMessage(apiError(error)) } }} /></label></section>}
    {isAdmin && tab === 'security' && <Sessions all confirm={setConfirmation} />}
    {isAdmin && tab === 'backups' && <Backups confirm={setConfirmation} />}
    {isAdmin && tab === 'notifications' && <section className="system-card"><h2>Test d’envoi</h2><label>Destinataire<input type="email" value={recipient} onChange={(event) => setRecipient(event.target.value)} /></label><footer><button onClick={() => setConfirmation({ title: 'Envoyer un e-mail de test', description: `Un message sera envoyé à ${recipient}.`, run: (payload) => settingsApi.act('maintenance', { ...payload, operation: 'email', recipient }) })}>Tester l’envoi</button></footer></section>}
    {isAdmin && tab === 'audit' && <Maintenance confirm={setConfirmation} />}
  </>}</main></div>{confirmation && <ConfirmAction {...confirmation} onClose={closeConfirmation} onConfirm={confirmRun} />}</div>
}
