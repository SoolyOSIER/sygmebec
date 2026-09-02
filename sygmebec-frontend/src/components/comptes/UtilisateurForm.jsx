import { useMemo, useState } from 'react'
import {
  FiBookOpen,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
  FiUserPlus,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import {
  getPasswordPolicyError,
  getPasswordStrength,
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_SUMMARY,
} from '../../utils/passwordPolicy'
import './utilisateurCreate.css'
import useT from '../../i18n/useT'

const roles = [
  { id: 3, name: 'Administrateur', text: 'Accès complet : membres, rapports et utilisateurs', icon: FiShield, tone: 'admin' },
  { id: 2, name: 'Pasteur', text: 'Accès aux membres, événements et rapports', icon: FiUsers, tone: 'pasteur' },
  { id: 1, name: 'Secrétaire', text: 'Gère les membres, comptes rendus et communications', icon: FiBookOpen, tone: 'secretaire' },
]

const initials = (value) => value.trim().split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?'

export default function UtilisateurForm({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading,
  membres = [],
  isEditing = false,
}) {
  const { t } = useT()
  const existingName = [initialData.membre?.prenom || '', initialData.membre?.nom || ''].join(' ').trim()
  const [form, setForm] = useState({
    nom_complet: existingName,
    email: initialData.membre?.email || '',
    telephone: initialData.telephone || initialData.membre?.telephone || '',
    identifiant: initialData.identifiant || '',
    password: '',
    role_id: String(initialData.role_acces?.id || ''),
    membre_id: String(initialData.membre?.id || ''),
    is_active: initialData.is_active ?? true,
    note: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const selectedRole = useMemo(
    () => roles.find((role) => String(role.id) === String(form.role_id)),
    [form.role_id],
  )
  const passwordStrength = getPasswordStrength(form.password)

  const change = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: null }))
  }

  const submit = (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (!form.nom_complet.trim() && !isEditing) nextErrors.nom_complet = 'Le nom complet est requis.'
    if (!form.identifiant.trim()) nextErrors.identifiant = 'L’identifiant est requis.'
    if (!form.password && !isEditing) nextErrors.password = 'Le mot de passe est requis.'

    if (form.password) {
      const policyError = getPasswordPolicyError(form.password)
      if (policyError) nextErrors.password = policyError
    }

    if (!form.role_id) nextErrors.role_id = 'Sélectionnez un rôle.'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    const payload = {
      identifiant: form.identifiant.trim(),
      role_id: Number(form.role_id),
      membre_id: form.membre_id ? Number(form.membre_id) : null,
      is_active: form.is_active,
    }

    if (isEditing) {
      if (form.password) {
        payload.password = form.password
        payload.password_confirm = form.password
      }
      onSubmit(payload)
      return
    }

    onSubmit({
      ...payload,
      nom_complet: form.nom_complet.trim(),
      email: form.email.trim(),
      telephone: form.telephone.trim(),
      password: form.password,
      password_confirm: form.password,
    })
  }

  return (
    <form className="user-create" onSubmit={submit}>
      <header className="user-create-head">
        <div className="user-create-title">
          <span><FiUserPlus /></span>
          <div>
            <small>SYGMEBEC · Gestion des accès</small>
            <h2>{isEditing ? 'Modifier un utilisateur' : 'Créer un utilisateur'}</h2>
            <p>{isEditing ? 'Mettez à jour les informations et les accès de ce compte.' : t('accountForm.newUserDescription')}</p>
          </div>
        </div>
        {onCancel && <button type="button" className="user-close" onClick={onCancel} aria-label="Fermer"><FiX /></button>}
      </header>

      <div className="user-steps"><span>Identité</span><i /><span>Accès & sécurité</span><i /><span>Rôle & statut</span></div>

      <div className="user-create-body">
        <div className="user-preview">
          <b>{initials(form.nom_complet)}</b>
          <div>
            <strong>{form.nom_complet.trim() || 'Nouvel utilisateur'}</strong>
            <small>{selectedRole?.name || 'Aucun rôle sélectionné'}</small>
          </div>
        </div>

        <section>
          <SectionTitle number="1" title="Informations personnelles" text="Nom, courriel et téléphone de contact" />
          <label>
            Nom complet <em>*</em>
            <Field icon={FiUser} value={form.nom_complet} onChange={(event) => change('nom_complet', event.target.value)} placeholder="ex. Osier Storly" error={errors.nom_complet} />
          </label>
          <div className="user-fields">
            <label>
              Courriel <small>(optionnel)</small>
              <Field icon={FiMail} type="email" value={form.email} onChange={(event) => change('email', event.target.value)} placeholder="nom@sygmebec.org" />
            </label>
            <label>
              Téléphone <small>(optionnel)</small>
              <Field icon={FiPhone} value={form.telephone} onChange={(event) => change('telephone', event.target.value)} placeholder="+509 34 00 0000" />
            </label>
          </div>
        </section>

        <section>
          <SectionTitle number="2" title="Identifiants de connexion" text="Servent à ouvrir une session sur SYGMEBEC" />
          <label>
            Identifiant <em>*</em>
            <Field icon={FiUser} value={form.identifiant} onChange={(event) => change('identifiant', event.target.value)} placeholder="Nom d’utilisateur" error={errors.identifiant} />
          </label>
          <label>
            {isEditing ? 'Nouveau mot de passe ' : 'Mot de passe '}<em>{isEditing ? '(optionnel)' : '*'}</em>
            <div className={['user-input', errors.password ? 'error' : ''].filter(Boolean).join(' ')}>
              <FiLock />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(event) => change('password', event.target.value)}
                placeholder="Mot de passe sécurisé"
                autoComplete="new-password"
                minLength={PASSWORD_MIN_LENGTH}
                aria-invalid={Boolean(errors.password)}
                aria-describedby="user-password-policy user-password-error"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {form.password && (
              <>
                <div className="user-password-meter" aria-hidden="true">
                  {passwordStrength.checks.map((check) => <i key={check.id} className={check.valid ? 'on' : ''} />)}
                </div>
                <p id="user-password-policy" className={['user-password-hint', passwordStrength.isCompliant ? 'is-strong' : ''].filter(Boolean).join(' ')} role="status">
                  <strong>{passwordStrength.label}.</strong> {PASSWORD_POLICY_SUMMARY}
                </p>
              </>
            )}
            {errors.password && <p id="user-password-error" className="user-error" role="alert">{errors.password}</p>}
          </label>
        </section>

        <section>
          <SectionTitle number="3" title="Rôle" text="Détermine les permissions accordées dans le système" />
          <div className="user-role-grid">
            {roles.map((role) => {
              const Icon = role.icon
              const isSelected = String(form.role_id) === String(role.id)
              return (
                <button
                  type="button"
                  key={role.id}
                  className={[role.tone, isSelected ? 'selected' : ''].filter(Boolean).join(' ')}
                  onClick={() => change('role_id', String(role.id))}
                >
                  <i><Icon /></i>
                  <span className="user-role-check"><FiCheck /></span>
                  <b>{role.name}</b>
                  <small>{role.text}</small>
                </button>
              )
            })}
          </div>
          {errors.role_id && <p className="user-error" role="alert">{errors.role_id}</p>}
        </section>

        <section>
          <SectionTitle number="4" title="Membre associé" text="Relie ce compte à une fiche membre existante" optional />
          <label className="user-member-select">
            <FiUsers />
            <select value={form.membre_id} onChange={(event) => change('membre_id', event.target.value)}>
              <option value="">Aucun membre associé</option>
              {membres.map((member) => <option key={member.id} value={member.id}>{member.prenom || ''} {member.nom || ''}</option>)}
            </select>
          </label>
        </section>

        <section>
          <SectionTitle number="5" title="Statut du compte" text="Contrôlez l’accès dès la création" />
          <div className="user-status">
            <div>
              <i className={form.is_active ? 'on' : ''} />
              <p>
                <b>{form.is_active ? 'Compte actif' : 'Compte inactif'}</b>
                <small>{form.is_active ? 'L’utilisateur pourra se connecter immédiatement' : 'L’accès restera désactivé jusqu’à son activation'}</small>
              </p>
            </div>
            <button type="button" className={form.is_active ? 'on' : ''} onClick={() => change('is_active', !form.is_active)} aria-pressed={form.is_active}><i /></button>
          </div>
          <label>
            Note interne <small>(optionnel)</small>
            <textarea value={form.note} onChange={(event) => change('note', event.target.value)} placeholder="ex. Accès temporaire pour la période des récoltes de fonds…" />
          </label>
        </section>
      </div>

      <footer className="user-create-foot">
        <p><FiLock />Les mots de passe sont hachés et protégés par le système.</p>
        <div>
          <button type="button" onClick={onCancel || (() => window.history.back())}>Annuler</button>
          <button type="submit" className="user-submit" disabled={isLoading}>
            {isLoading ? 'Enregistrement…' : <><FiUserPlus />{isEditing ? 'Enregistrer les modifications' : 'Créer l’utilisateur'}</>}
          </button>
        </div>
      </footer>
    </form>
  )
}

function SectionTitle({ number, title, text, optional }) {
  return <header className="user-section-title"><b>{number}</b><div>{title} {optional && <small>(optionnel)</small>}<span>{text}</span></div></header>
}

function Field({ icon: Icon, error, ...props }) {
  return <div className={['user-input', error ? 'error' : ''].filter(Boolean).join(' ')}><Icon /><input {...props} />{props.value && !error && <FiCheck className="user-valid" />}</div>
}
