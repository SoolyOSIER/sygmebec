import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiBell, FiCamera, FiCheck, FiLock, FiSettings, FiSliders, FiUser, FiUsers } from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'
import { getRoleLabel } from '../utils/roleHierarchy'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { authApi } from '../api/authApi'

const navigation = [
  { label: 'Profil', icon: FiUser, active: true },
  { label: 'Préférences', icon: FiSliders, to: '/settings?tab=general' },
  { label: 'Notifications', icon: FiBell, to: '/settings?tab=notifications' },
]

export default function ProfilePage() {
  const { user, role, setUser } = useAuthStore()
  const [form, setForm] = useState({ prenom: '', nom: '', email: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [message, setMessage] = useState(null)
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', new_password_confirm: '' })

  useEffect(() => {
    setForm({ prenom: user?.membre?.prenom || '', nom: user?.membre?.nom || '', email: user?.membre?.email || '' })
  }, [user])

  if (!user) return <div className="py-20 text-center text-secondary-400">Chargement du profil…</div>

  const updateLocalUser = (data) => {
    const membre = { ...user.membre, ...data, nom_complet: `${data.prenom ?? form.prenom} ${data.nom ?? form.nom}`.trim() }
    setUser({ ...user, membre })
  }

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setMessage({ type: 'error', text: 'Veuillez sélectionner un fichier image.' })
    if (file.size > 20 * 1024 * 1024) return setMessage({ type: 'error', text: 'La photo ne doit pas dépasser 20 Mo.' })
    const formData = new FormData()
    formData.append('photo', file)
    setIsUploading(true)
    setMessage(null)
    try {
      const { data } = await authApi.updateMyProfile(formData)
      updateLocalUser(data.membre)
      setMessage({ type: 'success', text: 'Photo de profil mise à jour.' })
    } catch {
      setMessage({ type: 'error', text: 'Impossible de mettre la photo à jour.' })
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setMessage(null)
    try {
      const { data } = await authApi.updateMyProfile(form)
      updateLocalUser(data.membre)
      setMessage({ type: 'success', text: 'Informations du profil enregistrées.' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Impossible d’enregistrer les modifications.' })
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => setForm({ prenom: user.membre?.prenom || '', nom: user.membre?.nom || '', email: user.membre?.email || '' })

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      setMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' })
      return
    }
    setIsChangingPassword(true)
    setMessage(null)
    try {
      const { data } = await authApi.changeMyPassword(passwordForm)
      setPasswordForm({ current_password: '', new_password: '', new_password_confirm: '' })
      setMessage({ type: 'success', text: data.message || 'Mot de passe modifié avec succès.' })
    } catch (error) {
      const details = error.response?.data
      const fieldError = details && typeof details === 'object' && Object.values(details).find((value) => Array.isArray(value))
      setMessage({ type: 'error', text: fieldError?.[0] || details?.detail || 'Impossible de modifier le mot de passe.' })
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl py-2">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-card lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-gray-200 bg-slate-50/60 p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-6">
            <Avatar name={user.membre?.nom_complet || user.membre?.nom || user.identifiant} src={user.membre?.photo} size="lg" />
            <div className="min-w-0"><p className="truncate font-semibold text-secondary-900">{user.membre?.nom_complet || `${user.membre?.prenom || ''} ${user.membre?.nom || ''}`.trim() || user.identifiant}</p><Badge variant="info" size="sm">{getRoleLabel(role)}</Badge></div>
          </div>
          <p className="mb-3 mt-6 text-xs font-bold uppercase tracking-wide text-secondary-400">Votre compte</p>
          <nav className="space-y-1">{navigation.map((item) => { const Icon = item.icon; const classes = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${item.active ? 'bg-indigo-50 text-indigo-700' : 'text-secondary-500 hover:bg-white hover:text-indigo-700'}`; return item.to ? <Link key={item.label} to={item.to} className={classes}><Icon size={18} />{item.label}</Link> : <div key={item.label} className={classes}><Icon size={18} />{item.label}</div> })}</nav>
          <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-wide text-secondary-400">Espace de travail</p>
          <div className="space-y-1 text-sm text-secondary-500"><Link to="/membres" className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white hover:text-indigo-700"><FiUsers size={18} />Membres</Link><Link to="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white hover:text-indigo-700"><FiSettings size={18} />Paramètres</Link></div>
        </aside>

        <form onSubmit={handleSave} className="min-w-0">
          <header className="border-b border-gray-200 px-6 py-6 sm:px-8"><h1 className="text-3xl font-bold text-secondary-900">Mon compte</h1><p className="mt-1 text-sm text-secondary-500">Gérez votre photo et vos informations personnelles.</p></header>
          <div className="space-y-8 px-6 py-7 sm:px-8">
            <section><h2 className="text-xl font-bold text-secondary-900">Photo de profil</h2><div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center"><Avatar name={`${form.prenom} ${form.nom}`.trim() || user.identifiant} src={user.membre?.photo} size="2xl" className="ring-1 ring-gray-200" /><div><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"><FiCamera size={17} />{isUploading ? 'Téléversement…' : 'Ajouter une image'}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" disabled={isUploading} onChange={handlePhotoUpload} /></label><p className="mt-2 text-xs text-secondary-400">PNG, JPG, WEBP ou GIF · 20 Mo maximum</p></div></div></section>
            <section className="border-t border-gray-100 pt-7"><div className="grid grid-cols-1 gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold text-secondary-700">Prénom<input value={form.prenom} onChange={(event) => setForm({ ...form, prenom: event.target.value })} required className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100" /></label><label className="block text-sm font-semibold text-secondary-700">Nom<input value={form.nom} onChange={(event) => setForm({ ...form, nom: event.target.value })} required className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100" /></label><label className="block text-sm font-semibold text-secondary-700 sm:col-span-2">Adresse courriel<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100" /><span className="mt-2 block text-xs font-normal text-secondary-400">Utilisée pour vous contacter et identifier votre compte.</span></label></div></section>
            <section className="border-t border-gray-100 pt-7"><div><h2 className="flex items-center gap-2 text-xl font-bold text-secondary-900"><FiLock />Mot de passe</h2><p className="mt-1 text-sm text-secondary-500">Facultatif : remplissez ces champs uniquement si vous souhaitez changer votre mot de passe.</p></div><div className="mt-5 rounded-2xl bg-slate-50 p-4 sm:p-5"><div className="grid grid-cols-1 gap-4 md:grid-cols-3"><Input label="Mot de passe actuel" type="password" value={passwordForm.current_password} onChange={(event) => setPasswordForm({ ...passwordForm, current_password: event.target.value })} autoComplete="current-password" /><Input label="Nouveau mot de passe" type="password" value={passwordForm.new_password} onChange={(event) => setPasswordForm({ ...passwordForm, new_password: event.target.value })} autoComplete="new-password" helper="Au moins 8 caractères." /><Input label="Confirmer le nouveau mot de passe" type="password" value={passwordForm.new_password_confirm} onChange={(event) => setPasswordForm({ ...passwordForm, new_password_confirm: event.target.value })} autoComplete="new-password" /></div><div className="mt-4"><Button type="button" variant="outline" onClick={handlePasswordChange} disabled={isChangingPassword || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.new_password_confirm}>{isChangingPassword ? 'Modification…' : 'Modifier le mot de passe'}</Button></div></div></section>
            {message && <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{message.type === 'success' && <FiCheck />}{message.text}</div>}
          </div>
          <footer className="flex justify-end gap-3 border-t border-gray-200 px-6 py-5 sm:px-8"><Button type="button" variant="outline" onClick={resetForm}>Annuler</Button><Button type="submit" disabled={isSaving}>{isSaving ? 'Enregistrement…' : 'Enregistrer'}</Button></footer>
        </form>
      </div>
    </div>
  )
}
