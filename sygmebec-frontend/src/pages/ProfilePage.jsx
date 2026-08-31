import { useEffect, useMemo, useState } from 'react'
import {
  FiAlertTriangle,
  FiBell,
  FiCalendar,
  FiCamera,
  FiCheck,
  FiClock,
  FiEye,
  FiEyeOff,
  FiGrid,
  FiInfo,
  FiLock,
  FiMail,
  FiMapPin,
  FiMonitor,
  FiMoon,
  FiPhone,
  FiSave,
  FiShield,
  FiSliders,
  FiSun,
  FiTrash2,
  FiUser,
  FiX,
} from 'react-icons/fi'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { getMediaUrl } from '../utils/media'
import {
  getPasswordPolicyError,
  getPasswordStrength,
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_SUMMARY,
} from '../utils/passwordPolicy'
import { getRoleLabel } from '../utils/roleHierarchy'
import useT from '../i18n/useT'
import './profileReference.css'

const PREFERENCES_KEY = 'sygmebec-profile-preferences'

const accentColors = {
  gold: '#b6903f',
  green: '#1fa060',
  blue: '#3768d6',
  purple: '#7c50d1',
}

const getDateValue = (value) => (value ? String(value).slice(0, 10) : '')

const getProfileForm = (user) => {
  const membre = user?.membre || {}
  const isAdministrator = role === 'ADMINISTRATEUR'
  return {
    prenom: membre.prenom || '',
    nom: membre.nom || '',
    email: membre.email || '',
    telephone: membre.telephone || user?.telephone || '',
    telephone_secondaire: membre.telephone_secondaire || '',
    adresse: membre.adresse || '',
    date_naissance: getDateValue(membre.date_naissance),
  }
}

const getStoredPreferences = (theme, language) => {
  const defaults = {
    theme: theme || 'system',
    accent: 'gold',
    language: ['fr', 'ht', 'en'].includes(language) ? language : 'fr',
    dailySummary: true,
    pushNotifications: true,
    productNews: false,
  }

  try {
    const stored = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}')
    return { ...defaults, ...stored, language: ['fr', 'ht', 'en'].includes(stored.language) ? stored.language : defaults.language }
  } catch {
    return defaults
  }
}

const formatDate = (value, options = { day: '2-digit', month: 'long', year: 'numeric' }) => {
  if (!value) return 'Non renseigné'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Non renseigné'
  return new Intl.DateTimeFormat('fr-FR', options).format(date)
}

const getInitials = (name) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  return (parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.[0] || '?').toUpperCase()
}

function AccountAvatar({ name, photo, className = '' }) {
  if (photo) {
    return <img className={className} src={getMediaUrl(photo)} alt={`Photo de profil de ${name}`} />
  }

  return <span className={`${className} pr-avatar-fallback`}>{getInitials(name)}</span>
}

function HeroRing({ value, label, title, subtitle, color }) {
  const circumference = 2 * Math.PI * 22
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100)

  return (
    <div className="pr-ring-stat">
      <div className="pr-ring-wrap" aria-label={`${title} : ${subtitle}`}>
        <svg viewBox="0 0 54 54" aria-hidden="true">
          <circle className="pr-ring-track" cx="27" cy="27" r="22" />
          <circle
            className="pr-ring-value"
            cx="27"
            cy="27"
            r="22"
            stroke={color}
            style={{ strokeDasharray: `${(safeValue / 100) * circumference} ${circumference}` }}
          />
        </svg>
        <span className="pr-ring-label">{label}</span>
      </div>
      <div className="pr-ring-copy">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  )
}

function LocalSwitch({ icon: Icon, label, description, checked, onChange, unavailable = false }) {
  return (
    <div className={`pr-switch-row${unavailable ? ' pr-switch-row--unavailable' : ''}`}>
      <div>
        <div className="pr-switch-label">{Icon && <Icon />}{label}</div>
        {description && <div className="pr-switch-description">{description}</div>}
        {unavailable && <span className="pr-unavailable-label">Indisponible : aucune API</span>}
      </div>
      <label className="pr-switch">
        <input type="checkbox" checked={checked} onChange={onChange} disabled={unavailable} />
        <span className="pr-switch-track"><span className="pr-switch-thumb" /></span>
      </label>
    </div>
  )
}

export default function ProfilePage() {
  const { user, role, setUser } = useAuthStore()
  const themePreference = useUIStore((state) => state.themePreference)
  const language = useUIStore((state) => state.language)
  const setTheme = useUIStore((state) => state.setTheme)
  const setLanguage = useUIStore((state) => state.setLanguage)
  const { t } = useT()
  const [activeTab, setActiveTab] = useState('profil')
  const [form, setForm] = useState(() => getProfileForm(user))
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [message, setMessage] = useState(null)
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', new_password_confirm: '' })
  const [passwordVisibility, setPasswordVisibility] = useState({ current: false, next: false, confirm: false })
  const [preferences, setPreferences] = useState(() => getStoredPreferences(themePreference, language))

  useEffect(() => {
    setForm(getProfileForm(user))
  }, [user])

  const membre = user?.membre || {}
  const displayName = `${form.prenom} ${form.nom}`.trim() || membre.nom_complet || membre.nom || user?.identifiant || 'Compte'
  const photo = membre.photo
  const createdAt = user?.date_creation_compte || user?.date_joined || user?.created_at
  const profileCompletion = useMemo(() => {
    const values = [form.prenom, form.nom, form.email, form.telephone, form.adresse, form.date_naissance, photo]
    return Math.round((values.filter((value) => String(value || '').trim()).length / values.length) * 100)
  }, [form, photo])
  const passwordStrength = getPasswordStrength(passwordForm.new_password)
  const strengthColors = { weak: '#c94f43', fair: '#d9b876', good: '#3768d6', strong: '#1fa060' }
  const strength = { label: passwordStrength.label, color: strengthColors[passwordStrength.tone] || '#a39e91' }

  if (!user) return <div className="py-20 text-center text-secondary-400">Chargement du profil…</div>

  const updateLocalUser = (data) => {
    const updatedMembre = { ...membre, ...data }
    updatedMembre.nom_complet = `${updatedMembre.prenom || ''} ${updatedMembre.nom || ''}`.trim()
    setUser({ ...user, membre: updatedMembre })
  }

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un fichier image.' })
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La photo ne doit pas dépasser 20 Mo.' })
      return
    }

    const formData = new FormData()
    formData.append('photo', file)
    setIsUploading(true)
    setMessage(null)
    try {
      const { data } = await authApi.updateMyProfile(formData)
      updateLocalUser(data.membre || data)
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
      updateLocalUser(data.membre || data)
      setMessage({ type: 'success', text: 'Informations du profil enregistrées.' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Impossible d’enregistrer les modifications.' })
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setForm(getProfileForm(user))
    setMessage(null)
  }

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    const passwordPolicyError = getPasswordPolicyError(passwordForm.new_password)
    if (passwordPolicyError) {
      setMessage({ type: 'error', text: passwordPolicyError })
      return
    }
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

  const handleSavePreferences = (event) => {
    event.preventDefault()
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
    setTheme(preferences.theme)
    setLanguage(preferences.language)
    setMessage({ type: 'success', text: t('preferences.saved') })
  }

  const resetPreferences = () => {
    setPreferences(getStoredPreferences(themePreference, language))
    setMessage(null)
  }

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const setPreference = (field, value) => setPreferences((current) => ({ ...current, [field]: value }))

  return (
    <main className="profile-reference" style={{ '--pr-accent': accentColors[preferences.accent] || accentColors.gold }}>
      <section className="pr-hero">
        <div className="pr-hero-dots" />
        <div className="pr-hero-avatar-wrap">
          <AccountAvatar name={displayName} photo={photo} className="pr-hero-avatar" />
          <label className="pr-hero-camera" title="Modifier la photo de profil">
            <FiCamera aria-hidden="true" />
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={isUploading} onChange={handlePhotoUpload} />
          </label>
        </div>
        <div className="pr-hero-content">
          <p className="pr-eyebrow">Paramètres du compte</p>
          <h1>{displayName}</h1>
          <p className="pr-hero-email">{form.email || 'Adresse e-mail non renseignée'}</p>
          <div className="pr-hero-tags">
            <span><FiShield />{getRoleLabel(role)}</span>
            <span><FiCalendar />{createdAt ? `Membre depuis ${formatDate(createdAt, { month: 'short', year: 'numeric' })}` : 'Date de création non renseignée'}</span>
            <span className="pr-tag-muted"><FiInfo />2FA non disponible</span>
          </div>
          <div className="pr-rings" aria-label="Résumé du compte">
            <HeroRing value={profileCompletion} label={`${profileCompletion}%`} title={`${profileCompletion} %`} subtitle="Profil complété" color="var(--pr-accent)" />
            <HeroRing value={0} label="—" title="Sessions" subtitle="Non disponibles" color="#1fa060" />
            <HeroRing value={0} label="API" title="Mot de passe" subtitle="Géré via l’API" color="#7c50d1" />
          </div>
        </div>
      </section>

      <nav className="pr-tabs" aria-label="Sections du compte">
        <button type="button" className={activeTab === 'profil' ? 'is-active' : ''} onClick={() => setActiveTab('profil')}><FiUser />Profil</button>
        <button type="button" className={activeTab === 'securite' ? 'is-active' : ''} onClick={() => setActiveTab('securite')}><FiShield />{isAdministrator ? 'Sécurité administrateur' : 'Sécurité'}</button>
        <button type="button" className={activeTab === 'preferences' ? 'is-active' : ''} onClick={() => setActiveTab('preferences')}><FiGrid />Préférences</button>
      </nav>

      {message && (
        <div className={`pr-message pr-message--${message.type}`} role="status">
          {message.type === 'success' ? <FiCheck /> : <FiAlertTriangle />}
          {message.text}
        </div>
      )}

      {activeTab === 'profil' && (
        <form onSubmit={handleSave} className="pr-tab-panel">
          <div className="pr-grid pr-grid--profile">
            <div>
              <section className="pr-panel">
                <h2><FiCamera />Photo de profil</h2>
                <p className="pr-panel-subtitle">Cette photo sera visible dans les espaces réservés aux membres.</p>
                <div className="pr-photo-row">
                  <AccountAvatar name={displayName} photo={photo} className="pr-photo-avatar" />
                  <div>
                    <label className="pr-photo-button">
                      <FiCamera />{isUploading ? 'Téléversement…' : 'Ajouter une image'}
                      <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={isUploading} onChange={handlePhotoUpload} />
                    </label>
                    <p className="pr-photo-hint">PNG, JPG, WEBP ou GIF · 20 Mo maximum</p>
                  </div>
                </div>
              </section>

              <section className="pr-panel">
                <h2><FiUser />Informations personnelles</h2>
                <p className="pr-panel-subtitle">Mettez à jour les coordonnées utilisées par votre compte.</p>
                <div className="pr-fields-grid">
                  <label className="pr-field">
                    <span>Prénom</span>
                    <span className="pr-input-wrap"><FiUser /><input value={form.prenom} onChange={(event) => setField('prenom', event.target.value)} required /></span>
                  </label>
                  <label className="pr-field">
                    <span>Nom</span>
                    <span className="pr-input-wrap"><FiUser /><input value={form.nom} onChange={(event) => setField('nom', event.target.value)} required /></span>
                  </label>
                  <label className="pr-field pr-field--wide">
                    <span>Adresse courriel</span>
                    <span className="pr-input-wrap"><FiMail /><input type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} /></span>
                    <small>Utilisée pour vous contacter et identifier votre compte.</small>
                  </label>
                  <label className="pr-field">
                    <span>Téléphone <em>(optionnel)</em></span>
                    <span className="pr-input-wrap"><FiPhone /><input type="tel" value={form.telephone} onChange={(event) => setField('telephone', event.target.value)} placeholder="+509 __ __ __ __" /></span>
                  </label>
                  <label className="pr-field">
                    <span>Téléphone secondaire <em>(optionnel)</em></span>
                    <span className="pr-input-wrap"><FiPhone /><input type="tel" value={form.telephone_secondaire} onChange={(event) => setField('telephone_secondaire', event.target.value)} /></span>
                  </label>
                  <label className="pr-field pr-field--wide">
                    <span>Adresse <em>(optionnel)</em></span>
                    <span className="pr-input-wrap"><FiMapPin /><input value={form.adresse} onChange={(event) => setField('adresse', event.target.value)} /></span>
                  </label>
                  <label className="pr-field">
                    <span>Date de naissance <em>(optionnel)</em></span>
                    <span className="pr-input-wrap"><FiCalendar /><input type="date" value={form.date_naissance} onChange={(event) => setField('date_naissance', event.target.value)} /></span>
                  </label>
                </div>
              </section>
            </div>

            <div>
              <section className="pr-panel">
                <h2><FiClock />Aperçu du compte</h2>
                <div className="pr-info-grid">
                  <div><span>Rôle</span><strong><FiUser />{getRoleLabel(role)}</strong></div>
                  <div><span>Statut</span><strong className={user.is_active === false ? 'pr-status-inactive' : 'pr-status-active'}><FiCheck />{user.is_active === false ? 'Inactif' : 'Actif'}</strong></div>
                  <div><span>Créé le</span><strong><FiCalendar />{formatDate(createdAt)}</strong></div>
                  <div><span>Fuseau horaire</span><strong><FiClock />{Intl.DateTimeFormat().resolvedOptions().timeZone || 'Haïti (UTC-5)'}</strong></div>
                </div>
              </section>

              <section className="pr-panel pr-panel--last">
                <h2><FiShield />Vérification</h2>
                <p className="pr-panel-subtitle pr-no-margin">Le statut de vérification de l’adresse e-mail n’est pas fourni par l’API actuelle. Aucune information n’est simulée.</p>
              </section>
            </div>
          </div>
          <div className="pr-actions">
            <button type="button" className="pr-button pr-button--secondary" onClick={resetForm}><FiX />Annuler</button>
            <button type="submit" className="pr-button pr-button--primary" disabled={isSaving}><FiSave />{isSaving ? 'Enregistrement…' : 'Enregistrer'}</button>
          </div>
        </form>
      )}

      {activeTab === 'securite' && (
        <div className="pr-tab-panel">
          <div className="pr-grid pr-grid--security">
            <div>
              <form onSubmit={handlePasswordChange} className="pr-panel">
                <h2><FiLock />{isAdministrator ? 'Mot de passe administrateur' : 'Changer le mot de passe'}</h2>
                <p className="pr-panel-subtitle">{isAdministrator ? 'Modifiez le mot de passe de votre propre compte administrateur. ' : ''}{PASSWORD_POLICY_SUMMARY}</p>
                <div className="pr-password-fields">
                  {[
                    ['current_password', 'current', 'Mot de passe actuel', 'current-password'],
                    ['new_password', 'next', 'Nouveau mot de passe', 'new-password'],
                    ['new_password_confirm', 'confirm', 'Confirmer', 'new-password'],
                  ].map(([field, visibilityKey, label, autoComplete]) => (
                    <label className="pr-field" key={field}>
                      <span>{label}</span>
                      <span className="pr-input-wrap pr-input-wrap--password">
                        <input
                          type={passwordVisibility[visibilityKey] ? 'text' : 'password'}
                          value={passwordForm[field]}
                          autoComplete={autoComplete}
                          minLength={field === 'new_password' ? PASSWORD_MIN_LENGTH : undefined}
                          onChange={(event) => setPasswordForm((current) => ({ ...current, [field]: event.target.value }))}
                        />
                        <button type="button" className="pr-eye" aria-label={`Afficher ou masquer ${label.toLowerCase()}`} onClick={() => setPasswordVisibility((current) => ({ ...current, [visibilityKey]: !current[visibilityKey] }))}>
                          {passwordVisibility[visibilityKey] ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </span>
                      {field === 'new_password' && (
                        <>
                          <span className="pr-strength" aria-label={strength.label}>
                            {[0, 1, 2, 3, 4].map((bar) => <i key={bar}><b style={{ width: passwordStrength.score > bar ? '100%' : '0%', background: strength.color }} /></i>)}
                          </span>
                          <small className="pr-strength-label" style={{ color: strength.color }}>{strength.label}{passwordStrength.isCompliant ? ' · Politique respectée' : ' · Les cinq critères sont requis'}</small>
                        </>
                      )}
                    </label>
                  ))}
                </div>
                <button type="submit" className="pr-button pr-button--outline" disabled={isChangingPassword || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.new_password_confirm || !passwordStrength.isCompliant || passwordForm.new_password !== passwordForm.new_password_confirm}>
                  <FiLock />{isChangingPassword ? 'Modification…' : 'Modifier le mot de passe'}
                </button>
              </form>

              <section className="pr-panel pr-panel--last">
                <h2><FiShield />Protection du compte</h2>
                <LocalSwitch icon={FiShield} label="Authentification à deux facteurs" description="Ajoute une étape de vérification à la connexion." checked={false} unavailable />
                <LocalSwitch icon={FiBell} label="Alertes de connexion" description="Le paramétrage des alertes de connexion n’est pas fourni par l’API." checked={false} unavailable />
              </section>
            </div>

            <div>
              <section className="pr-panel">
                <h2><FiMonitor />Sessions actives</h2>
                <p className="pr-panel-subtitle">Appareils actuellement connectés à votre compte.</p>
                <div className="pr-session-row pr-session-row--unavailable">
                  <span className="pr-session-icon"><FiMonitor /></span>
                  <div>
                    <strong>Sessions non disponibles</strong>
                    <p>L’API actuelle ne transmet ni la liste des appareils ni la révocation de sessions.</p>
                  </div>
                  <span className="pr-unavailable-label">Aucune API</span>
                </div>
              </section>

              <section className="pr-danger-zone">
                <h2><FiAlertTriangle />Zone sensible</h2>
                <p>La suppression de compte exige une API dédiée, qui n’est pas disponible dans cette application.</p>
                <button type="button" className="pr-button pr-button--danger" disabled><FiTrash2 />Suppression indisponible</button>
              </section>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="pr-tab-panel">
          <p className="pr-local-note"><FiInfo />Ces préférences sont enregistrées uniquement dans ce navigateur.</p>
          <div className="pr-grid pr-grid--security">
            <section className="pr-panel pr-panel--last">
              <h2><FiSliders />{t('preferences.appearance')}</h2>
              <div className="pr-preference-row">
                <div><strong>{t('common.theme')}</strong><span>S’applique à l’ensemble de l’interface après enregistrement.</span></div>
                <div className="pr-segmented" aria-label={t('common.theme')}>
                  {[['light', 'common.light', FiSun], ['system', 'common.system', FiMonitor], ['dark', 'common.dark', FiMoon]].map(([value, labelKey, Icon]) => <button type="button" key={value} className={preferences.theme === value ? 'is-active' : ''} onClick={() => setPreference('theme', value)}><Icon />{t(labelKey)}</button>)}
                </div>
              </div>
              <div className="pr-preference-row">
                <div><strong>Couleur d’accent</strong><span>Utilisée uniquement dans la page de profil.</span></div>
                <div className="pr-swatches" aria-label="Couleur d’accent">
                  {Object.entries(accentColors).map(([name, color]) => <button type="button" key={name} className={preferences.accent === name ? 'is-active' : ''} style={{ background: color }} aria-label={`Accent ${name}`} onClick={() => setPreference('accent', name)}>{preferences.accent === name && <FiCheck />}</button>)}
                </div>
              </div>
              <div className="pr-preference-row pr-preference-row--last">
                <div><strong>{t('common.language')}</strong><span>{t('preferences.languageHelp')}</span></div>
                <div className="pr-segmented" aria-label={t('common.language')}>
                  {[['fr', 'Français'], ['ht', 'Kreyòl'], ['en', 'English']].map(([value, label]) => <button type="button" key={value} className={preferences.language === value ? 'is-active' : ''} onClick={() => setPreference('language', value)}>{label}</button>)}
                </div>
              </div>
            </section>

            <section className="pr-panel pr-panel--last">
              <h2><FiBell />Notifications rapides</h2>
              <LocalSwitch label="Résumé quotidien" checked={preferences.dailySummary} onChange={(event) => setPreference('dailySummary', event.target.checked)} />
              <LocalSwitch label="Notifications push" checked={preferences.pushNotifications} onChange={(event) => setPreference('pushNotifications', event.target.checked)} />
              <LocalSwitch label="Actualités produit" checked={preferences.productNews} onChange={(event) => setPreference('productNews', event.target.checked)} />
            </section>
          </div>
          <div className="pr-actions">
            <button type="button" className="pr-button pr-button--secondary" onClick={resetPreferences}><FiX />{t('common.cancel')}</button>
            <button type="submit" className="pr-button pr-button--primary"><FiSave />{t('common.save')}</button>
          </div>
        </form>
      )}
    </main>
  )
}
