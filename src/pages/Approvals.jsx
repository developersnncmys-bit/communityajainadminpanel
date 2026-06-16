import { useState } from 'react'
import { Check, X, Image, CheckCircle2 } from 'lucide-react'
import { PageHeader, Badge, Avatar, Modal, Field, Textarea } from '../components/ui'
import { points } from '../data/mock'
import { useStore } from '../store'

export default function Approvals() {
  const { approvals, approveCompletion, rejectCompletion } = useStore()
  const [rejecting, setRejecting] = useState(null) // completion being rejected
  const [reason, setReason] = useState('')

  function confirmReject(e) {
    e.preventDefault()
    rejectCompletion(rejecting.id, reason.trim())
    setRejecting(null)
    setReason('')
  }

  return (
    <div>
      <PageHeader
        title="Approval Queue"
        subtitle="Review proof-based completions. Points credit only on approval."
      />

      {approvals.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <p className="text-lg font-bold text-ink-900">All caught up</p>
          <p className="text-sm text-ink-400">No proof-based completions are waiting for review.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {approvals.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start gap-3">
                <Avatar name={c.member} />
                <div className="flex-1">
                  <p className="font-semibold text-ink-800">{c.member}</p>
                  <p className="text-sm text-ink-400">{c.activity}</p>
                </div>
                <Badge tone="brand">+{points(c.points)} pts</Badge>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-3">
                <div className="grid h-14 w-14 place-items-center rounded-lg bg-surface text-ink-400">
                  <Image className="h-6 w-6" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-ink-700">Photo proof attached</p>
                  <p className="text-ink-400">{c.note || 'No note provided'}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-ink-400">Submitted {c.submitted}</span>
                <div className="flex gap-2">
                  <button className="btn bg-rose-50 text-rose-700 hover:bg-rose-100" onClick={() => setRejecting(c)}>
                    <X className="h-4 w-4" /> Reject
                  </button>
                  <button className="btn bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => approveCompletion(c.id)}>
                    <Check className="h-4 w-4" /> Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        title="Reject completion"
        subtitle={rejecting ? `${rejecting.member} — ${rejecting.activity}` : ''}
        size="sm"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setRejecting(null)}>Cancel</button>
            <button className="btn bg-rose-600 text-white hover:bg-rose-700" form="reject-form" type="submit">Reject submission</button>
          </>
        }
      >
        <form id="reject-form" onSubmit={confirmReject}>
          <Field label="Reason for rejection" hint="Shared with the member so they can resubmit.">
            <Textarea autoFocus rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Photo unclear, please re-upload." />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
