// API client for the Community Admin Panel.
// Thin fetch wrapper + JWT handling, plus resource helpers that ADAPT the
// backend's shapes to the shapes this app's store/pages already expect.
// Sign in as the community's Principal (principal@mahavir.com / principal123)
// to unlock members, activities, approvals, wallet top-up and access control.

const BASE = import.meta.env.VITE_API_URL || 'https://jainbackend.vercel.app/api'
const TOKEN_KEY = 'jp-token'

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
export const setToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) } catch {}
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const t = getToken()
    if (t) headers.Authorization = `Bearer ${t}`
  }
  let res
  try {
    res = await fetch(BASE + path, {
      method, headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?')
  }
  let data = null
  try { data = await res.json() } catch {}
  // Session expired or the account no longer exists (e.g. DB was re-seeded):
  // clear the stale token and bounce back to the login screen.
  if (res.status === 401 && auth) {
    setToken(null)
    try { localStorage.removeItem('jp-user') } catch {}
    if (typeof window !== 'undefined' && !window.__jpLoggingOut) {
      window.__jpLoggingOut = true
      window.location.assign('/')
    }
  }
  if (!res.ok || (data && data.success === false)) {
    throw new Error((data && data.message) || `Request failed (${res.status})`)
  }
  return data
}

// ---- Shape helpers ----
const dateOnly = (d) => String(d || '').slice(0, 10)
const dateTime = (d) => String(d || '').slice(0, 16).replace('T', ' ')
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

const adaptCommunity = (c) => ({
  id: c._id,
  name: c.name,
  type: c.type,
  code: c.inviteCode,
  principal: c.principalName || '—',
  giftWalletBalancePaise: c.giftWalletBalancePaise || 0,
})
const adaptMember = (m, points = 0) => ({
  id: m._id,
  name: m.name,
  segment: m.segment || 'Working',
  points,
  status: m.status || 'active',
  joined: dateOnly(m.createdAt),
  phone: m.phone || '—',
})
const adaptActivity = (a) => ({
  id: a._id,
  title: a.title,
  mode: a.completionMode,
  points: a.points,
  segment: a.targetSegment || 'All',
  due: a.dueDate ? dateOnly(a.dueDate) : '—',
  recurrence: cap(a.recurrence || 'none'),
  status: a.status === 'active' ? 'live' : 'draft',
})
const adaptApproval = (c) => ({
  id: c._id,
  member: c.memberId?.name || '—',
  activity: c.activityId?.title || '—',
  points: c.activityId?.points || 0,
  submitted: dateTime(c.createdAt),
  note: c.note || '',
  proof: !!c.proofUrl,
})
const adaptOrder = (o) => ({
  id: o.code || o._id,
  _id: o._id,
  member: o.memberId?.name || '—',
  type: o.type === 'bulk' ? 'Bulk' : 'Redemption',
  item: o.items?.[0]?.name || '—',
  qty: (o.items || []).reduce((s, i) => s + (i.qty || 0), 0) || 1,
  target: o.deliveryTarget === 'community' ? 'Community' : 'Home',
  totalPaise: o.totalPaise || 0,
  status: o.status,
  tracking: o.trackingId || '—',
})
const adaptTxn = (t) => ({
  id: t._id,
  type: t.type,
  amountPaise: t.amountPaise,
  ref: t.title || t.refType || '—',
  date: dateOnly(t.createdAt),
  status: t.status,
})
const adaptAdmin = (u) => ({
  _id: u._id,
  name: u.name,
  role: 'Admin',
  scope: '—',
  grantedBy: '—',
  since: dateOnly(u.createdAt),
})
const adaptAudit = (l) => ({
  who: l.actorId?.name || l.actorRole || 'System',
  action: `${l.action}${l.target ? ` · ${l.target}` : ''}`,
  when: dateTime(l.createdAt),
})

export const api = {
  adminLogin: (email, password) =>
    request('/auth/admin/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => request('/auth/me'),

  // ---- Community (own) ----
  getCommunity: async () => {
    const list = (await request('/communities')).communities
    return list[0] ? adaptCommunity(list[0]) : null
  },

  // ---- Members ----
  listMembers: async () => {
    const members = (await request('/members')).members
    // Enrich each member with their live points balance.
    const withPoints = await Promise.all(
      members.map(async (m) => {
        try {
          const { balance } = await request(`/points/balance?memberId=${m._id}`)
          return adaptMember(m, balance || 0)
        } catch {
          return adaptMember(m, 0)
        }
      })
    )
    return withPoints
  },
  addMember: (d) => request('/members', {
    method: 'POST',
    body: { name: d.name, phone: d.phone, segment: d.segment },
  }),
  bulkImport: (rows) => request('/members/bulk', {
    method: 'POST',
    body: { members: rows.map((r) => ({ name: r.name, phone: r.phone, segment: r.segment })) },
  }),
  setMemberStatus: (id, status) => request(`/members/${id}/status`, { method: 'PATCH', body: { status } }),

  // ---- Activities ----
  listActivities: async () => (await request('/activities')).activities.map(adaptActivity),
  createActivity: (d) => request('/activities', {
    method: 'POST',
    body: {
      title: d.title, completionMode: d.mode, points: Number(d.points) || 0,
      targetSegment: d.segment === 'All' ? 'All' : d.segment,
      recurrence: String(d.recurrence || 'none').toLowerCase(),
      dueDate: d.due || undefined,
    },
  }),

  // ---- Approvals ----
  approvalQueue: async () => (await request('/completions/queue')).queue.map(adaptApproval),
  approveCompletion: (id) => request(`/completions/${id}/approve`, { method: 'PATCH' }),
  rejectCompletion: (id, reason) => request(`/completions/${id}/reject`, { method: 'PATCH', body: { reason } }),

  // ---- Wallet ----
  walletTransactions: async () => (await request('/wallet/transactions')).transactions.map(adaptTxn),
  topup: (communityId, amountRupees) =>
    request(`/communities/${communityId}/topup`, { method: 'POST', body: { amountRupees } }),

  // ---- Orders ----
  listOrders: async () => (await request('/orders')).orders.map(adaptOrder),
  bulkOrder: (d) => request('/orders/bulk', {
    method: 'POST',
    body: {
      items: d.items, // [{ giftId, qty }]
      deliveryTarget: (d.target || 'Community').toLowerCase(),
    },
  }),
  advanceOrder: (id) => request(`/orders/${id}/advance`, { method: 'PATCH' }),

  // ---- Gifts (for the bulk-order picker) ----
  listGifts: async () => (await request('/gifts')).gifts,

  // ---- Access ----
  listAdmins: async () => (await request('/access')).admins.map(adaptAdmin),
  grantAdmin: (d) => request('/access/grant', {
    method: 'POST',
    body: { name: d.name, email: d.email, password: d.password, scope: d.scope ? [d.scope] : undefined },
  }),
  revokeAdmin: (userId) => request(`/access/${userId}/revoke`, { method: 'PATCH' }),
  audit: async () => (await request('/access/audit')).logs.map(adaptAudit),
}
