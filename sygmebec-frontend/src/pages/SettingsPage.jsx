import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiBell, FiCamera, FiCheck, FiChevronRight, FiCloud, FiCreditCard, FiGrid, FiLock, FiMail, FiMonitor, FiMoon, FiRefreshCw, FiShield, FiSliders, FiSun, FiUser, FiX } from 'react-icons/fi'
import Avatar from '../components/ui/Avatar'
import { authApi } from '../api/authApi'
import useT from '../i18n/useT'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { getPasswordStrength, PASSWORD_MIN_LENGTH } from '../utils/passwordPolicy'
import './settingsReference.css'

const preferenceKey = 'sygmebec-settings-preferences'
const defaults = { digest: true, mentions: true, newMembers: false, push: true, product: false, twoFactor: false, reduceMotion: false, density: 'standard', accent: '#0000cc' }

const navigationItems = [
  ['profil', 'settings.profile.title', FiUser],
  ['securite', 'settings.security.title', FiShield],
  ['notifications', 'settings.notifications.title', FiBell],
  ['apparence', 'settings.appearance.title', FiSliders],
  ['facturation', 'settings.billing.title', FiCreditCard],
  ['integrations', 'settings.integrations.title', FiGrid],
]

const notificationItems = [
  ['digest', 'settings.notifications.digest', 'settings.notifications.digestDescription'],
  ['mentions', 'settings.notifications.mentions', 'settings.notifications.mentionsDescription'],
  ['newMembers', 'settings.notifications.newMembers', 'settings.notifications.newMembersDescription'],
  ['push', 'settings.notifications.push', 'settings.notifications.pushDescription'],
  ['product', 'settings.notifications.product', 'settings.notifications.productDescription'],
]

const densityItems = [
  ['comfortable', 'settings.appearance.comfortable'],
  ['standard', 'settings.appearance.standard'],
  ['compact', 'settings.appearance.compact'],
]

const normaliseDensity = (value) => ({
  Confortable: 'comfortable', Standard: 'standard', Compacte: 'compact',
  comfortable: 'comfortable', standard: 'standard', compact: 'compact',
}[value] || 'standard')

function readPreferences() {
  try {
    const parsed = JSON.parse(localStorage.getItem(preferenceKey) || '{}')
    const saved = parsed && typeof parsed === 'object' ? parsed : {}
    return { ...defaults, ...saved, density: normaliseDensity(saved.density) }
  } catch {
    return defaults
  }
}

function Toggle({ checked, onChange, label }) {
  return <button type="button" className={`settings-toggle ${checked ? 'is-on' : ''}`} onClick={onChange} aria-pressed={checked} aria-label={label}><span /></button>
}

function SectionHeader({ icon: Icon, title, description }) {
  return <header className="settings-card-head"><span className="settings-card-icon"><Icon /></span><div><h2>{title}</h2><p>{description}</p></div></header>
}

export default function SettingsPage() {
  const { t } = useT()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, setUser } = useAuthStore()
  const { themePreference, setTheme } = useUIStore()
  const [profile, setProfile] = useState({ prenom: '', nom: '', email: '', telephone: '' })
  const [preferences, setPreferences] = useState(readPreferences)
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', new_password_confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [message, setMessage] = useState(null)
  const fileInput = useRef(null)
  const sectionRefs = useRef({})
  const activeSection = searchParams.get('tab') === 'general' ? 'profil' : (searchParams.get('tab') || 'profil')
  const fullName = useMemo(() => `${profile.prenom} ${profile.nom}`.trim() || user?.identifiant || t('settings.administratorAccount'), [profile, user, t])
  const passwordStrength = getPasswordStrength(passwordForm.new_password)
  const navItems = navigationItems.map(([id, labelKey, Icon]) => [id, t(labelKey), Icon])
  const notificationRows = notificationItems.map(([key, titleKey, descriptionKey]) => [key, t(titleKey), t(descriptionKey)])
  const themeItems = [
    ['light', t('settings.appearance.light'), FiSun],
    ['dark', t('settings.appearance.dark'), FiMoon],
    ['system', t('settings.appearance.system'), FiMonitor],
  ]
  const plans = [
    ['essential', t('settings.billing.essential'), t('settings.billing.starter'), [t('settings.billing.memberManagement'), t('settings.billing.eventAnnouncements')]],
    ['pro', t('settings.billing.pro'), t('settings.billing.recommended'), [t('settings.billing.enhancedReports'), t('settings.billing.prioritySupport'), t('settings.billing.advancedIntegrations')]],
    ['enterprise', t('settings.billing.enterprise'), t('settings.billing.custom'), [t('settings.billing.multiTeam'), t('settings.billing.dedicatedSupport')]],
  ]
  const integrations = [
    [t('settings.integrations.googleDrive'), t('settings.integrations.googleDriveDescription'), FiCloud],
    [t('settings.integrations.email'), t('settings.integrations.emailDescription'), FiMail],
    [t('settings.integrations.automations'), t('settings.integrations.automationsDescription'), FiRefreshCw],
  ]

  useEffect(() => {
    setProfile({
      prenom: user?.membre?.prenom || '',
      nom: user?.membre?.nom || '',
      email: user?.membre?.email || user?.email || '',
      telephone: user?.membre?.telephone || user?.telephone || '',
    })
  }, [user])

  useEffect(() => {
    localStorage.setItem(preferenceKey, JSON.stringify(preferences))
    document.documentElement.style.setProperty('--settings-accent', preferences.accent)
    document.documentElement.classList.toggle('settings-compact', preferences.density === 'compact')
    document.documentElement.classList.toggle('reduce-motion', preferences.reduceMotion)
  }, [preferences])

  const updateUser = (membre) => setUser({ ...user, membre: { ...user?.membre, ...membre, nom_complet: `${membre?.prenom ?? profile.prenom} ${membre?.nom ?? profile.nom}`.trim() } })
  const chooseSection = (id) => { setSearchParams({ tab: id }); sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const updatePreference = (key, value) => setPreferences((current) => ({ ...current, [key]: value ?? !current[key] }))

  const saveProfile = async () => {
    setIsSaving(true)
    setMessage(null)
    try {
      const { data } = await authApi.updateMyProfile(profile)
      updateUser(data.membre)
      setMessage({ type: 'success', text: t('settings.profile.saved') })
    } catch {
      setMessage({ type: 'error', text: t('settings.profile.saveFailed') })
    } finally {
      setIsSaving(false)
    }
  }

  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setMessage({ type: 'error', text: t('settings.profile.chooseImage') })
    if (file.size > 20 * 1024 * 1024) return setMessage({ type: 'error', text: t('settings.profile.imageTooLarge') })

    const formData = new FormData()
    formData.append('photo', file)
    setIsUploading(true)
    setMessage(null)
    try {
      const { data } = await authApi.updateMyProfile(formData)
      updateUser(data.membre)
      setMessage({ type: 'success', text: t('settings.profile.photoUpdated') })
    } catch {
      setMessage({ type: 'error', text: t('settings.profile.photoUpdateFailed') })
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  const changePassword = async (event) => {
    event.preventDefault()
    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.new_password_confirm) {
      return setMessage({ type: 'error', text: t('settings.security.fillAll') })
    }
    const invalidCheck = passwordStrength.checks.find((check) => !check.valid)
    if (invalidCheck) return setMessage({ type: 'error', text: t(`settings.security.validation.${invalidCheck.id}`) })
    if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      return setMessage({ type: 'error', text: t('settings.security.passwordMismatch') })
    }

    setIsChangingPassword(true)
    setMessage(null)
    try {
      await authApi.changeMyPassword(passwordForm)
      setPasswordForm({ current_password: '', new_password: '', new_password_confirm: '' })
      setShowPassword(false)
      setMessage({ type: 'success', text: t('settings.security.passwordUpdated') })
    } catch {
      setMessage({ type: 'error', text: t('settings.security.passwordUpdateFailed') })
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="settings-page" data-no-translate>
      <aside className="settings-sidebar">
        <div className="settings-brand"><span>EB</span><div><b>SYGMEBEC</b><small>{t('settings.administration')}</small></div></div>
        <p className="settings-nav-label">{t('settings.account')}</p>
        <nav>{navItems.slice(0, 3).map(([id, label, Icon]) => <button key={id} type="button" className={activeSection === id ? 'active' : ''} onClick={() => chooseSection(id)}><Icon />{label}<FiChevronRight /></button>)}</nav>
        <p className="settings-nav-label">{t('settings.workspace')}</p>
        <nav>{navItems.slice(3).map(([id, label, Icon]) => <button key={id} type="button" className={activeSection === id ? 'active' : ''} onClick={() => chooseSection(id)}><Icon />{label}<FiChevronRight /></button>)}</nav>
        <div className="settings-sidebar-user"><Avatar name={fullName} src={user?.membre?.photo} size="md" /><div><b>{fullName}</b><small>{user?.membre?.email || user?.identifiant || t('settings.administratorAccount')}</small></div></div>
      </aside>

      <main className="settings-main">
        <header className="settings-hero"><div><span>{t('settings.pageEyebrow')}</span><h1>{t('settings.title')}</h1><p>{t('settings.description')}</p></div><div className="settings-save-status"><i />{t('settings.saved')}</div></header>
        {message && <div className={`settings-message ${message.type}`}><span>{message.type === 'success' ? <FiCheck /> : <FiX />}</span>{message.text}<button type="button" onClick={() => setMessage(null)} aria-label={t('settings.close')}><FiX /></button></div>}

        <section ref={(node) => { sectionRefs.current.profil = node }} id="profil" className="settings-section">
          <article className="settings-card">
            <SectionHeader icon={FiUser} title={t('settings.profile.title')} description={t('settings.profile.description')} />
            <div className="settings-profile-row">
              <Avatar name={fullName} src={user?.membre?.photo} size="2xl" className="settings-avatar" />
              <div className="settings-profile-meta"><b>{fullName}</b><span>{profile.email || user?.identifiant || t('settings.profile.noEmail')}</span></div>
              <button type="button" className="settings-button" onClick={() => fileInput.current?.click()} disabled={isUploading}><FiCamera />{isUploading ? t('settings.profile.uploading') : t('settings.profile.changePhoto')}</button>
              <input ref={fileInput} className="settings-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={uploadPhoto} />
            </div>
            <div className="settings-row settings-fields">
              <div><b>{t('settings.profile.personalInfo')}</b><span>{t('settings.profile.personalInfoDescription')}</span></div>
              <div className="settings-input-grid"><input value={profile.prenom} onChange={(event) => setProfile((current) => ({ ...current, prenom: event.target.value }))} placeholder={t('settings.profile.firstName')} /><input value={profile.nom} onChange={(event) => setProfile((current) => ({ ...current, nom: event.target.value }))} placeholder={t('settings.profile.lastName')} /></div>
            </div>
            <div className="settings-row settings-fields"><div><b>{t('settings.profile.email')}</b><span>{t('settings.profile.emailDescription')}</span></div><input value={profile.email} type="email" onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} placeholder={t('settings.profile.emailPlaceholder')} /></div>
            <div className="settings-row settings-fields"><div><b>{t('settings.profile.phone')}</b><span>{t('settings.profile.phoneDescription')}</span></div><input value={profile.telephone} onChange={(event) => setProfile((current) => ({ ...current, telephone: event.target.value }))} placeholder={t('settings.profile.phonePlaceholder')} /></div>
            <footer className="settings-card-footer"><p>{t('settings.profile.imageHint')}</p><button type="button" className="settings-button settings-primary" onClick={saveProfile} disabled={isSaving}>{isSaving ? t('settings.profile.saving') : t('settings.profile.save')}</button></footer>
          </article>
        </section>

        <section ref={(node) => { sectionRefs.current.securite = node }} id="securite" className="settings-section">
          <article className="settings-card">
            <SectionHeader icon={FiShield} title={t('settings.security.title')} description={t('settings.security.description')} />
            <div className="settings-row"><div><b>{t('settings.security.password')}</b><span>{t('settings.security.passwordPolicy')}</span></div><button type="button" className="settings-button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? t('settings.close') : t('settings.security.modify')}</button></div>
            {showPassword && (
              <form className="settings-password-form" onSubmit={changePassword}>
                <label>{t('settings.security.currentPassword')}<input type="password" value={passwordForm.current_password} autoComplete="current-password" onChange={(event) => setPasswordForm((current) => ({ ...current, current_password: event.target.value }))} /></label>
                <label>
                  {t('settings.security.newPassword')}
                  <input type="password" value={passwordForm.new_password} autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} aria-describedby="settings-password-policy" onChange={(event) => setPasswordForm((current) => ({ ...current, new_password: event.target.value }))} />
                  <small id="settings-password-policy" className={passwordStrength.isCompliant ? 'is-strong' : ''} role="status">{t(`settings.security.strength.${passwordStrength.score}`)}{passwordStrength.isCompliant ? ` · ${t('settings.security.policySatisfied')}` : ` · ${t('settings.security.allCriteriaRequired')}`}</small>
                </label>
                <label>{t('settings.security.confirmNewPassword')}<input type="password" value={passwordForm.new_password_confirm} autoComplete="new-password" onChange={(event) => setPasswordForm((current) => ({ ...current, new_password_confirm: event.target.value }))} /></label>
                <div><button className="settings-button settings-primary" disabled={isChangingPassword || !passwordStrength.isCompliant || passwordForm.new_password !== passwordForm.new_password_confirm}>{isChangingPassword ? t('settings.security.updating') : t('settings.security.updatePassword')}</button></div>
              </form>
            )}
            <div className="settings-row"><div><b>{t('settings.security.twoFactor')}</b><span>{t('settings.security.twoFactorDescription')}</span></div><Toggle checked={preferences.twoFactor} label={t('settings.security.twoFactor')} onChange={() => updatePreference('twoFactor')} /></div>
            <div className="settings-row"><div className="settings-session"><span><FiMonitor /></span><div><b>{t('settings.security.currentSession')} <em>{t('settings.security.currentSessionLabel')}</em></b><small>{t('settings.security.currentSessionDescription')}</small></div></div><button type="button" className="settings-button is-disabled" disabled>{t('settings.security.active')}</button></div>
            <div className="settings-row"><div className="settings-session"><span><FiLock /></span><div><b>{t('settings.security.otherSessions')}</b><small>{t('settings.security.otherSessionsDescription')}</small></div></div><button type="button" className="settings-button" disabled>{t('settings.security.manageSoon')}</button></div>
          </article>
        </section>

        <section ref={(node) => { sectionRefs.current.notifications = node }} id="notifications" className="settings-section"><article className="settings-card"><SectionHeader icon={FiBell} title={t('settings.notifications.title')} description={t('settings.notifications.description')} />{notificationRows.map(([key, title, description]) => <div className="settings-row" key={key}><div><b>{title}</b><span>{description}</span></div><Toggle checked={preferences[key]} label={title} onChange={() => updatePreference(key)} /></div>)}</article></section>

        <section ref={(node) => { sectionRefs.current.apparence = node }} id="apparence" className="settings-section">
          <article className="settings-card">
            <SectionHeader icon={FiSliders} title={t('settings.appearance.title')} description={t('settings.appearance.description')} />
            <div className="settings-row"><div><b>{t('settings.appearance.theme')}</b><span>{t('settings.appearance.themeDescription')}</span></div><div className="settings-segmented">{themeItems.map(([id, label, Icon]) => <button key={id} type="button" className={themePreference === id ? 'active' : ''} onClick={() => setTheme(id)}><Icon />{label}</button>)}</div></div>
            <div className="settings-row"><div><b>{t('settings.appearance.accent')}</b><span>{t('settings.appearance.accentDescription')}</span></div><div className="settings-swatches">{['#0000cc', '#000099', '#0000ff', '#60a5fa'].map((color) => <button key={color} type="button" aria-label={t('settings.appearance.accentAria', { color })} className={preferences.accent === color ? 'active' : ''} style={{ background: color }} onClick={() => updatePreference('accent', color)} />)}</div></div>
            <div className="settings-row"><div><b>{t('settings.appearance.density')}</b><span>{t('settings.appearance.densityDescription')}</span></div><div className="settings-segmented">{densityItems.map(([id, labelKey]) => <button key={id} type="button" className={preferences.density === id ? 'active' : ''} onClick={() => updatePreference('density', id)}>{t(labelKey)}</button>)}</div></div>
            <div className="settings-row"><div><b>{t('settings.appearance.reduceMotion')}</b><span>{t('settings.appearance.reduceMotionDescription')}</span></div><Toggle checked={preferences.reduceMotion} label={t('settings.appearance.reduceMotion')} onChange={() => updatePreference('reduceMotion')} /></div>
          </article>
        </section>

        <section ref={(node) => { sectionRefs.current.facturation = node }} id="facturation" className="settings-section"><article className="settings-card"><SectionHeader icon={FiCreditCard} title={t('settings.billing.title')} description={t('settings.billing.description')} /><div className="settings-plan-grid">{plans.map(([id, name, price, features]) => <div key={id} className={`settings-plan ${id === 'pro' ? 'selected' : ''}`}><h3>{name}</h3><strong>{price}</strong><ul>{features.map((feature) => <li key={feature}><FiCheck />{feature}</li>)}</ul></div>)}</div><div className="settings-row"><div><b>{t('settings.billing.churchOffer')}</b><span>{t('settings.billing.churchOfferDescription')}</span></div><button type="button" className="settings-button" disabled>{t('settings.billing.managed')}</button></div></article></section>

        <section ref={(node) => { sectionRefs.current.integrations = node }} id="integrations" className="settings-section"><article className="settings-card"><SectionHeader icon={FiGrid} title={t('settings.integrations.title')} description={t('settings.integrations.description')} />{integrations.map(([name, description, Icon]) => <div className="settings-row settings-integration" key={name}><div><span className="settings-integration-icon"><Icon /></span><div><b>{name}</b><span>{description}</span></div></div><button type="button" className="settings-button" disabled>{t('settings.integrations.comingSoon')}</button></div>)}</article></section>
        <p className="settings-footnote">{t('settings.footnote')}</p>
      </main>
    </div>
  )
}
