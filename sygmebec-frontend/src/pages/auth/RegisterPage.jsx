import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import logo from '../../../../Logo.png'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { authApi } from '../../api/authApi'
import { useNavigate } from 'react-router-dom'
import { getPasswordPolicyError, getPasswordStrength, PASSWORD_POLICY_SUMMARY } from '../../utils/passwordPolicy'
import useT from '../../i18n/useT'

export default function RegisterPage() {
  const { t } = useT()
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [sexe, setSexe] = useState('MALE')
  const [dateNaissance, setDateNaissance] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [adresse, setAdresse] = useState('')
  const [identifiant, setIdentifiant] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const passwordStrength = getPasswordStrength(password)

  const { mutate: registerUser, isLoading: isPending } = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      navigate('/login')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!nom || !prenom || !telephone || !email || !adresse || !identifiant || !password) return
    if (password !== passwordConfirm) {
      setPasswordError(t('auth.passwordMismatch'))
      return
    }
    const policyError = getPasswordPolicyError(password)
    if (policyError) {
      setPasswordError(policyError)
      return
    }

    setPasswordError('')

    registerUser({
      nom,
      prenom,
      sexe,
      date_naissance: dateNaissance,
      telephone,
      email,
      adresse,
      identifiant,
      password,
      password_confirm: passwordConfirm,
    })
  }

  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-lg border border-slate-300 bg-white shadow-panel">
      <div className="grid min-h-[420px] md:grid-cols-[0.95fr_1.35fr]">
        <section className="bg-gradient-to-br from-primary-700 to-primary-900 px-8 py-10 text-white flex flex-col items-center justify-center text-center">
          <div className="relative mb-5 flex h-24 w-24 items-center justify-center">
            <img src={logo} alt="Logo" className="h-20 w-20 object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-normal">SYGMEBEC</h1>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/90">
            {t('auth.registerSubtitle')}
          </p>
        </section>

        <section className="px-8 py-10 md:px-12">
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-secondary-900">{t('auth.createAccount')}</h2>
              <div className="mx-auto mt-3 h-0.5 w-12 bg-primary-600" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label={t('common.lastName')}
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder={t('auth.lastNamePlaceholder')}
                  required
                />
                <Input
                  label={t('common.firstName')}
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder={t('auth.firstNamePlaceholder')}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-secondary-800">{t('common.gender')}</label>
                  <select
                    value={sexe}
                    onChange={(e) => setSexe(e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    required
                  >
                    <option value="MALE">{t('auth.male')}</option>
                    <option value="FEMELLE">{t('auth.female')}</option>
                  </select>
                </div>
                <Input
                  label={t('common.birthDate')}
                  type="date"
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label={t('common.phone')}
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder={t('auth.phonePlaceholder')}
                  required
                />
                <Input
                  label={t('common.email')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  required
                />
              </div>

              <Input
                label={t('common.address')}
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder={t('auth.addressPlaceholder')}
                required
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-secondary-800">{t('common.username')}</label>
                <Input
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  placeholder={t('auth.chooseUsername')}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-secondary-800">{t('common.password')}</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
                    placeholder={t('auth.passwordPrompt')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 hover:text-secondary-800"
                    aria-label={showPassword ? t('auth.passwordToggleHide') : t('auth.passwordToggleShow')}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-secondary-600" aria-live="polite"><strong>{passwordStrength.label}.</strong> {t('auth.passwordPolicySummary')}</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-secondary-800">{t('auth.confirmPasswordLabel')}</label>
                <Input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => { setPasswordConfirm(e.target.value); setPasswordError('') }}
                  placeholder={t('auth.passwordConfirmPlaceholder')}
                  required
                />
              </div>
              {passwordError ? <p className="text-sm text-rose-600" role="alert">{passwordError}</p> : null}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <Button type="submit" isLoading={isPending} disabled={!passwordStrength.isCompliant || password !== passwordConfirm} className="h-11">
                  {t('auth.createAccountButton')}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/login')} className="h-11">
                  {t('auth.returnLogin')}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
