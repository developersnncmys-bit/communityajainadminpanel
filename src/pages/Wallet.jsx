import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react'
import { PageHeader, Table, StatusBadge, Modal, Field, Input } from '../components/ui'
import { formatINR } from '../data/mock'
import { useStore } from '../store'

const presets = [50000, 100000, 250000, 500000]

export default function Wallet() {
  const { community, walletTxns, topUpWallet } = useStore()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(100000)

  const topups = walletTxns.filter((t) => t.type === 'topup').reduce((s, t) => s + t.amountPaise, 0)
  const debits = walletTxns.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amountPaise, 0)

  function submit(e) {
    e.preventDefault()
    if (Number(amount) > 0) {
      topUpWallet(amount)
      setOpen(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Gift Wallet"
        subtitle="Prepaid credit used to fund redemptions and bulk gift orders."
        actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Request top-up</button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white">
          <p className="text-sm text-brand-100">Current balance</p>
          <p className="mt-2 text-3xl font-extrabold">{formatINR(community.giftWalletBalancePaise)}</p>
          <p className="mt-1 text-xs text-brand-200">{community.name}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-ink-400">Total topped up</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600">{formatINR(topups)}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-ink-400">Total spent</p>
          <p className="mt-2 text-3xl font-extrabold text-rose-600">{formatINR(debits)}</p>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-bold text-ink-900">Transaction history</h2>
      <Table columns={['Txn', 'Type', 'Reference', 'Gateway', 'Date', 'Amount', 'Status']}>
        {walletTxns.map((t) => (
          <tr key={t.id} className="hover:bg-ink-50/50">
            <td className="px-5 py-3.5 font-semibold text-ink-800">{t.id}</td>
            <td className="px-5 py-3.5">
              <span className={`inline-flex items-center gap-1.5 font-medium ${t.type === 'topup' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {t.type === 'topup' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                {t.type === 'topup' ? 'Top-up' : 'Debit'}
              </span>
            </td>
            <td className="px-5 py-3.5 text-ink-600">{t.ref}</td>
            <td className="px-5 py-3.5 text-ink-600">{t.type === 'topup' ? 'Razorpay' : '—'}</td>
            <td className="px-5 py-3.5 text-ink-600">{t.date}</td>
            <td className={`px-5 py-3.5 font-bold ${t.type === 'topup' ? 'text-emerald-700' : 'text-rose-700'}`}>
              {t.type === 'topup' ? '+' : '−'}{formatINR(t.amountPaise)}
            </td>
            <td className="px-5 py-3.5"><StatusBadge value={t.status} /></td>
          </tr>
        ))}
      </Table>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Top up Gift Wallet"
        subtitle="Prepaid credit funds member redemptions and bulk orders. Routed to the Principal via Razorpay."
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" form="topup-form" type="submit">Pay with Razorpay</button>
          </>
        }
      >
        <form id="topup-form" onSubmit={submit} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setAmount(p)}
                className={`rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                  Number(amount) === p ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-ink-100 bg-surface text-ink-600 hover:bg-ink-100'
                }`}
              >
                ₹{p.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
          <Field label="Amount (₹)" hint="Stored internally in paise.">
            <Input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
