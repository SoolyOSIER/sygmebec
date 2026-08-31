import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiKey,
  FiLock,
  FiRefreshCw,
  FiShield,
  FiX,
} from 'react-icons/fi'

import Modal from '../ui/Modal'
import { getPasswordPolicyError, getPasswordStrength } from '../../utils/passwordPolicy'
import './passwordResetModal.css'

const PASSWORD_LENGTH = 16
const CHARACTER_SETS = [
  'ABCDEFGHJKLMNPQRSTUVWXYZ',
  'abcdefghijkmnopqrstuvwxyz',
  '23456789',
  '!@#$%*?+-_',
]

const roleLabel = (role) => {
  if (!role) return 'Rôle non attribué'

  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const accountName = (target) => {
  const linkedMemberName = [
    target?.membre?.prenom,
    target?.membre?.nom,
  ].filter(Boolean).join(' ').trim()

  return linkedMemberName || target?.membre?.nom_complet || target?.membre?.nom || target?.identifiant || 'Utilisateur'
}

const initials = (value) => (
  (value || 'US')
    .split(/[ ._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
)

const serializeError = (value) => {
  if (Array.isArray(value)) return value.map(serializeError).filter(Boolean).join(' ')
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') return Object.values(value).map(serializeError).filter(Boolean).join(' ')
  return ''
}

const getServerErrors = (error) => {
  const response = error?.response?.data || {}
  const nestedError = response?.error && typeof response.error === 'object' ? response.error : {}
  const password = serializeError(response.new_password || response.password || nestedError.new_password || nestedError.password)
  const confirmation = serializeError(
    response.new_password_confirm
      || response.password_confirm
      || nestedError.new_password_confirm
      || nestedError.password_confirm,
  )
  const form = serializeError(
    response.non_field_errors
      || response.detail
      || response.message
      || nestedError.message
      || nestedError.detail,
  )

  return {
    password,
    confirmation,
    form: form || (!password && !confirmation ? 'La réinitialisation a échoué. Vérifiez les informations puis réessayez.' : ''),
  }
}

function secureRandomIndex(maximum) {
  const cryptoApi = globalThis.crypto

  if (!cryptoApi?.getRandomValues) {
    throw new Error('Le générateur sécurisé du navigateur est indisponible.')
  }

  const range = 0x100000000
  const upperBound = Math.floor(range / maximum) * maximum
  const values = new Uint32Array(1)

  do {
    cryptoApi.getRandomValues(values)
  } while (values[0] >= upperBound)

  return values[0] % maximum
}

function generateSecurePassword() {
  const allCharacters = CHARACTER_SETS.join('')
  const password = CHARACTER_SETS.map((set) => set[secureRandomIndex(set.length)])

  while (password.length < PASSWORD_LENGTH) {
    password.push(allCharacters[secureRandomIndex(allCharacters.length)])
  }

  for (let index = password.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomIndex(index + 1)
    ;[password[index], password[swapIndex]] = [password[swapIndex], password[index]]
  }

  return password.join('')
}

function copyWithFallback(value) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value)

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)

  if (!copied) throw new Error('Copie indisponible')
}

export default function PasswordResetModal({
  isOpen,
  target,
  onClose,
  onReset,
  isLoading = false,
}) {
  const passwordInputRef = useRef(null)
  const previousFocusRef = useRef(null)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [errors, setErrors] = useState({})
  const [copyStatus, setCopyStatus] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [completionMessage, setCompletionMessage] = useState('')

  const strength = getPasswordStrength(password)
  const passwordChecks = strength.checks
  const canSubmit = strength.isCompliant && Boolean(confirmation) && password === confirmation

  const wipeSecrets = useCallback(() => {
    setPassword('')
    setConfirmation('')
    setShowPassword(false)
    setShowConfirmation(false)
    setCopyStatus(null)
  }, [])

  const requestClose = useCallback(() => {
    if (isLoading) return

    wipeSecrets()
    setErrors({})
    setCompleted(false)
    setCompletionMessage('')
    onClose()
  }, [isLoading, onClose, wipeSecrets])

  useEffect(() => {
    if (!isOpen) {
      wipeSecrets()
      setErrors({})
      setCompleted(false)
      setCompletionMessage('')

      if (previousFocusRef.current?.focus) {
        window.setTimeout(() => previousFocusRef.current?.focus(), 0)
      }

      return undefined
    }

    previousFocusRef.current = document.activeElement
    setCompleted(false)
    setCompletionMessage('')
    setErrors({})
    setCopyStatus(null)

    const timeoutId = window.setTimeout(() => passwordInputRef.current?.focus(), 80)
    return () => window.clearTimeout(timeoutId)
  }, [isOpen, target?.id, wipeSecrets])

  const updatePassword = (value) => {
    setPassword(value)
    setErrors((current) => ({ ...current, password: '', form: '' }))
    setCopyStatus(null)
  }

  const updateConfirmation = (value) => {
    setConfirmation(value)
    setErrors((current) => ({ ...current, confirmation: '', form: '' }))
  }

  const handleGeneratePassword = () => {
    try {
      const generatedPassword = generateSecurePassword()
      setPassword(generatedPassword)
      setConfirmation(generatedPassword)
      setShowPassword(true)
      setShowConfirmation(true)
      setErrors({})
      setCopyStatus({
        tone: 'ready',
        text: 'Mot de passe sécurisé généré. Copiez-le avant de le communiquer par un canal sûr.',
      })
    } catch (error) {
      setErrors({ form: error.message || 'Le générateur sécurisé est indisponible sur ce navigateur.' })
    }
  }

  const handleCopyPassword = async () => {
    if (!password) {
      setCopyStatus({ tone: 'error', text: 'Saisissez ou générez un mot de passe à copier.' })
      return
    }

    try {
      await copyWithFallback(password)
      setCopyStatus({ tone: 'copied', text: 'Mot de passe copié. Effacez le presse-papiers après utilisation.' })
    } catch {
      setCopyStatus({ tone: 'error', text: 'La copie a été bloquée. Sélectionnez le mot de passe et copiez-le manuellement.' })
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isLoading || completed || !target) return

    const nextErrors = {}
    const passwordPolicyError = getPasswordPolicyError(password)
    if (passwordPolicyError) nextErrors.password = passwordPolicyError
    if (!confirmation) nextErrors.confirmation = 'Confirmez le nouveau mot de passe.'
    else if (password !== confirmation) nextErrors.confirmation = 'Les deux mots de passe ne correspondent pas.'

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    onReset(
      { new_password: password, new_password_confirm: confirmation },
      {
        onSuccess: (response) => {
          wipeSecrets()
          setCompleted(true)
          setCompletionMessage(response?.data?.message || 'Le nouveau mot de passe est désormais actif.')
        },
        onError: (error) => setErrors(getServerErrors(error)),
      },
    )
  }

  const personName = accountName(target)
  const identity = target?.identifiant || '—'

  return (
    <Modal
      isOpen={isOpen}
      onClose={requestClose}
      size="lg"
      hideHeader
      className="password-reset-modal-shell"
    >
      <section
        className="password-reset-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-reset-title"
      >
        <header className="password-reset-modal__header">
          <span className="password-reset-modal__orb password-reset-modal__orb--one" />
          <span className="password-reset-modal__orb password-reset-modal__orb--two" />
          <div className="password-reset-modal__header-main">
            <span className="password-reset-modal__lock"><FiLock aria-hidden="true" /></span>
            <div>
              <span className="password-reset-modal__eyebrow">Accès sécurisé</span>
              <h2 id="password-reset-title">Réinitialiser le mot de passe</h2>
              <p>Créez un nouvel accès confidentiel pour ce compte.</p>
            </div>
          </div>
          <button
            type="button"
            className="password-reset-modal__close"
            onClick={requestClose}
            disabled={isLoading}
            aria-label="Fermer la fenêtre de réinitialisation"
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="password-reset-modal__content">
          <aside className="password-reset-modal__target" aria-label="Compte concerné">
            <span className="password-reset-modal__avatar">{initials(personName)}</span>
            <div className="password-reset-modal__identity">
              <span>Compte concerné</span>
              <strong>{personName}</strong>
              <small>@{identity}</small>
            </div>
            <div className="password-reset-modal__badges">
              <span className="password-reset-modal__role"><FiShield aria-hidden="true" />{roleLabel(target?.role_acces?.nomRole)}</span>
              <span className={`password-reset-modal__state ${target?.is_active ? 'is-active' : 'is-inactive'}`}>
                <i aria-hidden="true" />
                {target?.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </aside>

          {completed ? (
            <div className="password-reset-modal__success" role="status" aria-live="polite">
              <span className="password-reset-modal__success-icon"><FiCheckCircle aria-hidden="true" /></span>
              <span className="password-reset-modal__eyebrow">Réinitialisation terminée</span>
              <h3>Le mot de passe a été mis à jour.</h3>
              <p>{completionMessage || 'Le nouveau mot de passe est désormais actif.'}</p>
              <div className="password-reset-modal__success-note">
                <FiShield aria-hidden="true" />
                <span>Communiquez le nouvel accès au titulaire du compte par un canal privé et sûr.</span>
              </div>
              <button type="button" className="password-reset-modal__finish" onClick={requestClose}>
                Terminer <FiCheck aria-hidden="true" />
              </button>
            </div>
          ) : (
            <form className="password-reset-modal__form" onSubmit={handleSubmit} noValidate>
              <div className="password-reset-modal__intro">
                <div>
                  <span className="password-reset-modal__step">1</span>
                  <div>
                    <h3>Nouveau mot de passe</h3>
                    <p>Utilisez le générateur ou saisissez une valeur personnelle.</p>
                  </div>
                </div>
                <button type="button" className="password-reset-modal__generate" onClick={handleGeneratePassword} disabled={isLoading}>
                  <FiRefreshCw aria-hidden="true" />Générer un mot de passe
                </button>
              </div>

              {errors.form && (
                <p className="password-reset-modal__form-error" role="alert">
                  <FiAlertCircle aria-hidden="true" />{errors.form}
                </p>
              )}

              <div className="password-reset-modal__field">
                <label htmlFor="reset-password">Nouveau mot de passe</label>
                <div className={`password-reset-modal__input ${errors.password ? 'has-error' : ''}`}>
                  <FiKey aria-hidden="true" />
                  <input
                    ref={passwordInputRef}
                    id="reset-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => updatePassword(event.target.value)}
                    autoComplete="new-password"
                    spellCheck="false"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby="reset-password-help reset-password-policy-status reset-password-error"
                    placeholder="Saisissez un mot de passe sécurisé"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-reset-modal__input-action"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={isLoading}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                  </button>
                  <button
                    type="button"
                    className="password-reset-modal__input-action password-reset-modal__copy"
                    onClick={handleCopyPassword}
                    disabled={isLoading || !password}
                    aria-label="Copier le mot de passe"
                    title="Copier le mot de passe"
                  >
                    <FiCopy aria-hidden="true" />
                  </button>
                </div>
                {errors.password && <p id="reset-password-error" className="password-reset-modal__field-error" role="alert"><FiAlertCircle aria-hidden="true" />{errors.password}</p>}
              </div>

              <div className="password-reset-modal__strength" aria-live="polite">
                <div className="password-reset-modal__strength-top">
                  <span id="reset-password-help">Niveau de sécurité</span>
                  <b className={strength.tone}>{strength.label}</b>
                </div>
                <span className="password-reset-modal__meter" aria-hidden="true">
                  <i className={strength.tone} style={{ width: `${password ? strength.percent : 0}%` }} />
                </span>
                <ul className="password-reset-modal__criteria">
                  {passwordChecks.map((check) => (
                    <li key={check.label} className={check.valid ? 'is-valid' : ''}>
                      <FiCheck aria-hidden="true" />
                      {check.label}
                    </li>
                  ))}
                </ul>
                <p
                  id="reset-password-policy-status"
                  className={['password-reset-modal__policy-status', strength.isCompliant ? 'is-valid' : ''].filter(Boolean).join(' ')}
                  role="status"
                >
                  {strength.isCompliant ? <FiCheckCircle aria-hidden="true" /> : <FiShield aria-hidden="true" />}
                  {strength.isCompliant
                    ? 'Mot de passe conforme à la politique de sécurité.'
                    : 'Les cinq exigences sont obligatoires pour réinitialiser l’accès.'}
                </p>
              </div>

              <div className="password-reset-modal__field">
                <label htmlFor="reset-password-confirmation">Confirmer le mot de passe</label>
                <div className={`password-reset-modal__input ${errors.confirmation ? 'has-error' : ''} ${confirmation && password === confirmation ? 'is-confirmed' : ''}`}>
                  <FiLock aria-hidden="true" />
                  <input
                    id="reset-password-confirmation"
                    type={showConfirmation ? 'text' : 'password'}
                    value={confirmation}
                    onChange={(event) => updateConfirmation(event.target.value)}
                    autoComplete="new-password"
                    spellCheck="false"
                    aria-invalid={Boolean(errors.confirmation)}
                    aria-describedby="reset-password-confirmation-error"
                    placeholder="Saisissez à nouveau le mot de passe"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-reset-modal__input-action"
                    onClick={() => setShowConfirmation((current) => !current)}
                    disabled={isLoading}
                    aria-label={showConfirmation ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                  >
                    {showConfirmation ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                  </button>
                  {confirmation && password === confirmation && <FiCheck className="password-reset-modal__confirmed-icon" aria-label="Les mots de passe correspondent" />}
                </div>
                {errors.confirmation && <p id="reset-password-confirmation-error" className="password-reset-modal__field-error" role="alert"><FiAlertCircle aria-hidden="true" />{errors.confirmation}</p>}
              </div>

              {copyStatus && (
                <p className={`password-reset-modal__copy-status ${copyStatus.tone}`} role="status" aria-live="polite">
                  {copyStatus.tone === 'copied' ? <FiCheckCircle aria-hidden="true" /> : <FiShield aria-hidden="true" />}
                  {copyStatus.text}
                </p>
              )}

              <footer className="password-reset-modal__footer">
                <p><FiShield aria-hidden="true" />Le mot de passe est haché de manière sécurisée lors de l’enregistrement.</p>
                <div>
                  <button type="button" className="password-reset-modal__cancel" onClick={requestClose} disabled={isLoading}>Annuler</button>
                  <button
                    type="submit"
                    className="password-reset-modal__submit"
                    disabled={isLoading || !canSubmit}
                    title={canSubmit ? undefined : 'Respectez les cinq exigences et confirmez le mot de passe.'}
                  >
                    {isLoading ? <><i className="password-reset-modal__spinner" aria-hidden="true" />Réinitialisation…</> : <><FiKey aria-hidden="true" />Réinitialiser l’accès</>}
                  </button>
                </div>
              </footer>
            </form>
          )}
        </div>
      </section>
    </Modal>
  )
}
