import { useState } from 'react'
import { ShieldPlus, ShieldCheck } from 'lucide-react'
import { PageHeader, Table, Badge, Avatar, Modal, Field, Input, Select } from '../components/ui'
import { useStore } from '../store'

const scopes = ['Members, Activities', 'Approvals, Orders', 'Reports only', 'Full']

export default function Access() {
  const { admins, auditLog, grantAdmin, revokeAdmin } = useStore()
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(null) // admin name to revoke
  const [form, setForm] = useState({ name: '', scope: scopes[0] })

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    grantAdmin(form)
    setForm({ name: '', scope: scopes[0] })
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Role & Access Management"
        subtitle="The Principal grants and revokes Admin rights. All actions are audited."
        actions={<button className="btn-primary" onClick={() => setOpen(true)}><ShieldPlus className="h-4 w-4" /> Grant admin</button>}
      />

      <h2 className="mb-3 text-lg font-bold text-ink-900">Administrators</h2>
      <Table columns={['Name', 'Role', 'Scope', 'Granted by', 'Since', '']}>
        {admins.map((a) => (
          <tr key={a.name} className="hover:bg-ink-50/50">
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3"><Avatar name={a.name} /><span className="font-semibold text-ink-800">{a.name}</span></div>
            </td>
            <td className="px-5 py-3.5">
              <Badge tone={a.role === 'Principal' ? 'brand' : 'blue'}>
                <ShieldCheck className="h-3 w-3" /> {a.role}
              </Badge>
            </td>
            <td className="px-5 py-3.5 text-ink-600">{a.scope}</td>
            <td className="px-5 py-3.5 text-ink-600">{a.grantedBy}</td>
            <td className="px-5 py-3.5 text-ink-600">{a.since}</td>
            <td className="px-5 py-3.5 text-right">
              {a.role !== 'Principal' && (
                <button onClick={() => setConfirm(a.name)} className="text-sm font-semibold text-rose-600 hover:text-rose-700">Revoke</button>
              )}
            </td>
          </tr>
        ))}
      </Table>

      <h2 className="mb-3 mt-6 text-lg font-bold text-ink-900">Audit log</h2>
      <div className="card divide-y divide-ink-100">
        {auditLog.map((l, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4">
            <Avatar name={l.who} />
            <div className="flex-1">
              <p className="text-sm text-ink-800"><span className="font-semibold">{l.who}</span> {l.action}</p>
            </div>
            <span className="text-xs text-ink-400">{l.when}</span>
          </div>
        ))}
      </div>

      {/* Grant admin */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Grant admin rights"
        subtitle="The new admin can operate this community within the chosen scope."
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" form="grant-form" type="submit">Grant rights</button>
          </>
        }
      >
        <form id="grant-form" onSubmit={submit} className="space-y-4">
          <Field label="Admin name">
            <Input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pooja Mehta" required />
          </Field>
          <Field label="Scope" hint="Limits which areas of the panel this admin can use.">
            <Select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}>
              {scopes.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
        </form>
      </Modal>

      {/* Revoke confirm */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Revoke admin rights?"
        subtitle={confirm ? `${confirm} will lose access to this community's admin panel.` : ''}
        size="sm"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
            <button className="btn bg-rose-600 text-white hover:bg-rose-700" onClick={() => { revokeAdmin(confirm); setConfirm(null) }}>Revoke rights</button>
          </>
        }
      >
        <p className="text-sm text-ink-600">This action is recorded in the audit log and can be re-granted later.</p>
      </Modal>
    </div>
  )
}
