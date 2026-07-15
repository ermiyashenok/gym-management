import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { Card, PrimaryButton, Input, FormField, Select, MetricCard } from '@/components/ui'

export default function ExpensesPage() {
  const expenses = useStore((s) => s.expenses) || []
  const payments = useStore((s) => s.payments) || []
  const members = useStore((s) => s.members) || []
  const branches = useStore((s) => s.branches) || []
  
  const currentBranch = useStore((s) => s.currentBranch)
  const addExpense = useStore((s) => s.addExpense)
  const currentUser = useStore((s) => s.currentUser)
  
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({ type: 'Maintenance', reason: '', amount: '' })

  const filteredExpenses = useMemo(() => expenses.filter(e => currentBranch === 'all' || e.branch_id === currentBranch), [expenses, currentBranch])

  // Calculate Revenue for the selected branch to establish Net Profit
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

  const totalRevenue = useMemo(() => filteredPayments.reduce((s, p) => s + p.amount, 0), [filteredPayments])
  const expenseTotal = useMemo(() => filteredExpenses.reduce((s, e) => s + e.amount, 0), [filteredExpenses])
  const netProfit = totalRevenue - expenseTotal

  const expenseBreakdown = useMemo(() => {
    const grouped = {}
    filteredExpenses.forEach(e => {
      grouped[e.type] = (grouped[e.type] || 0) + e.amount
    })
    return Object.entries(grouped).map(([type, amount]) => ({ type, amount })).sort((a, b) => b.amount - a.amount)
  }, [filteredExpenses])

  const colors = { 'Maintenance': '#f97316', 'Supplies': '#3b82f6', 'Utilities': '#eab308', 'Salaries': '#ec4899', 'Marketing': '#a855f7', 'Other': '#64748b' }

  const handleSubmit = (e) => {
    e.preventDefault()
    addExpense(form)
    setForm({ type: 'Maintenance', reason: '', amount: '' })
    setIsAdding(false)
  }

  return (
    <div className="space-y-6 page-enter">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-text-primary">Financial & Expenses</h1>
          <p className="text-text-muted text-xs mt-1">Track operational costs and monitor true net profit.</p>
        </div>
        {!isAdding && (
          <PrimaryButton onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span> Record Expense
          </PrimaryButton>
        )}
      </div>

      {/* Top Level Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard icon="payments" label="Total Revenue" value={`Birr ${totalRevenue.toLocaleString()}`} color="primary" />
        <MetricCard icon="receipt_long" label="Total Expenses" value={`Birr ${expenseTotal.toLocaleString()}`} color="danger" />
        <Card className="p-4 flex items-center gap-4 relative overflow-hidden bg-success-emerald/5 border border-success-emerald/20">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-success-emerald/20">
            <span className="material-symbols-outlined text-success-emerald text-2xl">account_balance</span>
          </div>
          <div className="relative z-10">
            <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Net Profit</p>
            <p className={`font-headline text-2xl font-bold ${netProfit >= 0 ? 'text-success-emerald' : 'text-danger-red'} mt-0.5`}>
              Birr {netProfit.toLocaleString()}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Expense Breakdown Donut Chart */}
        <Card className="p-5 flex flex-col">
          <h3 className="font-headline text-sm font-bold text-text-primary mb-1">Expense Distribution</h3>
          <p className="text-text-muted text-[10px] mb-4">Breakdown by category</p>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {(() => {
              const total = expenseTotal || 1
              let currentOffset = 0
              const circ = 2 * Math.PI * 50
              
              return (
                <>
                  <svg viewBox="0 0 128 128" className="w-36 h-36 -rotate-90">
                    <circle cx="64" cy="64" r="50" fill="none" stroke="#33343b" strokeWidth="10" />
                    {expenseBreakdown.map(item => {
                      const pct = (item.amount / total) * 100
                      if (pct === 0) return null
                      const color = colors[item.type] || '#fff'
                      const dashoffset = circ - (pct / 100) * circ
                      const transform = `rotate(${currentOffset * 3.6}deg)`
                      currentOffset += pct
                      return <circle key={item.type} cx="64" cy="64" r="50" fill="none" stroke={color} strokeWidth="10" strokeDasharray={circ} strokeDashoffset={dashoffset} strokeLinecap="round" style={{ transformOrigin: 'center', transform }} className="transition-all duration-1000" />
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline text-lg font-bold text-text-primary">Birr {expenseTotal > 999 ? (expenseTotal / 1000).toFixed(1) + 'k' : expenseTotal}</span>
                    <span className="font-mono text-[9px] text-text-muted uppercase">Expenses</span>
                  </div>
                </>
              )
            })()}
          </div>
          <div className="flex flex-col gap-1.5 mt-4 text-[10px]">
            {expenseBreakdown.length === 0 ? (
              <p className="text-center text-text-muted py-2">No expenses recorded.</p>
            ) : expenseBreakdown.map(item => (
              <div key={item.type} className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[item.type] || '#fff' }} />
                  <span className="text-text-muted">{item.type}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-text-primary mr-2">Birr {item.amount.toLocaleString()}</span>
                  <span className="text-text-muted w-6 inline-block text-right">{Math.round((item.amount / (expenseTotal || 1)) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Expenses List */}
        <div className="lg:col-span-2 space-y-4">
          {isAdding && (
            <Card className="p-6 border-primary/30 page-enter">
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-headline text-lg font-bold mb-4">Record New Expense</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField label="Expense Type *">
                    <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      <option value="Maintenance">Maintenance & Repairs</option>
                      <option value="Supplies">Supplies & Equipment</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Salaries">Salaries</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Other">Other</option>
                    </Select>
                  </FormField>
                  <FormField label="Amount (Birr) *">
                    <Input type="number" required min="1" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                  </FormField>
                  <FormField label="Reason / Description *">
                    <Input required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Broken treadmill" />
                  </FormField>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary">Cancel</button>
                  <PrimaryButton type="submit">Save Expense</PrimaryButton>
                </div>
              </form>
            </Card>
          )}

          <Card className="overflow-hidden h-full flex flex-col">
            <div className="px-5 py-4 border-b border-border-subtle flex justify-between items-center">
              <h3 className="font-headline text-sm font-bold text-text-primary">Expense Ledger</h3>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-border-subtle">
                  <tr>
                    {['Date', 'Type', 'Description', 'Amount', 'Recorded By'].map((h) => (
                      <th key={h} className="px-5 py-4 font-mono text-[10px] text-text-muted uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/40">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-text-muted text-sm">No expenses recorded.</td>
                    </tr>
                  ) : filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-5 py-3.5 text-xs text-text-muted whitespace-nowrap">
                        {new Date(exp.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-surface-container-highest text-text-primary font-mono text-[10px] font-bold uppercase whitespace-nowrap" style={{ color: colors[exp.type] }}>
                          {exp.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-text-primary">{exp.reason}</td>
                      <td className="px-5 py-3.5 font-bold text-text-primary">Birr {exp.amount.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-xs text-text-muted">{exp.recorded_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
