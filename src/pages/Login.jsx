import { useState } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck, Sparkles, Sun, Moon } from 'lucide-react'
import { Field, Input } from '../components/ui'
import { useStore } from '../store'

export default function Login() {
  const { user, login, theme, toggleTheme } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)

  // Already signed in → go to the dashboard (or wherever they came from).
  if (user) return <Navigate to={location.state?.from || '/'} replace />

  async function submit(e) {
    e.preventDefault()
    if (await login(form)) navigate(location.state?.from || '/', { replace: true })
  }

  function useDemo() {
    setForm({ email: 'principal@mahavir.com', password: 'principal123' })
  }

  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 to-brand-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ffffff] text-3xl">🪔</div>
          <div>
            <p className="text-lg font-extrabold">Jain Patashala</p>
            <p className="text-sm text-brand-200">Community Admin Panel</p>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight">Reward Jain values.<br />Inspire your community.</h1>
          <p className="mt-4 text-brand-100">
            Manage members, assign value-based activities, approve completions, and run your gifting — all from one place.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              'Points economy with a transparent ledger',
              'Proof-based approvals and gift fulfillment',
              'Prepaid Gift Wallet powered by Razorpay',
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15"><Sparkles className="h-3.5 w-3.5" /></span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-brand-200">© 2026 Nakshatra Namaha Creations Pvt. Ltd.</p>
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 right-10 h-56 w-56 rounded-full bg-brand-300/20 blur-3xl" />
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-10 lg:w-1/2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-xl border border-ink-100 bg-surface text-ink-600 hover:bg-ink-100"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-2xl">🪔</div>
            <div>
              <p className="text-base font-extrabold text-ink-900">Jain Patashala</p>
              <p className="text-xs text-ink-400">Community Admin</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-ink-900">Sign in</h2>
          <p className="mt-1 text-sm text-ink-400">Welcome back — sign in to your community panel.</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <Field label="Email address">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <Input
                  type="email"
                  autoFocus
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@community.org"
                  className="pl-10"
                  required
                />
              </div>
            </Field>

            <Field label="Password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <Input
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="px-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-ink-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-ink-100 text-brand-600 focus:ring-brand-400"
                />
                Remember me
              </label>
              <button type="button" onClick={() => alert('Password reset is handled by your Super Admin in Phase 1.')} className="font-semibold text-brand-600 hover:text-brand-700">
                Forgot password?
              </button>
            </div>

            <button type="submit" className="btn-primary w-full"><LogIn className="h-4 w-4" /> Sign in</button>
          </form>

          <button
            onClick={useDemo}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink-100 bg-surface px-4 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
          >
            <ShieldCheck className="h-4 w-4 text-brand-500" /> Use demo credentials
          </button>

          <p className="mt-6 text-center text-xs text-ink-400">
            Members sign in on the mobile app with phone OTP. This panel is for Principals & Admins.
          </p>
        </div>
      </div>
    </div>
  )
}
