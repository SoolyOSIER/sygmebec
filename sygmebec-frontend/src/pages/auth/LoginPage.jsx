import { useState } from 'react'
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
    <div className="w-full max-w-6xl overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-700">
      <div className="grid min-h-[570px] md:grid-cols-[42%_58%]">
        <section className="flex flex-col items-center justify-center bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 px-8 py-12 text-center text-white">
          <div className="brand-logo-surface relative mb-10 flex h-20 w-20 items-center justify-center rounded-xl p-1">
            <img src={logo} alt="Logo de l’Église Baptiste de l’Espoir" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-4xl font-bold tracking-normal">SYGMEBEC</h1>
          <p className="mt-5 max-w-sm text-base leading-7 text-white">
            {t('auth.loginSubtitle')}
          </p>
        </section>

        <section className="login-form-panel flex items-center px-8 py-12 md:px-16">
          <div className="mx-auto w-full max-w-lg">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-semibold text-secondary-900">{t('auth.loginTitle')}</h2>
              <div className="mx-auto mt-4 h-0.5 w-14 bg-primary-600" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900">
              <div>
                <label className="mb-2 block text-sm font-semibold text-secondary-800">
                  {t('common.username')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                  <input
                    value={identifiant}
                    onChange={(e) => setIdentifiant(e.target.value)}
                    className="h-[3.25rem] w-full rounded-lg border border-slate-300 bg-white pl-12 pr-3 text-base text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
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
                    className="h-[3.25rem] w-full rounded-lg border border-slate-300 bg-white pl-12 pr-10 text-base text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
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

              <div className="grid grid-cols-2 gap-5 pt-3">
                <Button type="submit" isLoading={isPending} className="h-[3.25rem] rounded-xl text-base" icon={User}>
                  {t('common.login')}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="h-[3.25rem] rounded-xl text-base">
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
