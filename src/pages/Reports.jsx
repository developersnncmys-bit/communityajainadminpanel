import { Download, TrendingUp } from 'lucide-react'
import { PageHeader, BarChart, Table, Avatar } from '../components/ui'
import { engagement, points } from '../data/mock'
import { useStore } from '../store'

export default function Reports() {
  const { members, toast } = useStore()
  const issued = members.reduce((s, m) => s + m.points, 0)
  const redeemed = Math.round(issued * 0.38)
  const ranked = [...members].sort((a, b) => b.points - a.points)

  function exportCSV() {
    const header = ['Rank', 'Member ID', 'Name', 'Segment', 'Status', 'Points earned']
    const rows = ranked.map((m, i) => [i + 1, m.id, m.name, m.segment, m.status, m.points])
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `member-report-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast('Report exported as CSV')
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Engagement, points issued vs redeemed, and member activity."
        actions={<button className="btn-ghost" onClick={exportCSV}><Download className="h-4 w-4" /> Export CSV</button>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-ink-900">Weekly completions</h2>
          <BarChart data={engagement} valueKey="completions" labelKey="day" />
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-bold text-ink-900">Points issued vs redeemed</h2>
          <div className="mt-5 space-y-4">
            <div>
              <div className="flex justify-between text-sm"><span className="text-ink-600">Issued</span><span className="font-bold">{points(issued)}</span></div>
              <div className="mt-1.5 h-3 rounded-full bg-ink-100"><div className="h-full rounded-full bg-brand-500" style={{ width: '100%' }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm"><span className="text-ink-600">Redeemed</span><span className="font-bold">{points(redeemed)}</span></div>
              <div className="mt-1.5 h-3 rounded-full bg-ink-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: '38%' }} /></div>
            </div>
            <p className="flex items-center gap-1.5 pt-2 text-sm text-emerald-700"><TrendingUp className="h-4 w-4" /> 62% of points still in circulation</p>
          </div>
        </div>
      </div>

      <h2 className="mb-3 mt-6 text-lg font-bold text-ink-900">Most active members</h2>
      <Table columns={['Rank', 'Member', 'Segment', 'Points earned']}>
        {ranked.map((m, i) => (
          <tr key={m.id} className="hover:bg-ink-50/50">
            <td className="px-5 py-3.5 font-bold text-ink-400">#{i + 1}</td>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3"><Avatar name={m.name} /><span className="font-semibold text-ink-800">{m.name}</span></div>
            </td>
            <td className="px-5 py-3.5 text-ink-600">{m.segment}</td>
            <td className="px-5 py-3.5 font-bold text-brand-700">{points(m.points)}</td>
          </tr>
        ))}
      </Table>
    </div>
  )
}
