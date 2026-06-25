import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { downloadCSV, TODAY_STR } from '@/utils/helpers'
import { Card, SearchInput, Select, PrimaryButton, GhostButton } from '@/components/ui'
import RecordPaymentModal from '@/components/modals/RecordPaymentModal'
import ReceiptModal from '@/components/modals/ReceiptModal'

export default function PaymentsPage() {
  const payments       = useStore((s) => s.payments)
  const members        = useStore((s) => s.members)
  const currentBranch  = useStore((s) => s.currentBranch)
  const currentUser    = useStore((s) => s.currentUser)

  const [search,        setSearch]        = useState('')
  const [methodFilter,  setMethodFilter]  = useState('All')
  const [paymentModal,  setPaymentModal]  = useState(null)  // null | 'select' | member obj
  const [receiptModal,  setReceiptModal]  = useState(null)  // null | payment obj

  const canRecord = currentUser?.role !== 'Manager' && currentUser?.role !== 'Trainer' && currentUser?.role !== 'Owner'

  // Branch-filtered payments
  const filtered = useMemo(() =>
    payments.filter((p) => {
      if (p.member_id === 'Amenity_Sale' || p.member_id === 'Trainer_Admission') {
        const q = `${p.member_id} ${p.plan_label} ${p.id}`.toLowerCase()
        if (search && !q.includes(search.toLowerCase())) return false
        if (methodFilter !== 'All' && p.method !== methodFilter) return false
        return true
      }
      const m = members.find((mem) => mem.id === p.member_id)
      if (!m) return false
      if (currentBranch !== 'all' && m.branch_id !== currentBranch) return false

      const q = `${m.first_name} ${m.last_name} ${p.plan_label} ${p.id}`.toLowerCase()
      if (search && !q.includes(search.toLowerCase())) return false
      if (methodFilter !== 'All' && p.method !== methodFilter) return false
      return true
    }),
    [payments, members, currentBranch, search, methodFilter]
  )

  const totalCollected = useMemo(() =>
    filtered.reduce((s, p) => s + p.amount, 0),
    [filtered]
  )

  const handleExport = () => {
    const header = 'Payment ID,Member Name,Amount,Method,Plan Covered,Recorded By,Paid At\n'
    const rows   = filtered.map((p) => {
      const m = members.find((mem) => mem.id === p.member_id)
      let name = 'Unknown'
      if (m) name = `${m.first_name} ${m.last_name}`
      else if (p.member_id === 'Amenity_Sale') name = 'Store Sale'
      else if (p.member_id === 'Trainer_Admission') name = 'Trainer Fee'
      return `"${p.id}","${name}","${p.amount}","${p.method}","${p.plan_label}","${p.recorded_by}","${p.paid_at}"`
    }).join('\n')
    downloadCSV(`GYMSYS_Payments_${currentBranch}_${TODAY_STR}.csv`, header + rows)
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-text-primary">Payments & Transactions</h1>
          <p className="text-text-muted text-xs mt-1">Audit ledgers and membership renewals.</p>
        </div>
        <div className="flex gap-2">
          <GhostButton onClick={handleExport} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span> Export CSV
          </GhostButton>
          {canRecord && (
            <PrimaryButton onClick={() => setPaymentModal('select')} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">payments</span> Record Payment
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Total Collected</p>
          <p className="font-headline text-2xl font-bold text-text-primary mt-1">Birr {totalCollected.toLocaleString()}</p>
          <p className="text-[10px] text-text-muted mt-0.5">Filtered view</p>
        </Card>
        <Card className="p-5">
          <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Transactions</p>
          <p className="font-headline text-2xl font-bold text-text-primary mt-1">{filtered.length}</p>
          <p className="text-[10px] text-text-muted mt-0.5">Visible records</p>
        </Card>
        <Card className="p-5">
          <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Avg Transaction</p>
          <p className="font-headline text-2xl font-bold text-text-primary mt-1">
            ${filtered.length ? Math.round(totalCollected / filtered.length).toLocaleString() : 0}
          </p>
          <p className="text-[10px] text-text-muted mt-0.5">Per payment</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SearchInput
            className="md:col-span-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by member, plan label, ID…"
          />
          <Select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            <option value="All">All Methods</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
            <option value="Transfer">Bank Transfer</option>
          </Select>
        </div>
      </Card>

      {/* Transactions table */}
      <Card className="overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-border-subtle">
              <tr>
                {['ID', 'Member', 'Amount', 'Method', 'Plan Covered', 'Recorded By', 'Date', ''].map((h) => (
                  <th key={h} className="px-5 py-4 font-mono text-[10px] text-text-muted uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-text-muted text-sm">
                    No transactions found.
                  </td>
                </tr>
              ) : filtered.map((p) => {
                const member = members.find((m) => m.id === p.member_id)
                let nameStr = 'Unknown'
                if (member) nameStr = `${member.first_name} ${member.last_name}`
                else if (p.member_id === 'Amenity_Sale') nameStr = 'Store Sale'
                else if (p.member_id === 'Trainer_Admission') nameStr = 'Trainer Fee'

                return (
                  <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-primary font-bold">#{p.id}</td>
                    <td className="px-5 py-3.5 font-body text-sm font-semibold text-text-primary whitespace-nowrap">
                      {nameStr}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-text-primary">Birr {p.amount.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-xs text-text-muted">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">
                          {p.method === 'Card' ? 'credit_card' : p.method === 'Cash' ? 'payments' : 'account_balance'}
                        </span>
                        {p.method}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-text-muted max-w-[200px] truncate">{p.plan_label}</td>
                    <td className="px-5 py-3.5 text-xs text-text-muted">{p.recorded_by}</td>
                    <td className="px-5 py-3.5 text-xs text-text-muted whitespace-nowrap">
                      {new Date(p.paid_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setReceiptModal(p)}
                        className="flex items-center gap-1 text-primary text-xs font-bold hover:underline ml-auto"
                      >
                        <span className="material-symbols-outlined text-sm">receipt</span> Receipt
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-border-subtle bg-surface-container-low flex justify-between text-xs text-text-muted">
            <span>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
            <span className="font-semibold text-text-primary">Total: Birr {totalCollected.toLocaleString()}</span>
          </div>
        )}
      </Card>

      {/* Modals */}
      <RecordPaymentModal member={paymentModal} onClose={() => setPaymentModal(null)} />
      <ReceiptModal payment={receiptModal} onClose={() => setReceiptModal(null)} />
    </div>
  )
}
