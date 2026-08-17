export function Card({ children, className = '' }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
}

export function CardHeader({ children, className = '' }) {
  return <div className={`border-b border-slate-100 px-6 py-4 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-lg font-semibold text-slate-900 ${className}`}>{children}</h3>
}

export function CardDescription({ children, className = '' }) {
  return <p className={`mt-1 text-sm text-slate-500 ${className}`}>{children}</p>
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}
