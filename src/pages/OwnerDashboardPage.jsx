import { useMemo, useState } from 'react'
import { useStore } from '@/store/useStore'
import { TODAY_STR } from '@/utils/helpers'
import { Card, MetricCard } from '@/components/ui'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function OwnerDashboardPage() {
  const payments  = useStore((s) => s.payments)
  const branches  = useStore((s) => s.branches)
  const gyms      = useStore((s) => s.gyms)
  const amenities = useStore((s) => s.amenities)
  const members   = useStore((s) => s.members)
  const currentBranch = useStore((s) => s.currentBranch)

  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'payments' | 'shop'

  const now = new Date(TODAY_STR)

  // All-time totals
  const allRevenue = useMemo(() => payments.reduce((s, p) => s + p.amount, 0), [payments])

  const membershipRevenue = useMemo(() =>
    payments.filter(p => p.member_id !== 'Amenity_Sale' && p.member_id !== 'Daily_Entry' && p.member_id !== 'Trainer_Admission')
      .reduce((s, p) => s + p.amount, 0), [payments])

  const shopRevenue = useMemo(() =>
    payments.filter(p => p.member_id === 'Amenity_Sale').reduce((s, p) => s + p.amount, 0), [payments])

  const dailyRevenue = useMemo(() =>
    payments.filter(p => p.member_id === 'Daily_Entry').reduce((s, p) => s + p.amount, 0), [payments])

  // Monthly bar chart data (last 6 months)
  const chartData = useMemo(() => {
    const result = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now)
      d.setMonth(d.getMonth() - i)
      const yr = d.getFullYear()
      const mo = d.getMonth()
      const total = payments
        .filter(p => { const pd = new Date(p.paid_at); return pd.getFullYear() === yr && pd.getMonth() === mo })
        .reduce((s, p) => s + p.amount, 0)
      result.push({ label: MONTHS[mo], total })
    }
    const max = Math.max(...result.map(r => r.total), 1)
    return result.map(r => ({ ...r, height: Math.max((r.total / max) * 100, 3) }))
  }, [payments])

  // Revenue breakdown by branch
  const branchBreakdown = useMemo(() => branches.map(b => {
    const branchPayments = payments.filter(p => {
      if (p.member_id === 'Amenity_Sale') return false
      if (p.member_id === 'Daily_Entry') return p.plan_label?.includes(b.name)
      const m = members.find(mem => mem.id === p.member_id)
      return m?.branch_id === b.id
    })
    return {
      branch: b,
      total: branchPayments.reduce((s, p) => s + p.amount, 0),
      count: branchPayments.length,
    }
  }).sort((a, z) => z.total - a.total), [branches, payments, members])

  // Filtered payments
  const filteredPayments = useMemo(() => {
    if (currentBranch === 'all') return payments
    return payments.filter(p => {
      if (p.member_id === 'Amenity_Sale') return true
      if (p.member_id === 'Daily_Entry') {
        const b = branches.find(b => b.id === currentBranch)
        return b && p.plan_label?.includes(b.name)
      }
      const m = members.find(mem => mem.id === p.member_id)
      return m?.branch_id === currentBranch
    })
  }, [payments, currentBranch, branches, members])

  // Sold amenities
  const amenitySales = useMemo(() =>
    payments.filter(p => p.member_id === 'Amenity_Sale'), [payments])

  const gymCount = gyms?.length || 1

  return (
    <div className="space-y-8 page-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-text-primary">Owner's Financial Hub</h1>
          <p className="text-text-muted text-xs mt-1">Full revenue visibility across all gyms and branches.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="material-symbols-outlined text-primary text-sm">calendar_today</span>
          <span className="text-text-muted">{now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon="paid"           label="All-Time Revenue"    value={`Birr ${allRevenue.toLocaleString()}`}     color="primary"  />
        <MetricCard icon="fitness_center" label="Membership Revenue"  value={`Birr ${membershipRevenue.toLocaleString()}`} color="success"  />
        <MetricCard icon="local_mall"     label="Shop Revenue"        value={`Birr ${shopRevenue.toLocaleString()}`}    color="warning"  />
        <MetricCard icon="domain"         label="Branches Managed"    value={branches.length}                           color="danger"   />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-headline text-sm font-bold text-text-primary">Total Revenue — Last 6 Months</h3>
              <p className="text-text-muted text-[10px]">All income sources combined</p>
            </div>
            <div className="text-right">
              <p className="font-headline text-xl font-bold text-text-primary">Birr {allRevenue.toLocaleString()}</p>
              <p className="text-[10px] text-success-emerald font-bold font-mono">All-Time</p>
            </div>
          </div>
          <div className="h-44 flex items-end gap-3">
            {chartData.map((d, i) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-2 group">
                <div
                  className={`w-full rounded-t transition-all duration-700 cursor-default ${i === 5 ? 'bg-primary' : 'bg-surface-container-highest group-hover:bg-primary/30'}`}
                  style={{ height: `${d.height}%`, minHeight: '4px' }}
                  title={`Birr ${d.total.toLocaleString()}`}
                />
                <span className="font-mono text-[9px] text-text-muted">{d.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue Source Donut */}
        <Card className="p-5 flex flex-col">
          <h3 className="font-headline text-sm font-bold text-text-primary mb-1">Revenue Mix</h3>
          <p className="text-text-muted text-[10px] mb-4">All-time by source</p>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {(() => {
              const total = membershipRevenue + shopRevenue + dailyRevenue || 1
              const pctM = (membershipRevenue / total) * 100
              const pctS = (shopRevenue / total) * 100
              const pctD = (dailyRevenue / total) * 100
              const circ = 2 * Math.PI * 50
              return (
                <>
                  <svg viewBox="0 0 128 128" className="w-36 h-36 -rotate-90">
                    <circle cx="64" cy="64" r="50" fill="none" stroke="#33343b" strokeWidth="10" />
                    {pctM > 0 && <circle cx="64" cy="64" r="50" fill="none" stroke="#b9c3ff" strokeWidth="10" strokeDasharray={circ} strokeDashoffset={circ - (pctM / 100) * circ} strokeLinecap="round" className="transition-all duration-1000" />}
                    {pctS > 0 && <circle cx="64" cy="64" r="50" fill="none" stroke="#16a34a" strokeWidth="10" strokeDasharray={circ} strokeDashoffset={circ - (pctS / 100) * circ} strokeLinecap="round" className="transition-all duration-1000" style={{ transformOrigin: 'center', transform: `rotate(${pctM * 3.6}deg)` }} />}
                    {pctD > 0 && <circle cx="64" cy="64" r="50" fill="none" stroke="#f97316" strokeWidth="10" strokeDasharray={circ} strokeDashoffset={circ - (pctD / 100) * circ} strokeLinecap="round" className="transition-all duration-1000" style={{ transformOrigin: 'center', transform: `rotate(${(pctM + pctS) * 3.6}deg)` }} />}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline text-lg font-bold text-text-primary">Birr {total > 999 ? (total / 1000).toFixed(1) + 'k' : total}</span>
                    <span className="font-mono text-[9px] text-text-muted uppercase">Total</span>
                  </div>
                </>
              )
            })()}
          </div>
          <div className="flex flex-col gap-1.5 mt-4 text-[10px]">
            <div className="flex justify-between"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-text-muted">Memberships</span></div><span className="font-semibold text-text-primary">Birr {membershipRevenue.toLocaleString()}</span></div>
            <div className="flex justify-between"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success-emerald" /><span className="text-text-muted">Shop</span></div><span className="font-semibold text-text-primary">Birr {shopRevenue.toLocaleString()}</span></div>
            <div className="flex justify-between"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-warning-orange" /><span className="text-text-muted">Daily Entries</span></div><span className="font-semibold text-text-primary">Birr {dailyRevenue.toLocaleString()}</span></div>
          </div>
        </Card>
      </div>

      {/* Branch Revenue Breakdown */}
      <Card className="p-5">
        <h3 className="font-headline text-sm font-bold text-text-primary mb-4">Revenue by Branch</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branchBreakdown.map(({ branch, total, count }) => {
            const pct = allRevenue > 0 ? Math.round((total / allRevenue) * 100) : 0
            return (
              <div key={branch.id} className="bg-surface-container-low border border-border-subtle rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-base">storefront</span>
                  <p className="font-bold text-sm text-text-primary truncate">{branch.name}</p>
                </div>
                <p className="font-headline text-2xl font-bold text-text-primary mb-1">Birr {total.toLocaleString()}</p>
                <p className="text-[10px] text-text-muted mb-3">{count} transactions · {pct}% of total</p>
                <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Tabs: Payments & Shop */}
      <div>
        <div className="flex gap-1 border-b border-border-subtle mb-4">
          {[
            { id: 'payments', label: 'Payment Ledger', icon: 'payments' },
            { id: 'shop',     label: 'Shop Sales',     icon: 'local_mall' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold font-mono border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'payments' && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-border-subtle">
                  <tr>
                    {['ID', 'Description', 'Amount', 'Method', 'Recorded By', 'Date'].map(h => (
                      <th key={h} className="px-5 py-4 font-mono text-[10px] text-text-muted uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/40">
                  {filteredPayments.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-text-muted text-sm">No payments found.</td></tr>
                  ) : filteredPayments.slice(0, 50).map(p => {
                    const m = members.find(mem => mem.id === p.member_id)
                    let name = 'Unknown'
                    if (m) name = `${m.first_name} ${m.last_name}`
                    else if (p.member_id === 'Amenity_Sale') name = '🛒 Store Sale'
                    else if (p.member_id === 'Daily_Entry') name = '🏃 Daily Entry'
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-primary font-bold">#{p.id}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-sm text-text-primary">{name}</p>
                          <p className="text-[10px] text-text-muted">{p.plan_label}</p>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-text-primary">Birr {p.amount.toFixed(2)}</td>
                        <td className="px-5 py-3.5 text-xs text-text-muted">{p.method}</td>
                        <td className="px-5 py-3.5 text-xs text-text-muted">{p.recorded_by}</td>
                        <td className="px-5 py-3.5 text-xs text-text-muted whitespace-nowrap">
                          {new Date(p.paid_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredPayments.length > 0 && (
              <div className="px-5 py-3 border-t border-border-subtle bg-surface-container-low flex justify-between text-xs text-text-muted">
                <span>{filteredPayments.length} records</span>
                <span className="font-semibold text-text-primary">Total: Birr {filteredPayments.reduce((s, p) => s + p.amount, 0).toLocaleString()}</span>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'shop' && (
          <div className="space-y-4">
            {/* Shop KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Shop Revenue</p>
                <p className="font-headline text-xl font-bold text-text-primary mt-1">Birr {shopRevenue.toLocaleString()}</p>
              </Card>
              <Card className="p-4">
                <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Items Sold</p>
                <p className="font-headline text-xl font-bold text-text-primary mt-1">{amenitySales.length}</p>
              </Card>
              <Card className="p-4">
                <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Active SKUs</p>
                <p className="font-headline text-xl font-bold text-text-primary mt-1">{amenities.length}</p>
              </Card>
              <Card className="p-4">
                <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Avg Sale</p>
                <p className="font-headline text-xl font-bold text-text-primary mt-1">
                  Birr {amenitySales.length ? Math.round(shopRevenue / amenitySales.length).toLocaleString() : 0}
                </p>
              </Card>
            </div>

            {/* Current inventory */}
            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-border-subtle flex justify-between items-center">
                <h3 className="font-headline text-sm font-bold text-text-primary">Current Inventory</h3>
                <span className="text-[10px] font-mono text-text-muted">{amenities.length} items</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low border-b border-border-subtle">
                    <tr>
                      {['Item', 'Category', 'Price', 'Stock', 'Total Sold', 'Revenue'].map(h => (
                        <th key={h} className="px-5 py-3.5 font-mono text-[10px] text-text-muted uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/40">
                    {amenities.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-text-muted text-sm">No items in inventory.</td></tr>
                    ) : amenities.map(item => {
                      const soldCount = amenitySales.filter(p => p.plan_label === `Sold ${item.name}`).length
                      const itemRevenue = soldCount * item.price
                      return (
                        <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              {item.image
                                ? <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                                : <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center"><span className="material-symbols-outlined text-sm text-text-muted">shopping_bag</span></div>
                              }
                              <span className="font-semibold text-sm text-text-primary">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-text-muted">{item.category}</td>
                          <td className="px-5 py-3.5 text-primary font-bold text-sm">Birr {item.price}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.stock <= 0 ? 'bg-danger-red/10 text-danger-red' : item.stock < 5 ? 'bg-warning-orange/10 text-warning-orange' : 'bg-success-emerald/10 text-success-emerald'}`}>
                              {item.stock} left
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-text-muted">{soldCount}</td>
                          <td className="px-5 py-3.5 font-semibold text-text-primary">Birr {itemRevenue.toLocaleString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
