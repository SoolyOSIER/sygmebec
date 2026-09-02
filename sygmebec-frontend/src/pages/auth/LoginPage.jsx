import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import logo from '../../../../Logo.png'
import Button from '../../components/ui/Button'
import { useLogin } from '../../hooks/useAuth'
import useT from '../../i18n/useT'

export default function LoginPage() {
  const { t } = useT()
  const [identifiant, setIdentifiant] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending } = useLogin()

  const handleSubmit = (e) => {
    e.preventDefault()
    login({ identifiant, password, remember })
  }

  const handleCancel = () => {
    setIdentifiant('')
    setPassword('')
    setRemember(false)
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
            {t('auth.loginSubtitle')}
          </p>
        </section>

        <section className="px-8 py-10 md:px-12">
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-secondary-900">{t('auth.loginTitle')}</h2>
              <div className="mx-auto mt-3 h-0.5 w-12 bg-primary-600" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-secondary-800">
                  {t('common.username')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                  <input
                    value={identifiant}
                    onChange={(e) => setIdentifiant(e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    placeholder={t('auth.usernamePlaceholder')}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-secondary-800">
                  {t('common.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    placeholder={t('auth.passwordPlaceholder')}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 hover:text-secondary-800"
                    aria-label={showPassword ? t('auth.passwordToggleHide') : t('auth.passwordToggleShow')}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-secondary-700">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                {t('common.rememberMe')}
              </label>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <Button type="submit" isLoading={isPending} className="h-11" icon={User}>
                  {t('common.login')}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="h-11">
                  {t('common.cancel')}
                </Button>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-secondary-600">
                  {t('auth.noAccount')}{' '}
                  <Link to="/register" className="text-primary-600 font-medium hover:underline">{t('auth.signUp')}</Link>
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
