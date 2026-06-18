// Shared store for the Community Admin Panel.
// Data now comes from the Node/Express + MongoDB API (see ./api/client.js).
// Sign in as the community Principal (principal@mahavir.com / principal123) to
// unlock every action: members, activities, approvals, wallet top-up, orders
// and access control. Auth uses a real JWT.
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { api, getToken, setToken } from './api/client'

const StoreContext = createContext(null)
export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

const ORDER_FLOW = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered']

export function StoreProvider({ children }) {
  const [community, setCommunity] = useState({ name: '—', type: '', code: '', principal: '—', giftWalletBalancePaise: 0 })
  const [members, setMembers] = useState([])
  const [activities, setActivities] = useState([])
  const [approvals, setApprovals] = useState([])
  const [orders, setOrders] = useState([])
  const [walletTxns, setWalletTxns] = useState([])
  const [admins, setAdmins] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [gifts, setGifts] = useState([])

  // ---- Theme (light / dark) ----
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    const saved = localStorage.getItem('jp-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('jp-theme', theme)
  }, [theme])
  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  // ---- Toasts ----
  const [toasts, setToasts] = useState([])
  const toast = useCallback((message, tone = 'success') => {
    const id = `T-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const run = useCallback(async (fn, errMsg) => {
    try { return await fn() } catch (e) { toast(e.message || errMsg, 'error'); return null }
  }, [toast])

  // ---- Auth ----
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null
    try { const s = localStorage.getItem('jp-user'); return s ? JSON.parse(s) : null } catch { return null }
  })
  useEffect(() => {
    if (user) localStorage.setItem('jp-user', JSON.stringify(user))
    else localStorage.removeItem('jp-user')
  }, [user])

  // ---- Loaders ----
  const refreshMembers = useCallback(async () => setMembers(await api.listMembers()), [])
  const refreshOrders = useCallback(async () => setOrders(await api.listOrders()), [])
  const refreshWallet = useCallback(async () => {
    const [c, txns] = await Promise.all([api.getCommunity(), api.walletTransactions()])
    if (c) setCommunity(c)
    setWalletTxns(txns)
  }, [])
  const refreshAccess = useCallback(async () => {
    const [a, log] = await Promise.all([api.listAdmins(), api.audit().catch(() => [])])
    setAdmins(a)
    setAuditLog(log)
  }, [])

  const loadAll = useCallback(async () => {
    const results = await Promise.allSettled([
      api.getCommunity().then((c) => c && setCommunity(c)),
      refreshMembers(),
      api.listActivities().then(setActivities),
      api.approvalQueue().then(setApprovals),
      refreshOrders(),
      api.walletTransactions().then(setWalletTxns),
      api.listGifts().then(setGifts),
      refreshAccess(),
    ])
    if (results.some((r) => r.status === 'rejected')) toast('Some data could not be loaded', 'error')
  }, [refreshMembers, refreshOrders, refreshAccess, toast])

  useEffect(() => {
    if (getToken()) loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async ({ email, password }) => {
    if (!email?.trim() || !password?.trim()) {
      toast('Enter your email and password', 'error')
      return false
    }
    try {
      const { token, user: u } = await api.adminLogin(email.trim(), password)
      setToken(token)
      setUser({ name: u.name, email: u.email, role: u.role === 'principal' ? 'Principal' : 'Community Admin', communityId: u.communityId })
      toast(`Welcome back, ${u.name.split(' ')[0]}`)
      loadAll()
      return true
    } catch (e) {
      toast(e.message || 'Sign in failed', 'error')
      return false
    }
  }, [loadAll, toast])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    toast('You have been signed out')
  }, [toast])

  // ---- Members ----
  const addMember = useCallback((data) => run(async () => {
    await api.addMember(data)
    await refreshMembers()
    toast(`Member "${data.name}" added`)
  }, 'Could not add member'), [run, refreshMembers, toast])

  const importMembers = useCallback((rows) => run(async () => {
    const res = await api.bulkImport(rows)
    await refreshMembers()
    toast(`Imported ${res.imported} member${res.imported === 1 ? '' : 's'} from CSV`)
  }, 'Could not import members'), [run, refreshMembers, toast])

  const toggleMemberStatus = useCallback((id) => run(async () => {
    const m = members.find((x) => x.id === id)
    if (!m) return
    const status = m.status === 'active' ? 'inactive' : 'active'
    await api.setMemberStatus(id, status)
    setMembers((list) => list.map((x) => (x.id === id ? { ...x, status } : x)))
    toast(`${m.name} ${status === 'active' ? 'reactivated' : 'deactivated'}`, status === 'active' ? 'success' : 'warn')
  }, 'Could not update member'), [run, members, toast])

  // ---- Activities ----
  const addActivity = useCallback((data) => run(async () => {
    await api.createActivity(data)
    setActivities(await api.listActivities())
    toast(`Activity "${data.title}" published`)
  }, 'Could not create activity'), [run, toast])

  // Backend activities are active/archived (no "draft"); this toggle is a
  // local view-only flag and is not persisted.
  const toggleActivityStatus = useCallback((id) => {
    setActivities((list) => list.map((a) =>
      a.id === id ? { ...a, status: a.status === 'live' ? 'draft' : 'live' } : a
    ))
  }, [])

  // ---- Approvals ----
  const approveCompletion = useCallback((id) => run(async () => {
    const c = approvals.find((x) => x.id === id)
    await api.approveCompletion(id)
    setApprovals((q) => q.filter((x) => x.id !== id))
    refreshMembers() // points changed
    if (c) toast(`Approved — +${c.points} pts credited to ${c.member}`)
  }, 'Could not approve'), [run, approvals, refreshMembers, toast])

  const rejectCompletion = useCallback((id, reason) => run(async () => {
    const c = approvals.find((x) => x.id === id)
    await api.rejectCompletion(id, reason)
    setApprovals((q) => q.filter((x) => x.id !== id))
    if (c) toast(`Rejected ${c.member}'s submission`, 'warn')
  }, 'Could not reject'), [run, approvals, toast])

  // ---- Wallet ----
  const topUpWallet = useCallback((rupees) => run(async () => {
    const amount = Number(rupees)
    if (!amount || amount <= 0) return
    if (!user?.communityId && !community.id) { toast('Community not loaded', 'error'); return }
    await api.topup(community.id || user.communityId, amount)
    await refreshWallet()
    toast(`Gift Wallet topped up by ₹${amount.toLocaleString('en-IN')}`)
  }, 'Could not top up wallet'), [run, community.id, user, refreshWallet, toast])

  // ---- Orders ----
  // data: { giftId, qty, target }
  const placeBulkOrder = useCallback((data) => run(async () => {
    await api.bulkOrder({ items: [{ giftId: data.giftId, qty: Number(data.qty) || 1 }], target: data.target })
    await Promise.all([refreshOrders(), refreshWallet()])
    toast('Bulk order placed')
    return true
  }, 'Could not place order'), [run, refreshOrders, refreshWallet, toast])

  const advanceOrder = useCallback((id) => run(async () => {
    const o = orders.find((x) => x.id === id)
    if (!o) return
    await api.advanceOrder(o._id)
    await refreshOrders()
    toast(`${o.id} advanced`)
  }, 'Could not advance order'), [run, orders, refreshOrders, toast])

  // ---- Access ----
  const grantAdmin = useCallback((data) => run(async () => {
    await api.grantAdmin(data)
    await refreshAccess()
    toast(`Admin rights granted to ${data.name}`)
  }, 'Could not grant admin'), [run, refreshAccess, toast])

  const revokeAdmin = useCallback((name) => run(async () => {
    const a = admins.find((x) => x.name === name)
    if (!a) return
    await api.revokeAdmin(a._id)
    await refreshAccess()
    toast(`Admin rights revoked from ${name}`, 'warn')
  }, 'Could not revoke admin'), [run, admins, refreshAccess, toast])

  const value = useMemo(() => ({
    community, members, activities, approvals, orders, walletTxns, admins, auditLog, gifts,
    user, login, logout,
    theme, toggleTheme,
    toasts, toast, dismissToast,
    addMember, importMembers, toggleMemberStatus,
    addActivity, toggleActivityStatus,
    approveCompletion, rejectCompletion,
    topUpWallet, placeBulkOrder, advanceOrder,
    grantAdmin, revokeAdmin,
  }), [
    community, members, activities, approvals, orders, walletTxns, admins, auditLog, gifts,
    user, login, logout, theme, toggleTheme, toasts, toast, dismissToast,
    addMember, importMembers, toggleMemberStatus, addActivity, toggleActivityStatus,
    approveCompletion, rejectCompletion, topUpWallet, placeBulkOrder, advanceOrder, grantAdmin, revokeAdmin,
  ])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
