import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, ListChecks, CheckSquare, Wallet, Package,
  BarChart3, ShieldCheck, Bell, Search, Menu, X, ChevronRight, Sun, Moon, CalendarClock, LogOut,
} from 'lucide-react'
import { formatINR } from '../data/mock'
import { useStore } from '../store'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/activities', label: 'Activities', icon: ListChecks },
  { to: '/approvals', label: 'Approval Queue', icon: CheckSquare, badgeKey: 'approvals' },
  { to: '/wallet', label: 'Gift Wallet', icon: Wallet },
  { to: '/orders', label: 'Gift Orders', icon: Package },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/access', label: 'Role & Access', icon: ShieldCheck },
]

function Sidebar({ open, onClose }) {
  const { community, approvals, user, logout } = useStore()
  const badges = { approvals: approvals.length }
  const initials = (user?.name || community.principal).split(' ').map((p) => p[0]).slice(0, 2).join('')
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/40 lg:hidden ${open ? 'block' : 'hidden'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed z-40 flex h-full w-72 flex-col bg-gradient-to-b from-brand-700 to-brand-900 px-4 py-6 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#ffffff] text-2xl">🪔</div>
          <div className="leading-tight">
            <p className="text-base font-extrabold text-white">Jain Patashala</p>
            <p className="text-xs font-medium text-brand-200">Community Admin</p>
          </div>
          <button className="ml-auto text-white/80 lg:hidden" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-6 rounded-2xl bg-white/10 p-4">
          <p className="text-xs font-medium text-brand-200">Gift Wallet balance</p>
          <p className="mt-1 text-xl font-bold text-white">{formatINR(community.giftWalletBalancePaise)}</p>
          <p className="mt-1 text-xs text-brand-200">{community.name}</p>
        </div>

        <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const badge = item.badgeKey ? badges[item.badgeKey] : 0
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {badge > 0 && (
                  <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/10 p-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#ffffff] text-sm font-bold text-brand-700">{initials}</span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-white">{user?.name || community.principal}</p>
            <p className="text-xs text-brand-200">{user?.role || 'Principal'}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
            className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-xl text-brand-100 hover:bg-white/15 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  )
}

function Notifications() {
  const { approvals, orders, community } = useStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const items = []
  if (approvals.length) items.push({ text: `${approvals.length} completion${approvals.length === 1 ? '' : 's'} pending approval`, to: '/approvals' })
  const openOrders = orders.filter((o) => !['Delivered'].includes(o.status)).length
  if (openOrders) items.push({ text: `${openOrders} order${openOrders === 1 ? '' : 's'} in fulfillment`, to: '/orders' })
  if (community.giftWalletBalancePaise < 5_00_000_00) items.push({ text: 'Gift Wallet running low — consider a top-up', to: '/wallet' })

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-ink-100 bg-surface hover:bg-ink-100"
      >
        <Bell className="h-5 w-5 text-ink-600" />
        {items.length > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded-2xl border border-ink-100 bg-surface shadow-card">
            <div className="border-b border-ink-100 px-4 py-3 text-sm font-bold text-ink-900">Notifications</div>
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink-400">You're all caught up.</p>
            ) : (
              items.map((it, i) => (
                <button
                  key={i}
                  onClick={() => { navigate(it.to); setOpen(false) }}
                  className="flex w-full items-start gap-2 border-b border-ink-100 px-4 py-3 text-left text-sm text-ink-700 last:border-0 hover:bg-ink-50"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {it.text}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const date = now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
  const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  return (
    <div className="hidden items-center gap-2 rounded-xl border border-ink-100 bg-surface px-3 py-2 lg:flex">
      <CalendarClock className="h-4 w-4 text-brand-500" />
      <span className="text-sm font-medium text-ink-600">{date}</span>
      <span className="text-sm font-bold tabular-nums text-ink-900">{time}</span>
    </div>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useStore()
  const dark = theme === 'dark'
  return (
    <button
      onClick={toggleTheme}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
      className="grid h-10 w-10 place-items-center rounded-xl border border-ink-100 bg-surface text-ink-600 hover:bg-ink-100"
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}

function Topbar({ onMenu }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const current = nav.find((n) => n.to === location.pathname)?.label || 'Overview'

  function submitSearch(e) {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/members?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-ink-100 bg-surface/80 px-4 py-3 backdrop-blur lg:px-8">
      <button className="lg:hidden" onClick={onMenu}><Menu className="h-6 w-6" /></button>
      <div className="hidden items-center gap-1.5 text-sm text-ink-400 sm:flex">
        <span>Jain Patashala</span>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-ink-800">{current}</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Clock />
        <form onSubmit={submitSearch} className="hidden items-center gap-2 rounded-xl border border-ink-100 bg-ink-50 px-3 py-2 md:flex">
          <Search className="h-4 w-4 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members…"
            className="w-44 bg-transparent text-sm outline-none placeholder:text-ink-400"
          />
        </form>
        <ThemeToggle />
        <Notifications />
      </div>
    </header>
  )
}

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
