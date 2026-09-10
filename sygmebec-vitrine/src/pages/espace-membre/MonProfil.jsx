import { t, useTranslation, localizedDate } from '../../i18n'
import { useEffect, useState } from 'react'
import {
  Bell,
  CalendarDays,
  Camera,
  Check,
  CircleUserRound,
  Clock3,
  Eye,
  EyeOff,
  Globe2,
  Laptop,
  LockKeyhole,
  Mail,
  MapPin,
  Monitor,
  Palette,
  Save,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import SEO from '../../components/common/SEO'
import { memberApi, toMediaUrl } from '../../services/publicApi'
import { useMemberAuthStore } from '../../store/memberAuthStore'
import { useTheme } from '../../theme/ThemeProvider'
import { getPasswordPolicyError, getPasswordStrength, PASSWORD_POLICY_SUMMARY } from '../../utils/passwordPolicy'
import { useLanguageStore } from '../../i18n'
import './profileReference.css'

const emptyProfile = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  telephone_secondaire: '',
  adresse: '',
  date_naissance: '',
}

const defaultPreferences = {
  theme: 'light',
  accent: 'blue',
  language: 'fr',
  dailySummary: true,
  pushNotifications: true,
  productNews: false,
}

const accents = [
  { id: 'gold', color: '#b6903f', label: 'Doré' },
  { id: 'green', color: '#1fa060', label: 'Vert' },
  { id: 'blue', color: '#0000ff', label: 'Bleu' },
  { id: 'purple', color: '#7c50d1', label: 'Violet' },
]

const profileFromUser = (user) => {
  const membre = user?.membre || {}
  return {
    nom: membre.nom || '',
    prenom: membre.prenom || '',
    email: membre.email || '',
    telephone: membre.telephone || '',
    telephone_secondaire: membre.telephone_secondaire || '',
    adresse: membre.adresse || '',
    date_naissance: membre.date_naissance || '',
  }
}

function readPreferences(theme) {
  if (typeof window === 'undefined') return { ...defaultPreferences, theme }
  try {
    const stored = JSON.parse(localStorage.getItem('sygmebec-member-preferences') || '{}')
    return {
      ...defaultPreferences,
      ...stored,
      theme: ['light', 'dark'].includes(stored.theme) ? stored.theme : theme,
    }
  } catch {
    return { ...defaultPreferences, theme }
  }
}

function formatDate(value, options) {
  if (!value) return 'Non renseignée'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Non renseignée'
  return localizedDate(date, options)
}

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'M'
}

function currentBrowserName() {
  if (typeof navigator === 'undefined') return 'Navigateur actuel'
  if (/Edg\//.test(navigator.userAgent)) return 'Microsoft Edge'
  if (/Firefox\//.test(navigator.userAgent)) return 'Firefox'
  if (/Chrome\//.test(navigator.userAgent)) return 'Chrome'
  if (/Safari\//.test(navigator.userAgent)) return 'Safari'
  return 'Navigateur actuel'
}

function AccountField({ label, icon: Icon, helper, required = false, className = '', ...inputProps }) {
  useTranslation()

  const fieldClass = ['profile-reference__field', className].filter(Boolean).join(' ')
  const inputClass = ['profile-reference__input', Icon ? 'has-icon' : ''].filter(Boolean).join(' ')

  return (
    <label className={fieldClass}>
      <span>{t(label)}{t(required ? ' *' : '')}</span>
      <span className="profile-reference__input-wrap">
        {Icon ? <Icon aria-hidden="true" /> : null}
        <input {...inputProps} required={required} className={inputClass} />
      </span>
      {helper ? <span className="profile-reference__field-hint">{t(helper)}</span> : null}
    </label>
  )
}

function PasswordField({ label, name, value, onChange, visible, onToggle, autoComplete, showStrength = false }) {
  useTranslation()

  const strength = getPasswordStrength(value)

  return (
    <label className="profile-reference__field">
      <span>{t(label)}</span>
      <span className="profile-reference__input-wrap">
        <input
          className="profile-reference__input has-button"
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />
        <button
          className="profile-reference__eye"
          type="button"
          onClick={onToggle}
          aria-label={t(visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe')}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
      {showStrength ? (
        <>
          <span className="profile-reference__strength" aria-label={t(strength.label)}>
            {[1, 2, 3, 4, 5].map((level) => (
              <i
                key={level}
                className={[
                  'profile-reference__strength-bar',
                  strength.score >= level ? 'is-active' : '',
                  strength.isCompliant ? 'is-strong' : '',
                ].filter(Boolean).join(' ')}
              />
            ))}
          </span>
          <span className="profile-reference__strength-label">{t(strength.label)}</span>
        </>
      ) : null}
    </label>
  )
}

function ProfileSwitch({ icon: Icon, label, description, checked, onChange, disabled = false }) {
  useTranslation()

  return (
    <div className="profile-reference__switch-row">
      <div className="profile-reference__switch-copy">
        <div className="profile-reference__switch-title">{Icon ? <Icon aria-hidden="true" /> : null}{t(label)}</div>
        <p className="profile-reference__switch-description">{t(description)}</p>
      </div>
      <label className={['profile-reference__switch', disabled ? 'is-disabled' : ''].filter(Boolean).join(' ')}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange?.(event.target.checked)}
          disabled={disabled}
          aria-label={t(label)}
        />
        <span className="profile-reference__switch-track"><span className="profile-reference__switch-thumb" /></span>
      </label>
    </div>
  )
}

function ProgressRing({ value, label, color }) {
  useTranslation()

  const normalizedValue = Math.max(0, Math.min(100, value))
  const circumference = 138.23
  const dashArray = [Math.round((circumference * normalizedValue) * 100) / 100, circumference].join(' ')

  return (
    <div className="profile-reference__ring">
      <svg viewBox="0 0 54 54" aria-hidden="true">
        <circle className="profile-reference__ring-track" cx="27" cy="27" r="22" />
        <circle
          className="profile-reference__ring-value"
          cx="27"
          cy="27"
          r="22"
          style={{ stroke: color, strokeDasharray: dashArray }}
        />
      </svg>
      <span className="profile-reference__ring-label">{t(label)}</span>
    </div>
  )
}

function MiniCard({ label, icon: Icon, children, success = false }) {
  useTranslation()

  return (
    <div className="profile-reference__mini-card">
      <div className="profile-reference__mini-label">{t(label)}</div>
      <div className={['profile-reference__mini-value', success ? 'is-success' : ''].filter(Boolean).join(' ')}>
        {Icon ? <Icon aria-hidden="true" /> : null}
        <span>{t(children)}</span>
      </div>
    </div>
  )
}

export default function MonProfil() {
  useTranslation()

  const { user, accessToken, setSession } = useMemberAuthStore()
  const { theme, setTheme } = useTheme()
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)
  const [activeTab, setActiveTab] = useState('profil')
  const [formData, setFormData] = useState(emptyProfile)
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', new_password_confirm: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [preferences, setPreferences] = useState(() => ({ ...readPreferences(theme), language }))
  const [savedPreferences, setSavedPreferences] = useState(() => ({ ...readPreferences(theme), language }))

  useEffect(() => {
    setPreferences((current) => ({ ...current, language }))
  }, [language])

  useEffect(() => setFormData(profileFromUser(user)), [user])

  const updateSession = (data) => {
    const apiUser = data?.user || user
    const membre = data?.membre || apiUser?.membre || user?.membre
    setSession({ ...apiUser, membre }, accessToken)
  }

  useEffect(() => {
    if (!user?.id) return undefined
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
  // Le profil détaillé est chargé une fois à l'ouverture de la page.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('La photo ne doit pas dépasser 20 Mo.')
      return
    }

    const payload = new FormData()
    payload.append('photo', file)
    setUploading(true)
    try {
      const response = await memberApi.updateProfile(payload)
      updateSession(response.data)
      toast.success('Photo de profil mise à jour.')
    } catch (error) {
      toast.error(error.response?.data?.photo?.[0] || 'Impossible de mettre à jour la photo.')
    } finally {
      setUploading(false)
    }
  }

  const handleProfileSave = async (event) => {
    event.preventDefault()
    setSavingProfile(true)
    try {
      const response = await memberApi.updateProfile(formData)
      updateSession(response.data)
      toast.success('Informations du profil mises à jour.')
    } catch (error) {
      const detail = error.response?.data
      const fieldError = detail && typeof detail === 'object'
        ? Object.values(detail).find((value) => Array.isArray(value))
        : null
      toast.error(fieldError?.[0] || detail?.detail || 'Impossible de mettre à jour le profil.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    if (!passwords.current_password || !passwords.new_password || !passwords.new_password_confirm) {
      setPasswordError('Remplissez les trois champs pour modifier le mot de passe.')
      return
    }
    if (passwords.new_password !== passwords.new_password_confirm) {
      setPasswordError('Les deux nouveaux mots de passe ne correspondent pas.')
      return
    }
    const policyError = getPasswordPolicyError(passwords.new_password)
    if (policyError) {
      setPasswordError(policyError)
      return
    }

    setSavingPassword(true)
    setPasswordError('')
    try {
      await memberApi.changePassword(passwords)
      setPasswords({ current_password: '', new_password: '', new_password_confirm: '' })
      toast.success('Mot de passe modifié avec succès.')
    } catch (error) {
      const detail = error.response?.data
      const fieldError = detail && typeof detail === 'object'
        ? Object.values(detail).find((value) => Array.isArray(value))
        : null
      setPasswordError(fieldError?.[0] || detail?.detail || 'Impossible de modifier le mot de passe.')
    } finally {
      setSavingPassword(false)
    }
  }

  const resetProfile = () => setFormData(profileFromUser(user))

  const updatePreference = (key, value) => {
    setPreferences((current) => ({ ...current, [key]: value }))
    if (key === 'language') setLanguage(value)
  }

  const chooseTheme = (nextTheme) => {
    updatePreference('theme', nextTheme)
    setTheme(nextTheme)
  }

  const savePreferences = () => {
    try {
      localStorage.setItem('sygmebec-member-preferences', JSON.stringify(preferences))
    } catch {
    }
    setSavedPreferences(preferences)
    toast.success('Préférences enregistrées sur cet appareil.')
  }

  const cancelPreferences = () => {
    setPreferences(savedPreferences)
    setTheme(savedPreferences.theme)
    setLanguage(savedPreferences.language)
  }

  if (!user) return <div className="loading-screen">{t("Chargement de votre profil…")}</div>

  const membre = user.membre
  if (!membre) {
    return (
      <main className="py-20">
        <div className="container-custom max-w-xl">
          <section className="form-card text-center">
            <User className="mx-auto h-10 w-10 text-primary-600" />
            <h1 className="mt-4 text-2xl font-bold text-navy-900">{t("Profil membre indisponible")}</h1>
            <p className="mt-3 text-gray-600">{t("Votre compte n’est pas encore lié à une fiche membre. Contactez un administrateur pour compléter votre profil.")}</p>
          </section>
        </div>
      </main>
    )
  }

  const fullName = [membre.prenom, membre.nom].filter(Boolean).join(' ') || user.identifiant
  const photoUrl = toMediaUrl(membre.photo)
  const roleName = user.role_nom || user.role_acces?.nomRole || 'Membre'
  const accountCreatedAt = formatDate(user.date_creation_compte, { day: '2-digit', month: 'long', year: 'numeric' })
  const accountYear = user.date_creation_compte
    ? formatDate(user.date_creation_compte, { year: 'numeric' })
    : 'date non renseignée'
  const lastAccess = formatDate(user.dernier_acces, { day: '2-digit', month: 'short' })
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Haïti (UTC-5)'
  const profileItems = [
    formData.prenom,
    formData.nom,
    formData.email,
    formData.telephone,
    formData.telephone_secondaire,
    formData.adresse,
    formData.date_naissance,
    photoUrl,
  ]
  const completion = Math.round((profileItems.filter(Boolean).length / profileItems.length) * 100)
  const selectedAccent = accents.find((accent) => accent.id === preferences.accent) || accents[0]
  const rootStyle = { '--profile-reference-accent': selectedAccent.color }
  const tabs = [
    { id: 'profil', label: 'Profil', icon: User },
    { id: 'securite', label: 'Sécurité', icon: ShieldCheck },
    { id: 'preferences', label: 'Préférences', icon: Palette },
  ]

  return (
    <>
      <SEO title={t("Mon profil - Église Baptiste de l’Espoir")} />
      <section className="profile-reference" style={rootStyle}>
        <div className="profile-reference__container">
          <header className="profile-reference__hero">
            <span className="profile-reference__dots" />
            <div className="profile-reference__hero-avatar-wrap">
              <div className="profile-reference__hero-avatar">
                {photoUrl ? <img src={photoUrl} alt={t(fullName)} /> : <span>{t(initials(fullName))}</span>}
              </div>
              <label className="profile-reference__camera" title={t("Modifier ma photo")}>
                <Camera size={14} />
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            </div>
            <div className="profile-reference__hero-content">
              <p className="profile-reference__eyebrow">{t("Paramètres du compte")}</p>
              <h1>{t(fullName)}</h1>
              <p className="profile-reference__hero-subtitle">{t(membre.email || user.identifiant)}</p>
              <div className="profile-reference__tags">
                <span className="profile-reference__tag"><CircleUserRound />{t(roleName)}</span>
                <span className="profile-reference__tag"><CalendarDays />{t("Membre depuis ")}{t(accountYear)}</span>
                <span className="profile-reference__tag"><ShieldCheck />{t("2FA indisponible")}</span>
              </div>
              <div className="profile-reference__stats">
                <div className="profile-reference__stat">
                  <ProgressRing value={completion} label={t(String(completion) + '%')} color={selectedAccent.color} />
                  <div><div className="profile-reference__stat-number">{t(completion)} %</div><div className="profile-reference__stat-label">{t("Profil complété")}</div></div>
                </div>
                <div className="profile-reference__stat">
                  <ProgressRing value={100} label={t("1")} color="#1fa060" />
                  <div><div className="profile-reference__stat-number">{t("1 session")}</div><div className="profile-reference__stat-label">{t("Appareil actuel")}</div></div>
                </div>
                <div className="profile-reference__stat">
                  <ProgressRing value={user.dernier_acces ? 100 : 0} label={t(user.dernier_acces ? '✓' : '—')} color="#7c50d1" />
                  <div><div className="profile-reference__stat-number">{t(lastAccess)}</div><div className="profile-reference__stat-label">{t("Dernier accès connu")}</div></div>
                </div>
              </div>
            </div>
          </header>

          <nav className="profile-reference__tabs" aria-label={t("Paramètres du profil")} role="tablist">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  className={['profile-reference__tab', active ? 'is-active' : ''].filter(Boolean).join(' ')}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon aria-hidden="true" />{t(tab.label)}
                </button>
              )
            })}
          </nav>

          {activeTab === 'profil' ? (
            <form className="profile-reference__tab-panel" onSubmit={handleProfileSave}>
              <div className="profile-reference__grid">
                <div>
                  <section className="profile-reference__panel">
                    <h2 className="profile-reference__panel-title"><Camera />{t("Photo de profil")}</h2>
                    <p className="profile-reference__panel-subtitle">{t("Visible par les membres de l’espace de travail.")}</p>
                    <div className="profile-reference__photo-row">
                      <div className="profile-reference__photo-avatar-wrap">
                        <div className="profile-reference__photo-avatar">
                          {photoUrl ? <img src={photoUrl} alt={t(fullName)} /> : <span>{t(initials(fullName))}</span>}
                        </div>
                      </div>
                      <div>
                        <label className="profile-reference__photo-upload">
                          <Camera size={15} />
                          {t(uploading ? 'Téléversement…' : 'Ajouter une image')}
                          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handlePhotoUpload} disabled={uploading} />
                        </label>
                        <p className="profile-reference__photo-hint">{t("PNG, JPG, WEBP ou GIF · 20 Mo maximum")}</p>
                      </div>
                    </div>
                  </section>

                  <section className="profile-reference__panel">
                    <h2 className="profile-reference__panel-title"><User />{t("Informations personnelles")}</h2>
                    <p className="profile-reference__panel-subtitle">{t("Utilisées pour vous identifier dans l’espace de travail.")}</p>
                    <div className="profile-reference__field-grid">
                      <AccountField label={t("Prénom")} name="prenom" value={formData.prenom} onChange={(event) => setFormData({ ...formData, prenom: event.target.value })} required />
                      <AccountField label={t("Nom")} name="nom" value={formData.nom} onChange={(event) => setFormData({ ...formData, nom: event.target.value })} required />
                      <AccountField label={t("Adresse courriel")} type="email" icon={Mail} className="profile-reference__field--wide" name="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} helper="Utilisée pour vous contacter et identifier votre compte." />
                      <AccountField label={t("Téléphone")} type="tel" icon={Smartphone} name="telephone" value={formData.telephone} onChange={(event) => setFormData({ ...formData, telephone: event.target.value })} />
                      <AccountField label={t("Téléphone secondaire")} type="tel" icon={Smartphone} name="telephone_secondaire" value={formData.telephone_secondaire} onChange={(event) => setFormData({ ...formData, telephone_secondaire: event.target.value })} />
                      <AccountField label={t("Adresse")} icon={MapPin} className="profile-reference__field--wide" name="adresse" value={formData.adresse} onChange={(event) => setFormData({ ...formData, adresse: event.target.value })} />
                      <AccountField label={t("Date de naissance")} type="date" icon={CalendarDays} name="date_naissance" value={formData.date_naissance} onChange={(event) => setFormData({ ...formData, date_naissance: event.target.value })} />
                    </div>
                  </section>
                </div>

                <div>
                  <section className="profile-reference__panel">
                    <h2 className="profile-reference__panel-title"><Clock3 />{t("Aperçu du compte")}</h2>
                    <div className="profile-reference__mini-grid">
                      <MiniCard label={t("Rôle")} icon={CircleUserRound}>{t(roleName)}</MiniCard>
                      <MiniCard label={t("Statut")} icon={Check} success>{t(user.is_active === false ? 'En attente' : 'Actif')}</MiniCard>
                      <MiniCard label={t("Créé le")} icon={CalendarDays}>{t(accountCreatedAt)}</MiniCard>
                      <MiniCard label={t("Fuseau horaire")} icon={Clock3}>{t(timeZone)}</MiniCard>
                    </div>
                  </section>
                  <section className="profile-reference__panel">
                    <h2 className="profile-reference__panel-title"><ShieldCheck />{t("Vérification")}</h2>
                    <div className="profile-reference__verification">
                      <Mail />
                      <p>{t("Le statut de vérification de l’adresse e-mail n’est pas communiqué par le serveur. Aucune action n’est requise ici.")}</p>
                    </div>
                  </section>
                </div>
              </div>
              <div className="profile-reference__action-bar">
                <button className="profile-reference__cancel" type="button" onClick={resetProfile}><X size={15} />{t("Annuler")}</button>
                <button className="profile-reference__save" type="submit" disabled={savingProfile}><Save size={15} />{t(savingProfile ? 'Enregistrement…' : 'Enregistrer')}</button>
              </div>
            </form>
          ) : null}

          {activeTab === 'securite' ? (
            <section className="profile-reference__tab-panel">
              <div className="profile-reference__grid">
                <div>
                  <form className="profile-reference__panel" onSubmit={handlePasswordChange}>
                    <h2 className="profile-reference__panel-title"><LockKeyhole />{t("Changer le mot de passe")}</h2>
                    <p className="profile-reference__panel-subtitle">{t(PASSWORD_POLICY_SUMMARY)}</p>
                    <div className="profile-reference__password-grid">
                      <PasswordField label={t("Mot de passe actuel")} name="current_password" value={passwords.current_password} onChange={(event) => { setPasswords({ ...passwords, current_password: event.target.value }); setPasswordError('') }} visible={showPasswords.current} onToggle={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} autoComplete="current-password" />
                      <PasswordField label={t("Nouveau mot de passe")} name="new_password" value={passwords.new_password} onChange={(event) => { setPasswords({ ...passwords, new_password: event.target.value }); setPasswordError('') }} visible={showPasswords.next} onToggle={() => setShowPasswords({ ...showPasswords, next: !showPasswords.next })} autoComplete="new-password" showStrength />
                      <PasswordField label={t("Confirmer")} name="new_password_confirm" value={passwords.new_password_confirm} onChange={(event) => { setPasswords({ ...passwords, new_password_confirm: event.target.value }); setPasswordError('') }} visible={showPasswords.confirm} onToggle={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} autoComplete="new-password" />
                    </div>
                    {passwordError ? <p className="profile-reference__error">{t(passwordError)}</p> : null}
                    <button className="profile-reference__password-submit" type="submit" disabled={savingPassword || !passwords.current_password || !getPasswordStrength(passwords.new_password).isCompliant || !passwords.new_password_confirm}><LockKeyhole size={14} />{t(savingPassword ? 'Modification…' : 'Modifier le mot de passe')}</button>
                  </form>

                  <section className="profile-reference__panel">
                    <h2 className="profile-reference__panel-title"><ShieldCheck />{t("Protection du compte")}</h2>
                    <ProfileSwitch icon={ShieldCheck} label={t("Authentification à deux facteurs")} description={t("Cette protection sera disponible lorsqu’elle sera reliée au serveur.")} checked={false} disabled />
                    <ProfileSwitch icon={Bell} label={t("Alertes de connexion")} description={t("Les alertes de connexion ne sont pas encore configurables pour ce compte.")} checked={false} disabled />
                  </section>
                </div>

                <div>
                  <section className="profile-reference__panel">
                    <h2 className="profile-reference__panel-title"><Monitor />{t("Sessions actives")}</h2>
                    <p className="profile-reference__panel-subtitle">{t("Seule la session de cet appareil peut être affichée par le serveur actuel.")}</p>
                    <div className="profile-reference__session">
                      <span className="profile-reference__session-icon"><Laptop /></span>
                      <div className="profile-reference__session-copy">
                        <div className="profile-reference__session-title">{t(currentBrowserName())} <span className="profile-reference__current">{t("Actuelle")}</span></div>
                        <p className="profile-reference__session-subtitle">{t("Cette session est active sur l’appareil que vous utilisez.")}</p>
                      </div>
                    </div>
                    <div className="profile-reference__session">
                      <span className="profile-reference__session-icon"><Smartphone /></span>
                      <div className="profile-reference__session-copy">
                        <div className="profile-reference__session-title">{t("Autres appareils")}</div>
                        <p className="profile-reference__session-subtitle">{t("La liste et la déconnexion à distance ne sont pas encore disponibles.")}</p>
                      </div>
                      <span className="profile-reference__session-action">{t("Indisponible")}</span>
                    </div>
                  </section>

                  <section className="profile-reference__danger">
                    <h2 className="profile-reference__panel-title"><ShieldAlert />{t("Zone sensible")}</h2>
                    <p className="profile-reference__panel-subtitle">{t("La suppression autonome du compte n’est pas activée. Contactez l’administration si cette action est nécessaire.")}</p>
                    <button className="profile-reference__danger-button" type="button" disabled title={t("Cette action nécessite une fonctionnalité serveur")}><Trash2 size={14} />{t("Supprimer mon compte")}</button>
                  </section>
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === 'preferences' ? (
            <section className="profile-reference__tab-panel">
              <div className="profile-reference__grid">
                <section className="profile-reference__panel">
                  <h2 className="profile-reference__panel-title"><Globe2 />{t("Apparence")}</h2>
                  <div className="profile-reference__preference-row">
                    <div><div className="profile-reference__preference-label">{t("Thème")}</div><p className="profile-reference__preference-subtitle">{t("Appliqué à la vitrine sur cet appareil.")}</p></div>
                    <div className="profile-reference__segmented">
                      <button className={['profile-reference__segment', preferences.theme === 'light' ? 'is-active' : ''].filter(Boolean).join(' ')} type="button" onClick={() => chooseTheme('light')}>{t("Clair")}</button>
                      <button className="profile-reference__segment" type="button" disabled title={t("Le thème système n’est pas encore disponible")}>{t("Système")}</button>
                      <button className={['profile-reference__segment', preferences.theme === 'dark' ? 'is-active' : ''].filter(Boolean).join(' ')} type="button" onClick={() => chooseTheme('dark')}>{t("Sombre")}</button>
                    </div>
                  </div>
                  <div className="profile-reference__preference-row">
                    <div><div className="profile-reference__preference-label">{t("Couleur d’accent")}</div><p className="profile-reference__preference-subtitle">{t("Appliquée à cette page sur cet appareil.")}</p></div>
                    <div className="profile-reference__swatches">
                      {accents.map((accent) => (
                        <button
                          key={accent.id}
                          className={['profile-reference__swatch', preferences.accent === accent.id ? 'is-active' : ''].filter(Boolean).join(' ')}
                          style={{ background: accent.color }}
                          type="button"
                          aria-label={t('Utiliser la couleur ' + accent.label)}
                          aria-pressed={preferences.accent === accent.id}
                          onClick={() => updatePreference('accent', accent.id)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="profile-reference__preference-row">
                    <div><div className="profile-reference__preference-label">{t("Langue")}</div><p className="profile-reference__preference-subtitle">{t("La langue s’applique immédiatement à toute la vitrine.")}</p></div>
                    <div className="profile-reference__segmented">
                      {[['fr', 'Français'], ['ht', 'Kreyòl'], ['en', 'English']].map(([code, label]) => <button className={['profile-reference__segment', language === code ? 'is-active' : ''].filter(Boolean).join(' ')} type="button" key={code} onClick={() => updatePreference('language', code)}>{t(label)}</button>)}
                    </div>
                  </div>
                </section>

                <section className="profile-reference__panel">
                  <h2 className="profile-reference__panel-title"><Bell />{t("Notifications rapides")}</h2>
                  <ProfileSwitch label={t("Résumé quotidien")} description={t("Préférence enregistrée sur cet appareil.")} checked={preferences.dailySummary} onChange={(checked) => updatePreference('dailySummary', checked)} />
                  <ProfileSwitch label={t("Notifications push")} description={t("Préférence enregistrée sur cet appareil.")} checked={preferences.pushNotifications} onChange={(checked) => updatePreference('pushNotifications', checked)} />
                  <ProfileSwitch label={t("Actualités produit")} description={t("Préférence enregistrée sur cet appareil.")} checked={preferences.productNews} onChange={(checked) => updatePreference('productNews', checked)} />
                  <p className="profile-reference__local-note">{t("Ces réglages sont locaux à ce navigateur. Ils ne modifient pas encore les notifications envoyées par le serveur.")}</p>
                </section>
              </div>
              <div className="profile-reference__action-bar">
                <button className="profile-reference__cancel" type="button" onClick={cancelPreferences}><X size={15} />{t("Annuler")}</button>
                <button className="profile-reference__save" type="button" onClick={savePreferences}><Save size={15} />{t("Enregistrer")}</button>
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </>
  )
}
