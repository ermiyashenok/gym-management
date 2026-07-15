import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { getMemberStatus, downloadCSV, TODAY_STR } from '@/utils/helpers'
import { Card, SearchInput, Select, StatusBadge, PrimaryButton, GhostButton } from '@/components/ui'

export default function MembersPage({ onSelectMember }) {
  const members       = useStore((s) => s.members)
  const trainers      = useStore((s) => s.trainers)
  const currentBranch = useStore((s) => s.currentBranch)
  const currentUser   = useStore((s) => s.currentUser)
  const recordDailyEntry = useStore((s) => s.recordDailyEntry)
  const navigate      = useNavigate()

  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState('All')
  const [trainerFilter, setTrainerFilter] = useState('All')
  const [showDailyEntryModal, setShowDailyEntryModal] = useState(false)

  const isTrainer = currentUser?.role === 'Trainer'
  const canCreate = currentUser?.role === 'SuperAdmin' || currentUser?.role === 'Staff'

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (isTrainer && currentUser?.trainer_id && m.trainer_id !== currentUser.trainer_id) return false
      const searchStr = `${m.first_name} ${m.last_name} ${m.id} ${m.phone}`.toLowerCase()
      if (search && !searchStr.includes(search.toLowerCase())) return false

      const status = getMemberStatus(m.renewal_date)
      if (statusFilter !== 'All' && status !== statusFilter) return false

      if (trainerFilter !== 'All') {
        if (trainerFilter === 'none' && m.trainer_id !== null) return false
        if (trainerFilter !== 'none' && m.trainer_id !== trainerFilter) return false
      }

      return true
    })
  }, [members, currentBranch, isTrainer, currentUser, search, statusFilter, trainerFilter])

  const handleExport = () => {
    const header = 'Member ID,Name,Phone,Email,Plan,Join Date,Renewal Date,Status\n'
    const rows   = filtered.map((m) =>
      `"${m.id}","${m.first_name} ${m.last_name}","${m.phone}","${m.email ?? ''}","${m.plan}","${m.join_date}","${m.renewal_date}","${getMemberStatus(m.renewal_date)}"`
    ).join('\n')
    downloadCSV(`GYMSYS_Members_${currentBranch}_${TODAY_STR}.csv`, header + rows)
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-text-primary">Member Directory</h1>
          <p className="text-text-muted text-xs mt-1">Manage and audit all gym memberships.</p>
        </div>
        <div className="flex gap-2">
          <GhostButton onClick={handleExport} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span> Export CSV
          </GhostButton>
          {canCreate && (
            <>
              <PrimaryButton onClick={() => setShowDailyEntryModal(true)} className="flex items-center gap-2 bg-surface-container-highest text-primary hover:bg-surface-variant">
                <span className="material-symbols-outlined text-sm">local_activity</span> Daily Entry
              </PrimaryButton>
              <PrimaryButton onClick={() => navigate('/app/members/add')} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">add</span> Register Member
              </PrimaryButton>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <SearchInput
            className="md:col-span-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, phone…"
          />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expiring">Expiring Soon</option>
            <option value="Overdue">Overdue</option>
          </Select>
          <Select value={trainerFilter} onChange={(e) => setTrainerFilter(e.target.value)}>
            <option value="All">All Trainers</option>
            <option value="none">No Assigned Trainer</option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-border-subtle">
              <tr>
                {['ID', 'Name', 'Phone', 'Plan', 'Renewal Date', 'Trainer', 'Status', ''].map((h) => (
                  <th key={h} className="px-6 py-4 font-mono text-[10px] text-text-muted uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-text-muted text-sm">
                    No members match your criteria.
                  </td>
                </tr>
              ) : filtered.map((m) => {
                const status  = getMemberStatus(m.renewal_date)
                const trainer = trainers.find((t) => t.id === m.trainer_id)
                return (
                  <tr key={m.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-primary font-bold">{m.id}</td>
                    <td className="px-6 py-4 font-body text-sm font-semibold text-text-primary whitespace-nowrap">
                      {m.first_name} {m.last_name}
                    </td>
                    <td className="px-6 py-4 text-xs text-text-muted">{m.phone}</td>
                    <td className="px-6 py-4 text-xs text-text-muted">{m.plan}</td>
                    <td className={`px-6 py-4 text-xs font-medium ${status === 'Overdue' ? 'text-danger-red' : 'text-text-muted'}`}>
                      {m.renewal_date}
                    </td>
                    <td className="px-6 py-4 text-xs text-text-muted">
                      {trainer ? `${trainer.first_name} ${trainer.last_name}` : 'Not Assigned'}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={status} /></td>
                    <td className="px-6 py-4 text-right">
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
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted bg-surface-container-low">
            <span>{filtered.length} member{filtered.length !== 1 ? 's' : ''} shown</span>
          </div>
        )}
      </Card>

      {showDailyEntryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border-subtle p-6 rounded-xl w-full max-w-xs shadow-2xl relative text-center">
            <span className="material-symbols-outlined text-primary text-4xl mb-3">local_activity</span>
            <h2 className="font-headline text-lg font-bold mb-2">Record Daily Entry?</h2>
            <p className="text-sm text-text-muted mb-6">Are you sure you want to record a daily entry for a non-member?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDailyEntryModal(false)} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary border border-border-subtle rounded-lg">Cancel</button>
              <button onClick={() => { recordDailyEntry(currentBranch); setShowDailyEntryModal(false); }} className="px-4 py-2 text-sm bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
