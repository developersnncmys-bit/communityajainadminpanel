import { useNavigate } from 'react-router-dom'
import { Users, Award, CheckSquare, Package, Wallet, Sparkles } from 'lucide-react'
import { PageHeader, StatCard, BarChart, Table, StatusBadge, Avatar } from '../components/ui'
import { engagement, formatINR, points } from '../data/mock'
import { useStore } from '../store'

export default function Dashboard() {
  const navigate = useNavigate()
  const { members, orders, approvals, community } = useStore()
  const activeMembers = members.filter((m) => m.status === 'active').length
  const pointsDistributed = members.reduce((s, m) => s + m.points, 0)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back — here's how ${community.name} is doing today.`}
        actions={<button className="btn-primary" onClick={() => navigate('/activities')}><Sparkles className="h-4 w-4" /> Assign Activity</button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Active members" value={activeMembers} trend={8} accent="brand" />
        <StatCard icon={Award} label="Points distributed" value={points(pointsDistributed)} trend={12} accent="violet" />
        <StatCard icon={CheckSquare} label="Pending approvals" value={approvals.length} trend={-3} accent="amber" />
        <StatCard icon={Package} label="Open orders" value={orders.filter((o) => o.status !== 'Delivered').length} trend={5} accent="sky" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink-900">Activity completions</h2>
              <p className="text-sm text-ink-400">Last 7 days</p>
            </div>
            <span className="badge bg-emerald-50 text-emerald-700">+18% vs last week</span>
          </div>
          <BarChart data={engagement} valueKey="completions" labelKey="day" />
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><Wallet className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-bold text-ink-900">Gift Wallet</h2>
              <p className="text-sm text-ink-400">Prepaid balance</p>
            </div>
          </div>
          <p className="mt-5 text-3xl font-extrabold text-ink-900">{formatINR(community.giftWalletBalancePaise)}</p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ink-100">
            <div className="h-full w-3/4 rounded-full bg-brand-500" />
          </div>
          <p className="mt-2 text-xs text-ink-400">75% of last top-up remaining</p>
          <button className="btn-primary mt-5 w-full" onClick={() => navigate('/wallet')}>Top up wallet</button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-bold text-ink-900">Recent orders</h2>
          <Table columns={['Order', 'Item', 'Target', 'Status']}>
            {orders.slice(0, 4).map((o) => (
              <tr key={o.id} className="hover:bg-ink-50/50 cursor-pointer" onClick={() => navigate('/orders')}>
                <td className="px-5 py-3.5 font-semibold text-ink-800">{o.id}</td>
                <td className="px-5 py-3.5">{o.item}</td>
                <td className="px-5 py-3.5 text-ink-600">{o.target}</td>
                <td className="px-5 py-3.5"><StatusBadge value={o.status} /></td>
              </tr>
            ))}
          </Table>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-bold text-ink-900">Top members</h2>
          <Table columns={['Member', 'Segment', 'Points']}>
            {[...members].sort((a, b) => b.points - a.points).slice(0, 4).map((m) => (
              <tr key={m.id} className="hover:bg-ink-50/50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} />
                    <span className="font-semibold text-ink-800">{m.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-ink-600">{m.segment}</td>
                <td className="px-5 py-3.5 font-bold text-brand-700">{points(m.points)}</td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </div>
  )
}
