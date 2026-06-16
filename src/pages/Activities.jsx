import { useState } from 'react'
import { Plus, Repeat } from 'lucide-react'
import { PageHeader, Table, StatusBadge, Badge, Modal, Field, Input, Select } from '../components/ui'
import { segments, points } from '../data/mock'
import { useStore } from '../store'

const modeTone = { Auto: 'blue', 'Self-declared': 'green', 'Proof-based': 'amber' }
const modes = ['Self-declared', 'Auto', 'Proof-based']
const recurrences = ['None', 'Daily', 'Weekly']

const templates = [
  { title: 'Recite the Namokar Mantra', mode: 'Self-declared', points: 50, recurrence: 'Daily', segment: 'All' },
  { title: 'Read a Tirthankara story', mode: 'Auto', points: 200, recurrence: 'None', segment: 'Child' },
  { title: 'Attend temple Pratikraman', mode: 'Proof-based', points: 500, recurrence: 'Weekly', segment: 'All' },
  { title: 'Daily darshan check-in', mode: 'Auto', points: 80, recurrence: 'Daily', segment: 'All' },
]

const blank = { title: '', mode: 'Self-declared', points: 100, segment: 'All', due: '', recurrence: 'None', status: 'live' }

export default function Activities() {
  const { activities, addActivity, toggleActivityStatus } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(blank)

  function applyTemplate(t) {
    setForm((f) => ({ ...f, ...t }))
  }

  function save(status) {
    if (!form.title.trim()) return
    addActivity({ ...form, status })
    setForm(blank)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Activity Management"
        subtitle="Assign value-based activities from master templates or create custom ones."
        actions={<button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New activity</button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Live activities', value: activities.filter((a) => a.status === 'live').length },
          { label: 'Drafts', value: activities.filter((a) => a.status === 'draft').length },
          { label: 'Recurring', value: activities.filter((a) => a.recurrence !== 'None').length },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-3xl font-extrabold text-ink-900">{s.value}</p>
            <p className="text-sm text-ink-400">{s.label}</p>
          </div>
        ))}
      </div>

      <Table columns={['Activity', 'Mode', 'Points', 'Segment', 'Recurrence', 'Due', 'Status', '']}>
        {activities.map((a) => (
          <tr key={a.id} className="hover:bg-ink-50/50">
            <td className="px-5 py-3.5">
              <p className="font-semibold text-ink-800">{a.title}</p>
              <p className="text-xs text-ink-400">{a.id}</p>
            </td>
            <td className="px-5 py-3.5"><Badge tone={modeTone[a.mode]}>{a.mode}</Badge></td>
            <td className="px-5 py-3.5 font-bold text-brand-700">{points(a.points)}</td>
            <td className="px-5 py-3.5 text-ink-600">{a.segment}</td>
            <td className="px-5 py-3.5">
              <span className="inline-flex items-center gap-1.5 text-ink-600">
                {a.recurrence !== 'None' && <Repeat className="h-3.5 w-3.5 text-ink-400" />}
                {a.recurrence}
              </span>
            </td>
            <td className="px-5 py-3.5 text-ink-600">{a.due}</td>
            <td className="px-5 py-3.5"><StatusBadge value={a.status} /></td>
            <td className="px-5 py-3.5 text-right">
              <button
                onClick={() => toggleActivityStatus(a.id)}
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                {a.status === 'live' ? 'Unpublish' : 'Publish'}
              </button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New activity"
        subtitle="Start from a master template or build a custom activity."
        size="lg"
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => save('draft')}>Save as draft</button>
            <button type="button" className="btn-primary" onClick={() => save('live')}>Publish activity</button>
          </>
        }
      >
        <div className="mb-5">
          <p className="mb-2 text-sm font-semibold text-ink-700">Master templates</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.title}
                onClick={() => applyTemplate(t)}
                className="rounded-full border border-ink-100 bg-ink-50 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>

        <form id="new-activity" onSubmit={(e) => { e.preventDefault(); save('live') }} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Activity title">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Namaskar to parents" required />
            </Field>
          </div>
          <Field label="Completion mode">
            <Select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
              {modes.map((m) => <option key={m}>{m}</option>)}
            </Select>
          </Field>
          <Field label="Points">
            <Input type="number" min="0" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} />
          </Field>
          <Field label="Target segment">
            <Select value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}>
              {['All', ...segments].map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Recurrence">
            <Select value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value })}>
              {recurrences.map((r) => <option key={r}>{r}</option>)}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Due date">
              <Input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  )
}
