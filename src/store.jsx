// Shared client-side store for the Community Admin Panel.
// Seeds from mock data, then holds all mutable state so button actions
// (add member, approve completion, top up wallet, place order, …) persist
// as the user moves between pages. No backend — this is a working prototype.
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import {
  community as seedCommunity,
  members as seedMembers,
  activities as seedActivities,
  approvals as seedApprovals,
  orders as seedOrders,
  walletTxns as seedWalletTxns,
  admins as seedAdmins,
} from './data/mock'

const StoreContext = createContext(null)
export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

let counter = 1000
const uid = (prefix) => `${prefix}-${++counter}`
const today = () => new Date().toISOString().slice(0, 10)
const now = () => new Date().toISOString().slice(0, 16).replace('T', ' ')

export function StoreProvider({ children }) {
  const [community, setCommunity] = useState(seedCommunity)
  const [members, setMembers] = useState(seedMembers)
  const [activities, setActivities] = useState(seedActivities)
  const [approvals, setApprovals] = useState(seedApprovals)
  const [orders, setOrders] = useState(seedOrders)
  const [walletTxns, setWalletTxns] = useState(seedWalletTxns)
  const [admins, setAdmins] = useState(seedAdmins)
  const [auditLog, setAuditLog] = useState([
    { who: 'Rajesh Shah', action: 'Granted Admin rights to Nilesh Doshi', when: '2026-02-12 10:15' },
    { who: 'Pooja Mehta', action: 'Approved 3 proof-based completions', when: '2026-06-15 09:30' },
    { who: 'Nilesh Doshi', action: 'Placed bulk order ORD-5516 (50 kits)', when: '2026-06-14 17:05' },
    { who: 'Rajesh Shah', action: 'Topped up Gift Wallet (+₹5,00,000)', when: '2026-06-10 12:00' },
  ])

  // ---- Theme (light / dark) -------------------------------------------
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    const saved = localStorage.getItem('jp-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('jp-theme', theme)
  }, [theme])
  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  // ---- Toasts ----------------------------------------------------------
  const [toasts, setToasts] = useState([])
  const toast = useCallback((message, tone = 'success') => {
    const id = uid('T')
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const audit = useCallback((who, action) => {
    setAuditLog((l) => [{ who, action, when: now() }, ...l])
  }, [])

  // ---- Members ---------------------------------------------------------
  const addMember = useCallback((data) => {
    const m = {
      id: uid('M'),
      name: data.name,
      segment: data.segment || 'Working',
      points: 0,
      status: 'active',
      joined: today(),
      phone: data.phone || '—',
    }
    setMembers((list) => [m, ...list])
    toast(`Member “${m.name}” added`)
    audit('You', `Added member ${m.name} (${m.segment})`)
  }, [toast, audit])

  const importMembers = useCallback((rows) => {
    const created = rows.map((r) => ({
      id: uid('M'), name: r.name, segment: r.segment || 'Working',
      points: 0, status: 'active', joined: today(), phone: r.phone || '—',
    }))
    setMembers((list) => [...created, ...list])
    toast(`Imported ${created.length} member${created.length === 1 ? '' : 's'} from CSV`)
    audit('You', `Imported ${created.length} members via CSV`)
  }, [toast, audit])

  const toggleMemberStatus = useCallback((id) => {
    setMembers((list) => list.map((m) => {
      if (m.id !== id) return m
      const status = m.status === 'active' ? 'inactive' : 'active'
      toast(`${m.name} ${status === 'active' ? 'reactivated' : 'deactivated'}`, status === 'active' ? 'success' : 'warn')
      return { ...m, status }
    }))
  }, [toast])

  // ---- Activities ------------------------------------------------------
  const addActivity = useCallback((data) => {
    const a = {
      id: uid('A'),
      title: data.title,
      mode: data.mode || 'Self-declared',
      points: Number(data.points) || 0,
      segment: data.segment || 'All',
      due: data.due || today(),
      recurrence: data.recurrence || 'None',
      status: data.status || 'live',
    }
    setActivities((list) => [a, ...list])
    toast(`Activity “${a.title}” ${a.status === 'draft' ? 'saved as draft' : 'published'}`)
    audit('You', `Created activity “${a.title}” (${a.points} pts)`)
  }, [toast, audit])

  const toggleActivityStatus = useCallback((id) => {
    setActivities((list) => list.map((a) =>
      a.id === id ? { ...a, status: a.status === 'live' ? 'draft' : 'live' } : a
    ))
  }, [])

  // ---- Approvals -------------------------------------------------------
  const approveCompletion = useCallback((id) => {
    setApprovals((q) => {
      const c = q.find((x) => x.id === id)
      if (c) {
        setMembers((list) => list.map((m) => m.name === c.member ? { ...m, points: m.points + c.points } : m))
        toast(`Approved — +${c.points} pts credited to ${c.member}`)
        audit('You', `Approved completion ${c.id} (+${c.points} pts to ${c.member})`)
      }
      return q.filter((x) => x.id !== id)
    })
  }, [toast, audit])

  const rejectCompletion = useCallback((id, reason) => {
    setApprovals((q) => {
      const c = q.find((x) => x.id === id)
      if (c) {
        toast(`Rejected ${c.member}'s submission`, 'warn')
        audit('You', `Rejected completion ${c.id}${reason ? ` — ${reason}` : ''}`)
      }
      return q.filter((x) => x.id !== id)
    })
  }, [toast, audit])

  // ---- Wallet ----------------------------------------------------------
  const topUpWallet = useCallback((rupees) => {
    const paise = Math.round(Number(rupees) * 100)
    if (!paise || paise <= 0) return
    setCommunity((c) => ({ ...c, giftWalletBalancePaise: c.giftWalletBalancePaise + paise }))
    setWalletTxns((t) => [
      { id: uid('WT'), type: 'topup', amountPaise: paise, ref: `Razorpay rzp_${Math.floor(counter * 7).toString(16)}`, date: today(), status: 'success' },
      ...t,
    ])
    toast(`Gift Wallet topped up by ₹${Number(rupees).toLocaleString('en-IN')}`)
    audit('You', `Topped up Gift Wallet (+₹${Number(rupees).toLocaleString('en-IN')})`)
  }, [toast, audit])

  // ---- Orders ----------------------------------------------------------
  const placeBulkOrder = useCallback((data) => {
    const totalPaise = Math.round(Number(data.totalRupees) * 100)
    if (totalPaise > community.giftWalletBalancePaise) {
      toast('Gift Wallet balance too low for this order', 'error')
      return false
    }
    const order = {
      id: uid('ORD'),
      member: '—',
      type: 'Bulk',
      item: data.item,
      qty: Number(data.qty) || 1,
      target: data.target || 'Community',
      totalPaise,
      status: 'Placed',
      tracking: '—',
    }
    setOrders((list) => [order, ...list])
    setCommunity((c) => ({ ...c, giftWalletBalancePaise: c.giftWalletBalancePaise - totalPaise }))
    setWalletTxns((t) => [
      { id: uid('WT'), type: 'debit', amountPaise: totalPaise, ref: `${order.id} (bulk)`, date: today(), status: 'success' },
      ...t,
    ])
    toast(`Bulk order ${order.id} placed (${order.qty} × ${order.item})`)
    audit('You', `Placed bulk order ${order.id} (${order.qty} × ${order.item})`)
    return true
  }, [community.giftWalletBalancePaise, toast, audit])

  const ORDER_FLOW = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered']
  const advanceOrder = useCallback((id) => {
    setOrders((list) => list.map((o) => {
      if (o.id !== id) return o
      const idx = ORDER_FLOW.indexOf(o.status)
      if (idx < 0 || idx >= ORDER_FLOW.length - 1) return o
      const status = ORDER_FLOW[idx + 1]
      const tracking = status === 'Shipped' && o.tracking === '—' ? `DLV${Math.floor(counter * 13)}` : o.tracking
      toast(`${o.id} → ${status}`)
      return { ...o, status, tracking }
    }))
  }, [toast])

  // ---- Access ----------------------------------------------------------
  const grantAdmin = useCallback((data) => {
    const a = { name: data.name, role: 'Admin', scope: data.scope || 'Members, Activities', grantedBy: community.principal, since: today() }
    setAdmins((list) => [...list, a])
    toast(`Admin rights granted to ${a.name}`)
    audit(community.principal, `Granted Admin rights to ${a.name}`)
  }, [community.principal, toast, audit])

  const revokeAdmin = useCallback((name) => {
    setAdmins((list) => list.filter((a) => a.name !== name))
    toast(`Admin rights revoked from ${name}`, 'warn')
    audit(community.principal, `Revoked Admin rights from ${name}`)
  }, [community.principal, toast, audit])

  const value = useMemo(() => ({
    community, members, activities, approvals, orders, walletTxns, admins, auditLog,
    theme, toggleTheme,
    toasts, toast, dismissToast,
    addMember, importMembers, toggleMemberStatus,
    addActivity, toggleActivityStatus,
    approveCompletion, rejectCompletion,
    topUpWallet, placeBulkOrder, advanceOrder,
    grantAdmin, revokeAdmin,
  }), [
    community, members, activities, approvals, orders, walletTxns, admins, auditLog, theme, toggleTheme, toasts,
    toast, dismissToast, addMember, importMembers, toggleMemberStatus, addActivity, toggleActivityStatus,
    approveCompletion, rejectCompletion, topUpWallet, placeBulkOrder, advanceOrder, grantAdmin, revokeAdmin,
  ])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
