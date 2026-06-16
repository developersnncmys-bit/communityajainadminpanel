import { useEffect } from 'react'
import { TrendingUp, TrendingDown, X, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react'
import { useStore } from '../store'

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
        {subtitle && <p className="text-sm text-ink-400 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

const accents = {
  brand: 'bg-brand-50 text-brand-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  sky: 'bg-sky-50 text-sky-600',
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
}

export function StatCard({ icon: Icon, label, value, trend, accent = 'brand' }) {
  const up = trend >= 0
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${accents[accent] || accents.brand}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend !== undefined && (
          <span className={`badge ${up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-ink-900">{value}</p>
      <p className="text-sm text-ink-400">{label}</p>
    </div>
  )
}

const tones = {
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  blue: 'bg-sky-50 text-sky-700',
  red: 'bg-rose-50 text-rose-700',
  gray: 'bg-ink-100 text-ink-600',
  brand: 'bg-brand-50 text-brand-700',
}

export function Badge({ children, tone = 'gray' }) {
  return <span className={`badge ${tones[tone] || tones.gray}`}>{children}</span>
}

const statusTone = {
  active: 'green', live: 'green', success: 'green', Delivered: 'green', Completed: 'green',
  Pending: 'amber', draft: 'amber', Placed: 'amber', inactive: 'gray',
  Confirmed: 'blue', Packed: 'blue', Shipped: 'blue',
  Rejected: 'red',
}

export function StatusBadge({ value }) {
  return <Badge tone={statusTone[value] || 'gray'}>{value}</Badge>
}

export function BarChart({ data, valueKey, labelKey }) {
  const max = Math.max(...data.map((d) => d[valueKey])) || 1
  return (
    <div className="mt-2 border-b border-ink-100">
      <div className="flex items-end justify-between gap-3 h-48 pt-6">
        {data.map((d) => (
          <div key={d[labelKey]} className="group flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end justify-center">
              <div className="relative flex w-full max-w-[42px] flex-col items-center" style={{ height: `${(d[valueKey] / max) * 100}%` }}>
                <span className="mb-1 text-[11px] font-bold text-ink-600 opacity-0 transition-opacity group-hover:opacity-100">
                  {d[valueKey]}
                </span>
                <div className="w-full flex-1 rounded-t-lg bg-gradient-to-t from-brand-500 to-brand-300 transition-all group-hover:from-brand-600 group-hover:to-brand-400" />
              </div>
            </div>
            <span className="text-xs font-medium text-ink-400">{d[labelKey]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Table({ columns, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/60 text-left">
              {columns.map((c) => (
                <th key={c} className="px-5 py-3.5 font-semibold text-ink-600 whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">{children}</tbody>
        </table>
      </div>
    </div>
  )
}

export function Avatar({ name }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('')
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
      {initials}
    </span>
  )
}

// ---- Modal -----------------------------------------------------------------
export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  const width = size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-lg'
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`card relative z-10 w-full ${width} animate-[fadeIn_.15s_ease-out] p-6`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-ink-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl text-ink-400 hover:bg-ink-50 hover:text-ink-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}

// ---- Form fields -----------------------------------------------------------
export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  )
}

const inputCls = 'w-full rounded-xl border border-ink-100 bg-surface px-3.5 py-2.5 text-sm text-ink-800 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'
export function Input(props) {
  return <input {...props} className={`${inputCls} ${props.className || ''}`} />
}
export function Select({ children, ...props }) {
  return <select {...props} className={`${inputCls} ${props.className || ''}`}>{children}</select>
}
export function Textarea(props) {
  return <textarea {...props} className={`${inputCls} ${props.className || ''}`} />
}

// ---- Toasts ----------------------------------------------------------------
const toastStyle = {
  success: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-800', Icon: CheckCircle2 },
  warn: { cls: 'border-amber-200 bg-amber-50 text-amber-800', Icon: AlertTriangle },
  error: { cls: 'border-rose-200 bg-rose-50 text-rose-800', Icon: XCircle },
  info: { cls: 'border-sky-200 bg-sky-50 text-sky-800', Icon: Info },
}
export function Toasts() {
  const { toasts, dismissToast } = useStore()
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const { cls, Icon } = toastStyle[t.tone] || toastStyle.success
        return (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-card ${cls}`}>
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismissToast(t.id)} className="opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
          </div>
        )
      })}
    </div>
  )
}
