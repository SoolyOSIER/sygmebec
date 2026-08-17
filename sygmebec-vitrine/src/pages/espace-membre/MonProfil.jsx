import { useEffect, useState } from 'react'
import { Calendar, Camera, Edit2, Eye, EyeOff, LockKeyhole, Mail, MapPin, Phone, Save, User, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import SEO from '../../components/common/SEO'
import AnimatedSection from '../../components/ui/AnimatedSection'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { memberApi, toMediaUrl } from '../../services/publicApi'
import { useMemberAuthStore } from '../../store/memberAuthStore'

const emptyProfile = { nom: '', prenom: '', email: '', telephone: '', telephone_secondaire: '', adresse: '', date_naissance: '' }
const profileFromUser = (user) => {
  const membre = user?.membre || {}
  return {
    nom: membre.nom || '', prenom: membre.prenom || '', email: membre.email || '',
    telephone: membre.telephone || '', telephone_secondaire: membre.telephone_secondaire || '',
    adresse: membre.adresse || '', date_naissance: membre.date_naissance || '',
  }
}

function ProfileField({ label, icon: Icon, required = false, ...props }) {
  return <label className="block text-sm font-medium text-gray-700">{label}{required && ' *'}<span className="relative mt-1.5 block">{Icon && <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />}<input {...props} required={required} className={`w-full rounded-xl border border-gray-200 py-2.5 pr-3 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200 disabled:bg-gray-50 ${Icon ? 'pl-10' : 'px-3'}`} /></span></label>
}

function PasswordField({ label, visible, toggle, ...props }) {
  return <label className="block text-sm font-medium text-gray-700">{label}<span className="relative mt-1.5 block"><input {...props} type={visible ? 'text' : 'password'} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 pr-11 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200" /><button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700" aria-label={visible ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}>{visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
}

export default function MonProfil() {
  const { user, accessToken, setSession } = useMemberAuthStore()
  const [formData, setFormData] = useState(emptyProfile)
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', new_password_confirm: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => setFormData(profileFromUser(user)), [user])

  const updateSession = (data) => {
    const apiUser = data?.user || user
    const membre = data?.membre || apiUser?.membre || user?.membre
    setSession({ ...apiUser, membre }, accessToken)
  }

  useEffect(() => {
    if (!user?.membre?.id) return
    let mounted = true
    memberApi.getProfile()
      .then((response) => {
        if (!mounted) return
        updateSession(response.data)
        setFormData(profileFromUser({ ...response.data.user, membre: response.data.membre }))
      })
      .catch(() => {
        if (mounted) toast.error('Impossible de charger les informations complètes du profil.')
      })
    return () => { mounted = false }
  // La fiche détaillée est chargée une fois à l'ouverture du profil.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.membre?.id])

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Veuillez sélectionner une image valide.')
    if (file.size > 20 * 1024 * 1024) return toast.error('La photo ne doit pas dépasser 20 Mo.')
    const payload = new FormData()
    payload.append('photo', file)
    setUploading(true)
    try {
      const response = await memberApi.updateProfile(payload)
      updateSession(response.data)
      toast.success('Photo de profil mise à jour.')
    } catch (error) {
      toast.error(error.response?.data?.photo?.[0] || 'Impossible de mettre à jour la photo.')
    } finally { setUploading(false) }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const hasPasswordInput = Object.values(passwords).some(Boolean)
    if (hasPasswordInput && (!passwords.current_password || !passwords.new_password || !passwords.new_password_confirm)) {
      setPasswordError('Pour modifier le mot de passe, remplissez les trois champs.')
      return
    }
    if (hasPasswordInput && passwords.new_password !== passwords.new_password_confirm) {
      setPasswordError('Les deux nouveaux mots de passe ne correspondent pas.')
      return
    }
    setSaving(true)
    try {
      const response = await memberApi.updateProfile(formData)
      updateSession(response.data)
      if (hasPasswordInput) {
        await memberApi.changePassword(passwords)
        setPasswords({ current_password: '', new_password: '', new_password_confirm: '' })
      }
      setIsEditing(false)
      toast.success(hasPasswordInput ? 'Profil et mot de passe mis à jour.' : 'Informations du profil mises à jour.')
    } catch (error) {
      const message = error.response?.data?.current_password?.[0] || error.response?.data?.new_password?.[0] || 'Une erreur est survenue lors de la mise à jour.'
      setPasswordError(hasPasswordInput ? message : '')
      toast.error(message)
    } finally { setSaving(false) }
  }

  if (!user) return <div className="loading-screen">Chargement de votre profil…</div>
  const membre = user.membre
  if (!membre) return <main className="py-20"><div className="container-custom max-w-xl"><Card><CardContent className="p-7 text-center"><User className="mx-auto h-10 w-10 text-primary-600" /><h1 className="mt-4 text-2xl font-playfair font-bold text-navy-900">Profil membre indisponible</h1><p className="mt-3 text-gray-600">Votre compte n’est pas encore lié à une fiche membre. Contactez un administrateur pour compléter votre profil.</p></CardContent></Card></div></main>

  const fullName = `${membre.prenom || ''} ${membre.nom || ''}`.trim() || user.identifiant
  const photoUrl = toMediaUrl(membre.photo)
  const cancelEdit = () => {
    setFormData(profileFromUser(user))
    setPasswords({ current_password: '', new_password: '', new_password_confirm: '' })
    setPasswordError('')
    setIsEditing(false)
  }
  return <>
    <SEO title="Mon profil - Église Baptiste de l’Espoir" />
    <main className="py-16 md:py-20"><div className="container-custom max-w-5xl">
      <AnimatedSection><div className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><span className="section-subtitle"><User className="h-4 w-4" /> Mon profil</span><h1 className="section-title mt-3">Mes informations personnelles</h1></div><Badge variant="gold" className="px-4 py-2">{user.role_nom || user.role_acces?.nomRole || 'Membre'}</Badge></div></AnimatedSection>
      <div className="grid gap-8 md:grid-cols-[.72fr_1.28fr]">
        <AnimatedSection><Card><CardContent className="p-7 text-center"><div className="relative mx-auto w-fit"><div className="h-28 w-28 overflow-hidden rounded-full bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-lg">{photoUrl ? <img src={photoUrl} alt={fullName} className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-3xl font-bold">{fullName.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>}</div><label className="absolute bottom-0 right-0 grid h-10 w-10 cursor-pointer place-items-center rounded-full border-4 border-white bg-gold-500 text-navy-900 shadow-md transition hover:scale-105" title="Modifier ma photo"><Camera className="h-4 w-4" /><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handlePhotoUpload} disabled={uploading} /></label></div><p className="mt-3 text-xs text-gray-500">{uploading ? 'Téléchargement en cours…' : 'PNG, JPG, WEBP ou GIF · 20 Mo maximum'}</p><h2 className="mt-5 font-playfair text-2xl font-bold text-navy-900">{fullName}</h2><p className="mt-1 text-sm text-gray-500">{membre.email || user.identifiant}</p><div className="mt-6 space-y-3 border-t border-gray-100 pt-5 text-left text-sm text-gray-600"><p className="flex gap-3"><Mail className="h-4 w-4 shrink-0 text-primary-600" /> {membre.email || 'Email non renseigné'}</p><p className="flex gap-3"><Phone className="h-4 w-4 shrink-0 text-primary-600" /> {membre.telephone || 'Téléphone non renseigné'}</p><p className="flex gap-3"><MapPin className="h-4 w-4 shrink-0 text-primary-600" /> {membre.adresse || 'Adresse non renseignée'}</p></div></CardContent></Card></AnimatedSection>
        <AnimatedSection delay={.08}><Card><CardContent className="p-6 md:p-8"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-semibold text-navy-900">Informations et sécurité</h2><p className="mt-1 text-sm text-gray-500">Gardez vos coordonnées à jour.</p></div>{!isEditing && <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Edit2 className="mr-2 h-4 w-4" /> Modifier</Button>}</div>
          <form onSubmit={handleSubmit} className="space-y-5"><fieldset disabled={!isEditing} className="space-y-4 disabled:opacity-75"><div className="grid gap-4 sm:grid-cols-2"><ProfileField label="Nom" name="nom" value={formData.nom} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} required /><ProfileField label="Prénom" name="prenom" value={formData.prenom} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} required /></div><ProfileField label="Email" name="email" value={formData.email} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} type="email" icon={Mail} /><div className="grid gap-4 sm:grid-cols-2"><ProfileField label="Téléphone" name="telephone" value={formData.telephone} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} type="tel" icon={Phone} /><ProfileField label="Téléphone secondaire" name="telephone_secondaire" value={formData.telephone_secondaire} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} type="tel" icon={Phone} /></div><ProfileField label="Adresse" name="adresse" value={formData.adresse} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} icon={MapPin} /><ProfileField label="Date de naissance" name="date_naissance" value={formData.date_naissance} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} type="date" icon={Calendar} /></fieldset>
            {isEditing && <section className="border-t border-gray-100 pt-6"><div className="flex items-start gap-3"><LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-gold-600" /><div><h3 className="font-semibold text-navy-900">Changer mon mot de passe <span className="text-sm font-normal text-gray-500">(facultatif)</span></h3><p className="mt-1 text-sm text-gray-500">Laissez ces champs vides si vous souhaitez seulement modifier vos informations.</p></div></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><PasswordField label="Mot de passe actuel" name="current_password" value={passwords.current_password} onChange={(event) => { setPasswords({ ...passwords, [event.target.name]: event.target.value }); setPasswordError('') }} visible={showPasswords} toggle={() => setShowPasswords((value) => !value)} /><PasswordField label="Nouveau mot de passe" name="new_password" value={passwords.new_password} onChange={(event) => { setPasswords({ ...passwords, [event.target.name]: event.target.value }); setPasswordError('') }} visible={showPasswords} toggle={() => setShowPasswords((value) => !value)} /><PasswordField label="Confirmer le nouveau mot de passe" name="new_password_confirm" value={passwords.new_password_confirm} onChange={(event) => { setPasswords({ ...passwords, [event.target.name]: event.target.value }); setPasswordError('') }} visible={showPasswords} toggle={() => setShowPasswords((value) => !value)} /></div>{passwordError && <p className="mt-3 text-sm text-rose-600">{passwordError}</p>}</section>}
            {isEditing && <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5"><Button type="submit" variant="gold" disabled={saving}>{saving ? 'Enregistrement…' : <><Save className="mr-2 h-4 w-4" /> Enregistrer les modifications</>}</Button><Button type="button" variant="outline" onClick={cancelEdit}><X className="mr-2 h-4 w-4" /> Annuler</Button></div>}
          </form></CardContent></Card></AnimatedSection>
      </div>
    </div></main>
  </>
}
