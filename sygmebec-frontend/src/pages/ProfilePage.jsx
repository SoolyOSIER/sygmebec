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
import { getPasswordStrength, PASSWORD_MIN_LENGTH } from '../utils/passwordPolicy'
import useT from '../i18n/useT'
import './profileReference.css'

const PREFERENCES_KEY = 'sygmebec-profile-preferences'

const accentColors = {
  gold: '#0000cc',
  green: '#000099',
  blue: '#0000ff',
  purple: '#60a5fa',
}

const roleKeys = {
  SECRETAIRE: 'secretary',
  PASTEUR: 'pastor',
  ADMINISTRATEUR: 'administrator',
}

const getDateValue = (value) => (value ? String(value).slice(0, 10) : '')

const getProfileForm = (user) => {
  const membre = user?.membre || {}
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
    accent: 'blue',
    language: ['fr', 'ht', 'en'].includes(language) ? language : 'fr',
    dailySummary: true,
    pushNotifications: true,
    productNews: false,
  }

  try {
    const stored = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}')
    return {
      ...defaults,
      ...stored,
      language: ['fr', 'ht', 'en'].includes(stored.language) ? stored.language : defaults.language,
    }
  } catch {
    return defaults
  }
}

const formatDate = (value, locale, fallback, options = { day: '2-digit', month: 'long', year: 'numeric' }) => {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback

  try {
    return new Intl.DateTimeFormat(locale, options).format(date)
  } catch {
    return fallback
  }
}

const formatPercent = (value, locale) => new Intl.NumberFormat(locale, {
  style: 'percent',
  maximumFractionDigits: 0,
}).format((Number(value) || 0) / 100)

const getInitials = (name) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  return (parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.[0] || '?').toUpperCase()
}

function AccountAvatar({ name, photo, className = '', t }) {
  if (photo) {
    return <img className={className} src={getMediaUrl(photo)} alt={t('accountProfile.profilePhotoAlt', { name })} />
  }

  return <span className={`${className} pr-avatar-fallback`}>{getInitials(name)}</span>
}

function HeroRing({ value, label, title, subtitle, color }) {
  const circumference = 2 * Math.PI * 22
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100)

  return (
    <div className="pr-ring-stat">
      <div className="pr-ring-wrap" aria-label={`${title}: ${subtitle}`}>
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

function LocalSwitch({ icon: Icon, label, description, checked, onChange, unavailable = false, unavailableLabel }) {
  return (
    <div className={`pr-switch-row${unavailable ? ' pr-switch-row--unavailable' : ''}`}>
      <div>
        <div className="pr-switch-label">{Icon && <Icon />}{label}</div>
        {description && <div className="pr-switch-description">{description}</div>}
        {unavailable && <span className="pr-unavailable-label">{unavailableLabel}</span>}
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
  const { t, locale } = useT()
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
  const isAdministrator = role === 'ADMINISTRATEUR'
  const displayName = `${form.prenom} ${form.nom}`.trim() || membre.nom_complet || membre.nom || user?.identifiant || t('accountProfile.unnamedAccount')
  const photo = membre.photo
  const createdAt = user?.date_creation_compte || user?.date_joined || user?.created_at
  const profileCompletion = useMemo(() => {
    const values = [form.prenom, form.nom, form.email, form.telephone, form.adresse, form.date_naissance, photo]
    return Math.round((values.filter((value) => String(value || '').trim()).length / values.length) * 100)
  }, [form, photo])
  const passwordStrength = getPasswordStrength(passwordForm.new_password)
  const strengthColors = { weak: '#c94f43', fair: '#0000cc', good: '#0000ff', strong: '#1fa060' }
  const strength = {
    label: t(`accountProfile.passwordSettings.strength.${passwordStrength.score}`),
    color: strengthColors[passwordStrength.tone] || '#a39e91',
  }
  const roleLabel = t(`accountProfile.roles.${roleKeys[role] || 'unknown'}`)
  const profileCompletionLabel = formatPercent(profileCompletion, locale)

  if (!user) {
    return <div className="py-20 text-center text-secondary-400" data-no-translate>{t('accountProfile.loading')}</div>
  }

  const updateLocalUser = (data) => {
    const updatedMembre = { ...membre, ...data }
    updatedMembre.nom_complet = `${updatedMembre.prenom || ''} ${updatedMembre.nom || ''}`.trim()
    setUser({ ...user, membre: updatedMembre })
  }

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: t('accountProfile.messages.invalidImage') })
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setMessage({ type: 'error', text: t('accountProfile.messages.imageTooLarge') })
      return
    }

    const formData = new FormData()
    formData.append('photo', file)
    setIsUploading(true)
    setMessage(null)
    try {
      const { data } = await authApi.updateMyProfile(formData)
      updateLocalUser(data.membre || data)
      setMessage({ type: 'success', text: t('accountProfile.messages.photoUpdated') })
    } catch {
      setMessage({ type: 'error', text: t('accountProfile.messages.photoUpdateFailed') })
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
      setMessage({ type: 'success', text: t('accountProfile.messages.profileSaved') })
    } catch {
      setMessage({ type: 'error', text: t('accountProfile.messages.profileSaveFailed') })
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
    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.new_password_confirm) {
      setMessage({ type: 'error', text: t('accountProfile.passwordSettings.fillAll') })
      return
    }

    const invalidCheck = passwordStrength.checks.find((check) => !check.valid)
    if (invalidCheck) {
      setMessage({ type: 'error', text: t(`accountProfile.passwordSettings.validation.${invalidCheck.id}`) })
      return
    }
    if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      setMessage({ type: 'error', text: t('accountProfile.passwordSettings.mismatch') })
      return
    }

    setIsChangingPassword(true)
    setMessage(null)
    try {
      await authApi.changeMyPassword(passwordForm)
      setPasswordForm({ current_password: '', new_password: '', new_password_confirm: '' })
      setMessage({ type: 'success', text: t('accountProfile.passwordSettings.updated') })
    } catch {
      setMessage({ type: 'error', text: t('accountProfile.passwordSettings.updateFailed') })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSavePreferences = (event) => {
    event.preventDefault()
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
    setTheme(preferences.theme)
    setLanguage(preferences.language)
    setMessage({ type: 'success', text: t('accountProfile.preferencesSaved') })
  }

  const resetPreferences = () => {
    setPreferences(getStoredPreferences(themePreference, language))
    setMessage(null)
  }

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const setPreference = (field, value) => setPreferences((current) => ({ ...current, [field]: value }))
  const memberSince = createdAt
    ? t('accountProfile.memberSince', {
      date: formatDate(createdAt, locale, t('accountProfile.creationDateUnknown'), { month: 'short', year: 'numeric' }),
    })
    : t('accountProfile.creationDateUnknown')

  return (
    <main className="profile-reference" data-no-translate style={{ '--pr-accent': accentColors[preferences.accent] || accentColors.gold }}>
      <section className="pr-hero">
        <div className="pr-hero-dots" />
        <div className="pr-hero-avatar-wrap">
          <AccountAvatar name={displayName} photo={photo} t={t} className="pr-hero-avatar" />
          <label className="pr-hero-camera" title={t('accountProfile.photoCameraTitle')}>
            <FiCamera aria-hidden="true" />
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={isUploading} onChange={handlePhotoUpload} />
          </label>
        </div>
        <div className="pr-hero-content">
          <p className="pr-eyebrow">{t('accountProfile.accountSettings')}</p>
          <h1>{displayName}</h1>
          <p className="pr-hero-email">{form.email || t('accountProfile.emailNotSpecified')}</p>
          <div className="pr-hero-tags">
            <span><FiShield />{roleLabel}</span>
            <span><FiCalendar />{memberSince}</span>
            <span className="pr-tag-muted"><FiInfo />{t('accountProfile.twoFactorUnavailable')}</span>
          </div>
          <div className="pr-rings" aria-label={t('accountProfile.accountSummary')}>
            <HeroRing value={profileCompletion} label={profileCompletionLabel} title={profileCompletionLabel} subtitle={t('accountProfile.profileCompletion')} color="var(--pr-accent)" />
            <HeroRing value={0} label="—" title={t('accountProfile.sessions')} subtitle={t('accountProfile.notAvailable')} color="#1fa060" />
            <HeroRing value={0} label="API" title={t('accountProfile.password')} subtitle={t('accountProfile.passwordManagedByApi')} color="#0000cc" />
          </div>
        </div>
      </section>

      <nav className="pr-tabs" aria-label={t('accountProfile.tabsLabel')}>
        <button type="button" className={activeTab === 'profil' ? 'is-active' : ''} onClick={() => setActiveTab('profil')}><FiUser />{t('accountProfile.tabs.profile')}</button>
        <button type="button" className={activeTab === 'securite' ? 'is-active' : ''} onClick={() => setActiveTab('securite')}><FiShield />{isAdministrator ? t('accountProfile.tabs.administratorSecurity') : t('accountProfile.tabs.security')}</button>
        <button type="button" className={activeTab === 'preferences' ? 'is-active' : ''} onClick={() => setActiveTab('preferences')}><FiGrid />{t('accountProfile.tabs.preferences')}</button>
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
                <h2><FiCamera />{t('accountProfile.profilePhoto')}</h2>
                <p className="pr-panel-subtitle">{t('accountProfile.photoVisibility')}</p>
                <div className="pr-photo-row">
                  <AccountAvatar name={displayName} photo={photo} t={t} className="pr-photo-avatar" />
                  <div>
                    <label className="pr-photo-button">
                      <FiCamera />{isUploading ? t('accountProfile.uploading') : t('accountProfile.addImage')}
                      <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={isUploading} onChange={handlePhotoUpload} />
                    </label>
                    <p className="pr-photo-hint">{t('accountProfile.imageHint')}</p>
                  </div>
                </div>
              </section>

              <section className="pr-panel">
                <h2><FiUser />{t('accountProfile.personalInfo')}</h2>
                <p className="pr-panel-subtitle">{t('accountProfile.personalInfoDescription')}</p>
                <div className="pr-fields-grid">
                  <label className="pr-field">
                    <span>{t('accountProfile.firstName')}</span>
                    <span className="pr-input-wrap"><FiUser /><input value={form.prenom} onChange={(event) => setField('prenom', event.target.value)} required /></span>
                  </label>
                  <label className="pr-field">
                    <span>{t('accountProfile.lastName')}</span>
                    <span className="pr-input-wrap"><FiUser /><input value={form.nom} onChange={(event) => setField('nom', event.target.value)} required /></span>
                  </label>
                  <label className="pr-field pr-field--wide">
                    <span>{t('accountProfile.emailAddress')}</span>
                    <span className="pr-input-wrap"><FiMail /><input type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} /></span>
                    <small>{t('accountProfile.emailDescription')}</small>
                  </label>
                  <label className="pr-field">
                    <span>{t('accountProfile.phone')} <em>({t('accountProfile.optional')})</em></span>
                    <span className="pr-input-wrap"><FiPhone /><input type="tel" value={form.telephone} onChange={(event) => setField('telephone', event.target.value)} placeholder="+509 __ __ __ __" /></span>
                  </label>
                  <label className="pr-field">
                    <span>{t('accountProfile.secondaryPhone')} <em>({t('accountProfile.optional')})</em></span>
                    <span className="pr-input-wrap"><FiPhone /><input type="tel" value={form.telephone_secondaire} onChange={(event) => setField('telephone_secondaire', event.target.value)} /></span>
                  </label>
                  <label className="pr-field pr-field--wide">
                    <span>{t('accountProfile.address')} <em>({t('accountProfile.optional')})</em></span>
                    <span className="pr-input-wrap"><FiMapPin /><input value={form.adresse} onChange={(event) => setField('adresse', event.target.value)} /></span>
                  </label>
                  <label className="pr-field">
                    <span>{t('accountProfile.birthDate')} <em>({t('accountProfile.optional')})</em></span>
                    <span className="pr-input-wrap"><FiCalendar /><input type="date" value={form.date_naissance} onChange={(event) => setField('date_naissance', event.target.value)} /></span>
                  </label>
                </div>
              </section>
            </div>

            <div>
              <section className="pr-panel">
                <h2><FiClock />{t('accountProfile.accountOverview')}</h2>
                <div className="pr-info-grid">
                  <div><span>{t('accountProfile.role')}</span><strong><FiUser />{roleLabel}</strong></div>
                  <div><span>{t('accountProfile.status')}</span><strong className={user.is_active === false ? 'pr-status-inactive' : 'pr-status-active'}><FiCheck />{user.is_active === false ? t('accountProfile.inactive') : t('accountProfile.active')}</strong></div>
                  <div><span>{t('accountProfile.createdOn')}</span><strong><FiCalendar />{formatDate(createdAt, locale, t('accountProfile.creationDateUnknown'))}</strong></div>
                  <div><span>{t('accountProfile.timezone')}</span><strong><FiClock />{Intl.DateTimeFormat().resolvedOptions().timeZone || t('accountProfile.timezoneFallback')}</strong></div>
                </div>
              </section>

              <section className="pr-panel pr-panel--last">
                <h2><FiShield />{t('accountProfile.verification')}</h2>
                <p className="pr-panel-subtitle pr-no-margin">{t('accountProfile.emailVerificationHint')}</p>
              </section>
            </div>
          </div>
          <div className="pr-actions">
            <button type="button" className="pr-button pr-button--secondary" onClick={resetForm}><FiX />{t('accountProfile.actions.cancel')}</button>
            <button type="submit" className="pr-button pr-button--primary" disabled={isSaving}><FiSave />{isSaving ? t('accountProfile.actions.saving') : t('accountProfile.actions.save')}</button>
          </div>
        </form>
      )}

      {activeTab === 'securite' && (
        <div className="pr-tab-panel">
          <div className="pr-grid pr-grid--security">
            <div>
              <form onSubmit={handlePasswordChange} className="pr-panel">
                <h2><FiLock />{isAdministrator ? t('accountProfile.passwordSettings.adminTitle') : t('accountProfile.passwordSettings.changeTitle')}</h2>
                <p className="pr-panel-subtitle">{isAdministrator ? `${t('accountProfile.passwordSettings.adminDescription')} ` : ''}{t('accountProfile.passwordSettings.policy')}</p>
                <div className="pr-password-fields">
                  {[
                    ['current_password', 'current', 'accountProfile.passwordSettings.current', 'current-password'],
                    ['new_password', 'next', 'accountProfile.passwordSettings.new', 'new-password'],
                    ['new_password_confirm', 'confirm', 'accountProfile.passwordSettings.confirm', 'new-password'],
                  ].map(([field, visibilityKey, labelKey, autoComplete]) => {
                    const label = t(labelKey)
                    return (
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
                          <button type="button" className="pr-eye" aria-label={t('accountProfile.passwordSettings.toggle', { field: label.toLowerCase() })} onClick={() => setPasswordVisibility((current) => ({ ...current, [visibilityKey]: !current[visibilityKey] }))}>
                            {passwordVisibility[visibilityKey] ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </span>
                        {field === 'new_password' && (
                          <>
                            <span className="pr-strength" aria-label={strength.label}>
                              {[0, 1, 2, 3, 4].map((bar) => <i key={bar}><b style={{ width: passwordStrength.score > bar ? '100%' : '0%', background: strength.color }} /></i>)}
                            </span>
                            <small className="pr-strength-label" style={{ color: strength.color }}>{strength.label}{passwordStrength.isCompliant ? ` · ${t('accountProfile.passwordSettings.policySatisfied')}` : ` · ${t('accountProfile.passwordSettings.allCriteriaRequired')}`}</small>
                          </>
                        )}
                      </label>
                    )
                  })}
                </div>
                <button type="submit" className="pr-button pr-button--outline" disabled={isChangingPassword || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.new_password_confirm || !passwordStrength.isCompliant || passwordForm.new_password !== passwordForm.new_password_confirm}>
                  <FiLock />{isChangingPassword ? t('accountProfile.passwordSettings.updating') : t('accountProfile.passwordSettings.update')}
                </button>
              </form>

              <section className="pr-panel pr-panel--last">
                <h2><FiShield />{t('accountProfile.accountProtection')}</h2>
                <LocalSwitch icon={FiShield} label={t('accountProfile.twoFactor')} description={t('accountProfile.twoFactorDescription')} checked={false} unavailable unavailableLabel={t('accountProfile.unavailableNoApi')} />
                <LocalSwitch icon={FiBell} label={t('accountProfile.loginAlerts')} description={t('accountProfile.loginAlertsDescription')} checked={false} unavailable unavailableLabel={t('accountProfile.unavailableNoApi')} />
              </section>
            </div>

            <div>
              <section className="pr-panel">
                <h2><FiMonitor />{t('accountProfile.activeSessions')}</h2>
                <p className="pr-panel-subtitle">{t('accountProfile.connectedDevices')}</p>
                <div className="pr-session-row pr-session-row--unavailable">
                  <span className="pr-session-icon"><FiMonitor /></span>
                  <div>
                    <strong>{t('accountProfile.sessionsUnavailable')}</strong>
                    <p>{t('accountProfile.sessionsUnavailableDescription')}</p>
                  </div>
                  <span className="pr-unavailable-label">{t('accountProfile.noApi')}</span>
                </div>
              </section>

              <section className="pr-danger-zone">
                <h2><FiAlertTriangle />{t('accountProfile.sensitiveArea')}</h2>
                <p>{t('accountProfile.deletionDescription')}</p>
                <button type="button" className="pr-button pr-button--danger" disabled><FiTrash2 />{t('accountProfile.deletionUnavailable')}</button>
              </section>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="pr-tab-panel">
          <p className="pr-local-note"><FiInfo />{t('accountProfile.preferencesBrowserOnly')}</p>
          <div className="pr-grid pr-grid--security">
            <section className="pr-panel pr-panel--last">
              <h2><FiSliders />{t('accountProfile.appearance')}</h2>
              <div className="pr-preference-row">
                <div><strong>{t('accountProfile.theme')}</strong><span>{t('accountProfile.themeDescription')}</span></div>
                <div className="pr-segmented" aria-label={t('accountProfile.theme')}>
                  {[
                    ['light', 'accountProfile.light', FiSun],
                    ['system', 'accountProfile.system', FiMonitor],
                    ['dark', 'accountProfile.dark', FiMoon],
                  ].map(([value, labelKey, Icon]) => <button type="button" key={value} className={preferences.theme === value ? 'is-active' : ''} onClick={() => setPreference('theme', value)}><Icon />{t(labelKey)}</button>)}
                </div>
              </div>
              <div className="pr-preference-row">
                <div><strong>{t('accountProfile.accentColor')}</strong><span>{t('accountProfile.accentDescription')}</span></div>
                <div className="pr-swatches" aria-label={t('accountProfile.accentColor')}>
                  {Object.entries(accentColors).map(([name, color]) => <button type="button" key={name} className={preferences.accent === name ? 'is-active' : ''} style={{ background: color }} aria-label={t('accountProfile.accentAria', { color: t(`accountProfile.colors.${name}`) })} onClick={() => setPreference('accent', name)}>{preferences.accent === name && <FiCheck />}</button>)}
                </div>
              </div>
              <div className="pr-preference-row pr-preference-row--last">
                <div><strong>{t('accountProfile.language')}</strong><span>{t('accountProfile.languageHelp')}</span></div>
                <div className="pr-segmented" aria-label={t('accountProfile.language')}>
                  {['fr', 'ht', 'en'].map((value) => <button type="button" key={value} className={preferences.language === value ? 'is-active' : ''} onClick={() => setPreference('language', value)}>{t(`accountProfile.languages.${value}`)}</button>)}
                </div>
              </div>
            </section>

            <section className="pr-panel pr-panel--last">
              <h2><FiBell />{t('accountProfile.quickNotifications')}</h2>
              <LocalSwitch label={t('accountProfile.dailySummary')} checked={preferences.dailySummary} onChange={(event) => setPreference('dailySummary', event.target.checked)} />
              <LocalSwitch label={t('accountProfile.pushNotifications')} checked={preferences.pushNotifications} onChange={(event) => setPreference('pushNotifications', event.target.checked)} />
              <LocalSwitch label={t('accountProfile.productNews')} checked={preferences.productNews} onChange={(event) => setPreference('productNews', event.target.checked)} />
            </section>
          </div>
          <div className="pr-actions">
            <button type="button" className="pr-button pr-button--secondary" onClick={resetPreferences}><FiX />{t('accountProfile.actions.cancel')}</button>
            <button type="submit" className="pr-button pr-button--primary"><FiSave />{t('accountProfile.actions.save')}</button>
          </div>
        </form>
      )}
    </main>
  )
}
