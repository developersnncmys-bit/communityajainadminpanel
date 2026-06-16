import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UserPlus, Upload, Filter, Search } from 'lucide-react'
import { PageHeader, Table, StatusBadge, Badge, Avatar, Modal, Field, Input, Select, Textarea } from '../components/ui'
import { segments, points } from '../data/mock'
import { useStore } from '../store'

export default function Members() {
  const { members, addMember, importMembers, toggleMemberStatus } = useStore()
  const [params] = useSearchParams()
  const [seg, setSeg] = useState('All')
  const [query, setQuery] = useState(params.get('q') || '')
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', segment: 'Working' })
  const [csv, setCsv] = useState('Aarav Sheth, 98xxxxxx00, Child\nNeha Jain, 99xxxxxx11, College')

  const list = members
    .filter((m) => (seg === 'All' ? true : m.segment === seg))
    .filter((m) => m.name.toLowerCase().includes(query.toLowerCase()) || m.id.toLowerCase().includes(query.toLowerCase()))

  function submitAdd(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    addMember(form)
    setForm({ name: '', phone: '', segment: 'Working' })
    setAddOpen(false)
  }

  function submitImport(e) {
    e.preventDefault()
    const rows = csv.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
      const [name, phone, segment] = line.split(',').map((s) => s.trim())
      return { name, phone, segment }
    }).filter((r) => r.name)
    if (rows.length) importMembers(rows)
    setImportOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle={`${members.length} members across ${segments.length} segments`}
        actions={
          <>
            <button className="btn-ghost" onClick={() => setImportOpen(true)}><Upload className="h-4 w-4" /> Import CSV</button>
            <button className="btn-primary" onClick={() => setAddOpen(true)}><UserPlus className="h-4 w-4" /> Add member</button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm text-ink-400"><Filter className="h-4 w-4" /> Segment:</span>
        {['All', ...segments].map((s) => (
          <button
            key={s}
            onClick={() => setSeg(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              seg === s ? 'bg-brand-600 text-white' : 'bg-surface text-ink-600 border border-ink-100 hover:bg-ink-100'
            }`}
          >
            {s}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 rounded-xl border border-ink-100 bg-surface px-3 py-2">
          <Search className="h-4 w-4 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members…"
            className="w-44 bg-transparent text-sm outline-none placeholder:text-ink-400"
          />
        </div>
      </div>

      <Table columns={['Member', 'ID', 'Segment', 'Points', 'Joined', 'Status', '']}>
        {list.map((m) => (
          <tr key={m.id} className="hover:bg-ink-50/50">
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Avatar name={m.name} />
                <div>
                  <p className="font-semibold text-ink-800">{m.name}</p>
                  <p className="text-xs text-ink-400">{m.phone}</p>
                </div>
              </div>
            </td>
            <td className="px-5 py-3.5 text-ink-600">{m.id}</td>
            <td className="px-5 py-3.5"><Badge tone="brand">{m.segment}</Badge></td>
            <td className="px-5 py-3.5 font-bold text-brand-700">{points(m.points)}</td>
            <td className="px-5 py-3.5 text-ink-600">{m.joined}</td>
            <td className="px-5 py-3.5"><StatusBadge value={m.status} /></td>
            <td className="px-5 py-3.5 text-right">
              <button
                onClick={() => toggleMemberStatus(m.id)}
                className={`text-sm font-semibold ${m.status === 'active' ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'}`}
              >
                {m.status === 'active' ? 'Deactivate' : 'Reactivate'}
              </button>
            </td>
          </tr>
        ))}
        {list.length === 0 && (
          <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-ink-400">No members match your filters.</td></tr>
        )}
      </Table>

      {/* Add member */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add member"
        subtitle="Manually register a new member into this community."
        footer={
          <>
            <button className="btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn-primary" form="add-member" type="submit">Add member</button>
          </>
        }
      >
        <form id="add-member" onSubmit={submitAdd} className="space-y-4">
          <Field label="Full name">
            <Input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aarav Mehta" required />
          </Field>
          <Field label="Phone number" hint="Used for OTP login on the member app.">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="98xxxxxx00" />
          </Field>
          <Field label="Segment">
            <Select value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}>
              {segments.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
        </form>
      </Modal>

      {/* Import CSV */}
      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import members (CSV)"
        subtitle="One member per line: Name, Phone, Segment"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setImportOpen(false)}>Cancel</button>
            <button className="btn-primary" form="import-members" type="submit">Import</button>
          </>
        }
      >
        <form id="import-members" onSubmit={submitImport}>
          <Field label="Paste CSV rows">
            <Textarea rows={6} value={csv} onChange={(e) => setCsv(e.target.value)} />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
