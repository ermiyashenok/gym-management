import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { getMemberStatus, TODAY_STR } from '@/utils/helpers'
import { MetricCard, Card, StatusBadge } from '@/components/ui'

export default function DashboardPage({ onSelectMember, onRecordPayment }) {
  const currentUser   = useStore((s) => s.currentUser)
  const members       = useStore((s) => s.members)
  const trainers      = useStore((s) => s.trainers)
  const payments      = useStore((s) => s.payments)
  const currentBranch = useStore((s) => s.currentBranch)
  const navigate      = useNavigate()

  // Filter by branch
  const branchMembers = useMemo(() =>
    members.filter((m) => currentBranch === 'all' || m.branch_id === currentBranch),
    [members, currentBranch]
  )
  const branchPayments = useMemo(() =>
    payments.filter((p) => {
      if (p.member_id === 'Amenity_Sale' || p.member_id === 'Trainer_Admission') return true;
      const m = members.find((mem) => mem.id === p.member_id)
      return m && (currentBranch === 'all' || m.branch_id === currentBranch)
    }),
    [payments, members, currentBranch]
  )

  // KPIs
  const stats = useMemo(() => {
    let active = 0, expiring = 0, overdue = 0
    branchMembers.forEach((m) => {
      const s = getMemberStatus(m.renewal_date)
      if (s === 'Active')   active++
      else if (s === 'Expiring') expiring++
      else                   overdue++
    })

    const currentMonthRevenue = branchPayments.reduce((sum, p) => {
      const d = new Date(p.paid_at)
      const now = new Date(TODAY_STR)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
        ? sum + p.amount : sum
    }, 0)

    return { total: branchMembers.length, active, expiring, overdue, revenue: currentMonthRevenue }
  }, [branchMembers, branchPayments])

  const revenueBreakdown = useMemo(() => {
    let memberships = 0, store = 0, trainers = 0
    branchPayments.forEach((p) => {
      const d = new Date(p.paid_at)
      const now = new Date(TODAY_STR)
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
        if (p.member_id === 'Amenity_Sale') store += p.amount
        else if (p.member_id === 'Trainer_Admission') trainers += p.amount
        else memberships += p.amount
      }
    })
    const total = memberships + store + trainers
    return { memberships, store, trainers, total }
  }, [branchPayments])

  // Chart data (last 6 months simulated baselines)
  const chartData = useMemo(() => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN']
    const revs   = [25000, 32000, 29000, 42000, 38000, stats.revenue]
    const max    = Math.max(...revs, 1)
    return { months, revs, heights: revs.map((r) => (r / max) * 100) }
  }, [stats.revenue])

  // Recent members
  const recentMembers = useMemo(() => branchMembers.slice(0, 5), [branchMembers])

  return (
    <div className="space-y-8 page-enter">
      {/* Page header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-headline text-2xl font-bold text-text-primary">Executive Overview</h1>
          <p className="text-text-muted text-xs mt-1">Real-time performance metrics and member analytics.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon="group"         label="Total Members"   value={stats.total}    color="primary" />
        <MetricCard icon="check_circle"  label="Active Members"  value={stats.active}   color="success" />
        <MetricCard icon="event_repeat"  label="Expiring Soon"   value={stats.expiring} color="warning" />
        <MetricCard icon="error_outline" label="Overdue Members" value={stats.overdue}  color="danger"  />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Revenue bar chart */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-headline text-sm font-bold text-text-primary">Revenue Overview</h3>
              <p className="text-text-muted text-[10px]">Monthly collections (last 6 months)</p>
            </div>
            <div className="text-right">
              <p className="font-headline text-xl font-bold text-text-primary">Birr {stats.revenue.toLocaleString()}</p>
              <p className="text-[10px] text-success-emerald font-bold font-mono">This Month</p>
            </div>
          </div>
          <div className="h-44 flex items-end gap-2 md:gap-3">
            {chartData.months.map((m, i) => (
              <div key={m} className="flex-1 flex flex-col items-center gap-2 group">
                <div
                  className={`w-full rounded-t transition-all duration-700 cursor-default ${i === 5 ? 'bg-primary' : 'bg-surface-container-highest group-hover:bg-primary/30'}`}
                  style={{ height: `${chartData.heights[i]}%`, minHeight: '4px' }}
                  title={`Birr ${chartData.revs[i].toLocaleString()}`}
                />
                <span className="font-mono text-[9px] text-text-muted">{m}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Donut membership ratio */}
        <Card className="p-5 flex flex-col">
          <h3 className="font-headline text-sm font-bold text-text-primary mb-1">Status Distribution</h3>
          <p className="text-text-muted text-[10px] mb-4">Active vs expiring/overdue ratio</p>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {(() => {
              const pct = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0
              const circ = 2 * Math.PI * 50
              const offset = circ - (pct / 100) * circ
              return (
                <>
                  <svg viewBox="0 0 128 128" className="w-36 h-36 -rotate-90">
                    <circle cx="64" cy="64" r="50" fill="none" stroke="#33343b" strokeWidth="10" />
                    <circle
                      cx="64" cy="64" r="50" fill="none"
                      stroke="#b9c3ff"
                      strokeWidth="10"
                      strokeDasharray={circ}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline text-2xl font-bold text-text-primary">{pct}%</span>
                    <span className="font-mono text-[9px] text-text-muted uppercase">Active</span>
                  </div>
                </>
              )
            })()}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-primary" /><span className="text-text-muted">Active ({stats.active})</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" /><span className="text-text-muted">Others ({stats.total - stats.active})</span></div>
          </div>
        </Card>

        {/* Revenue Source Donut */}
        <Card className="p-5 flex flex-col">
          <h3 className="font-headline text-sm font-bold text-text-primary mb-1">Revenue Sources</h3>
          <p className="text-text-muted text-[10px] mb-4">This Month's Breakdown</p>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {(() => {
              const { memberships, store, trainers, total } = revenueBreakdown
              const pctMem = total > 0 ? (memberships / total) * 100 : 0
              const pctStore = total > 0 ? (store / total) * 100 : 0
              const pctTr = total > 0 ? (trainers / total) * 100 : 0

              const circ = 2 * Math.PI * 50
              
              const memOffset = circ - (pctMem / 100) * circ
              const storeOffset = circ - (pctStore / 100) * circ
              const trOffset = circ - (pctTr / 100) * circ

              return (
                <>
                  <svg viewBox="0 0 128 128" className="w-36 h-36 -rotate-90">
                    <circle cx="64" cy="64" r="50" fill="none" stroke="#33343b" strokeWidth="10" />
                    {pctMem > 0 && <circle cx="64" cy="64" r="50" fill="none" stroke="#b9c3ff" strokeWidth="10" strokeDasharray={circ} strokeDashoffset={memOffset} strokeLinecap="round" className="transition-all duration-1000" />}
                    {pctStore > 0 && <circle cx="64" cy="64" r="50" fill="none" stroke="#16a34a" strokeWidth="10" strokeDasharray={circ} strokeDashoffset={storeOffset} strokeLinecap="round" className="transition-all duration-1000" style={{ transformOrigin: 'center', transform: `rotate(${pctMem * 3.6}deg)` }} />}
                    {pctTr > 0 && <circle cx="64" cy="64" r="50" fill="none" stroke="#f97316" strokeWidth="10" strokeDasharray={circ} strokeDashoffset={trOffset} strokeLinecap="round" className="transition-all duration-1000" style={{ transformOrigin: 'center', transform: `rotate(${(pctMem + pctStore) * 3.6}deg)` }} />}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline text-lg font-bold text-text-primary">Birr {total > 999 ? (total/1000).toFixed(1) + 'k' : total}</span>
                    <span className="font-mono text-[9px] text-text-muted uppercase">Total</span>
                  </div>
                </>
              )
            })()}
          </div>
          <div className="flex flex-col gap-1 mt-4 text-[10px]">
            <div className="flex justify-between"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-text-muted">Memberships</span></div><span className="font-semibold text-text-primary">{revenueBreakdown.memberships}</span></div>
            <div className="flex justify-between"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success-emerald" /><span className="text-text-muted">Store</span></div><span className="font-semibold text-text-primary">{revenueBreakdown.store}</span></div>
            <div className="flex justify-between"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-warning-orange" /><span className="text-text-muted">Trainers</span></div><span className="font-semibold text-text-primary">{revenueBreakdown.trainers}</span></div>
          </div>
        </Card>
      </div>

      {/* Recent Members table */}
      <Card>
        <div className="px-5 py-4 flex justify-between items-center border-b border-border-subtle">
          <h3 className="font-headline text-sm font-bold text-text-primary">Recent Members</h3>
          <button onClick={() => navigate('/app/members')} className="text-primary text-xs font-bold hover:underline">View Directory →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                {['Member', 'Plan', 'Status', 'Join Date', ''].map((h) => (
                  <th key={h} className="px-5 py-3 font-mono text-[10px] text-text-muted uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {recentMembers.map((m) => {
                const status = getMemberStatus(m.renewal_date)
                return (
                  <tr key={m.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                          {m.first_name[0]}{m.last_name[0]}
                        </div>
                        <div>
                          <p className="font-body text-sm font-semibold text-text-primary">{m.first_name} {m.last_name}</p>
                          <p className="font-mono text-[10px] text-text-muted">{m.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-text-muted">{m.plan}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={status} /></td>
                    <td className="px-5 py-3.5 text-xs text-text-muted">{m.join_date}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => onSelectMember(m)} className="text-primary text-xs font-bold hover:underline">
                        Details
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
