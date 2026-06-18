import { useState } from 'react'
import { PackagePlus, Home, Building2, ChevronRight } from 'lucide-react'
import { PageHeader, Table, StatusBadge, Badge, Modal, Field, Input, Select } from '../components/ui'
import { formatINR } from '../data/mock'
import { useStore } from '../store'

const blank = { giftId: '', qty: 10, target: 'Community' }

export default function Orders() {
  const { orders, community, gifts, placeBulkOrder, advanceOrder } = useStore()
  const [tab, setTab] = useState('All')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(blank)

  const list = tab === 'All' ? orders : orders.filter((o) => o.type === tab)
  const selectedGift = gifts.find((g) => g._id === form.giftId)
  const unitRupees = selectedGift ? selectedGift.costPaise / 100 : 0
  const totalRupees = (Number(form.qty) || 0) * unitRupees

  async function submit(e) {
    e.preventDefault()
    if (!form.giftId) return
    const ok = await placeBulkOrder({ giftId: form.giftId, qty: form.qty, target: form.target })
    if (ok) { setForm(blank); setOpen(false) }
  }

  return (
    <div>
      <PageHeader
        title="Gift Orders"
        subtitle="Redemption-driven and bulk orders, drawn from the Gift Wallet."
        actions={<button className="btn-primary" onClick={() => setOpen(true)}><PackagePlus className="h-4 w-4" /> Place bulk order</button>}
      />

      <div className="mb-4 flex gap-2">
        {['All', 'Redemption', 'Bulk'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tab === t ? 'bg-brand-600 text-white' : 'bg-surface text-ink-600 border border-ink-100 hover:bg-ink-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Table columns={['Order', 'Type', 'Member', 'Item', 'Qty', 'Delivery', 'Amount', 'Status', 'Tracking', '']}>
        {list.map((o) => (
          <tr key={o.id} className="hover:bg-ink-50/50">
            <td className="px-5 py-3.5 font-semibold text-ink-800">{o.id}</td>
            <td className="px-5 py-3.5"><Badge tone={o.type === 'Bulk' ? 'violet' : 'brand'}>{o.type}</Badge></td>
            <td className="px-5 py-3.5 text-ink-600">{o.member}</td>
            <td className="px-5 py-3.5">{o.item}</td>
            <td className="px-5 py-3.5 text-ink-600">{o.qty}</td>
            <td className="px-5 py-3.5">
              <span className="inline-flex items-center gap-1.5 text-ink-600">
                {o.target === 'Home' ? <Home className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
                {o.target}
              </span>
            </td>
            <td className="px-5 py-3.5 font-semibold text-ink-800">{formatINR(o.totalPaise)}</td>
            <td className="px-5 py-3.5"><StatusBadge value={o.status} /></td>
            <td className="px-5 py-3.5 text-ink-400">{o.tracking}</td>
            <td className="px-5 py-3.5 text-right">
              {o.status !== 'Delivered' ? (
                <button
                  onClick={() => advanceOrder(o.id)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
                  title="Advance to next fulfillment stage"
                >
                  Advance <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <span className="text-xs text-ink-400">Done</span>
              )}
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Place bulk gift order"
        subtitle="For event distribution. Debited from the Gift Wallet."
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" form="bulk-order" type="submit">Place order · {formatINR(totalRupees * 100)}</button>
          </>
        }
      >
        <form id="bulk-order" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Gift item" hint="Pick from the platform catalog. Unit cost is set by the gift.">
              <Select value={form.giftId} onChange={(e) => setForm({ ...form, giftId: e.target.value })} required>
                <option value="">Select a gift…</option>
                {gifts.map((g) => (
                  <option key={g._id} value={g._id}>{g.name} — {formatINR(g.costPaise)} each</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Quantity">
            <Input type="number" min="1" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
          </Field>
          <Field label="Unit cost (₹)">
            <Input type="number" value={unitRupees} readOnly disabled />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Delivery target">
              <Select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}>
                <option value="Community">Community address (in-person handover)</option>
                <option value="Home">Each member's home</option>
              </Select>
            </Field>
          </div>
          <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50 px-4 py-3 text-sm">
            <span className="text-ink-600">Order total</span>
            <span className="font-bold text-ink-900">{formatINR(totalRupees * 100)}</span>
          </div>
          <div className="sm:col-span-2 flex items-center justify-between px-1 text-xs text-ink-400">
            <span>Wallet balance after order</span>
            <span className={community.giftWalletBalancePaise - totalRupees * 100 < 0 ? 'font-semibold text-rose-600' : 'font-semibold text-ink-600'}>
              {formatINR(community.giftWalletBalancePaise - totalRupees * 100)}
            </span>
          </div>
        </form>
      </Modal>
    </div>
  )
}
