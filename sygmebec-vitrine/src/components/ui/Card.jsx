import { t, useTranslation } from '../../i18n'
export function Card({ children, className = '' }) {
  useTranslation()

  return <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{t(children)}</div>
}

export function CardHeader({ children, className = '' }) {
  useTranslation()

  return <div className={`border-b border-slate-100 px-6 py-4 ${className}`}>{t(children)}</div>
}

export function CardTitle({ children, className = '' }) {
  useTranslation()

  return <h3 className={`text-lg font-semibold text-slate-900 ${className}`}>{t(children)}</h3>
}

export function CardDescription({ children, className = '' }) {
  useTranslation()

  return <p className={`mt-1 text-sm text-slate-500 ${className}`}>{t(children)}</p>
}

export function CardContent({ children, className = '' }) {
  useTranslation()

  return <div className={`p-6 ${className}`}>{t(children)}</div>
}
