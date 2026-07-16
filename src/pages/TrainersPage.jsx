import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { Card, SearchInput, Select, StatusBadge, PrimaryButton } from '@/components/ui'
import TrainerStatusModal from '@/components/modals/TrainerStatusModal'
import { clsx } from 'clsx'

export default function TrainersPage() {
  const trainers      = useStore((s) => s.trainers)
  const members       = useStore((s) => s.members)
  const currentBranch = useStore((s) => s.currentBranch)
  const currentUser   = useStore((s) => s.currentUser)
  const navigate      = useNavigate()

  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [editingTrainer, setEditingTrainer] = useState(null)

  const canCreate = currentUser?.role === 'SuperAdmin' || currentUser?.role === 'Staff' || currentUser?.role === 'Manager'

  const canEditStatus = (trainerId) => {
    return (
      currentUser?.role === 'SuperAdmin' ||
      currentUser?.role === 'Staff' ||
      currentUser?.role === 'Manager' ||
      (currentUser?.role === 'Trainer' && currentUser?.trainer_id === trainerId)
    )
  }

  // Count assigned members per trainer
  const memberCounts = useMemo(() => {
    const counts = {}
    members.forEach((m) => { if (m.trainer_id) counts[m.trainer_id] = (counts[m.trainer_id] ?? 0) + 1 })
    return counts
  }, [members])

  const filtered = useMemo(() =>
    trainers.filter((t) => {
      if (currentBranch !== 'all' && t.branch_id !== currentBranch) return false
      const q = `${t.first_name} ${t.last_name} ${t.specialization}`.toLowerCase()
      if (search && !q.includes(search.toLowerCase())) return false
      if (statusFilter !== 'All' && t.status !== statusFilter) return false
      return true
    }),
    [trainers, currentBranch, search, statusFilter]
  )

  return (
    <div className="space-y-6 page-enter">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-text-primary">Trainers Directory</h1>
          <p className="text-text-muted text-xs mt-1">Manage elite fitness coaches and their schedules.</p>
        </div>
        {canCreate && (
          <PrimaryButton onClick={() => navigate('/app/trainers/add')} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span> Add Trainer
          </PrimaryButton>
        )}
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SearchInput className="md:col-span-2" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or specialization…" />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Break">On Break</option>
            <option value="Offline">Offline</option>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-border-subtle">
              <tr>
                {['Trainer', 'Specialization', 'Phone', 'Experience', 'Members', 'Status', ''].map((h) => (
                  <th key={h} className="px-6 py-4 font-mono text-[10px] text-text-muted uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-muted text-sm">No trainers found.</td>
                </tr>
              ) : filtered.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-body text-sm font-semibold text-text-primary">{t.first_name} {t.last_name}</p>
                    <p className="font-mono text-[10px] text-text-muted">{t.email ?? '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-secondary-container/30 text-on-secondary-container font-mono text-[10px] font-bold uppercase whitespace-nowrap">
                      {t.specialization}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-text-muted">{t.phone}</td>
                  <td className="px-6 py-4 text-xs text-text-muted">{t.experience_yrs ?? '—'} yrs</td>
                  <td className="px-6 py-4 text-sm font-semibold text-text-primary text-center">
                    {memberCounts[t.id] ?? 0}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={t.status} />
                    {t.status !== 'Active' && (t.unavailable_until || t.unavailable_duration) && (
                      <p className="text-[10px] text-text-muted mt-1 font-mono leading-tight">
                        {t.unavailable_duration && t.unavailable_duration !== 'Custom Date'
                          ? `${t.unavailable_duration}`
                          : ''}
                        {t.unavailable_until ? ` until ${t.unavailable_until}` : ''}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {canEditStatus(t.id) && (
                        <button
                          onClick={() => setEditingTrainer(t)}
                          className="px-3 py-1.5 border border-border-subtle hover:bg-surface-container-high text-on-surface text-xs font-bold rounded-lg transition-all"
                        >
                          Edit Status
                        </button>
                      )}
                      <button
                        onClick={() => navigate('/app/schedule')}
                        className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-all"
                      >
                        View Calendar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editingTrainer && (
        <TrainerStatusModal
          trainer={editingTrainer}
          onClose={() => setEditingTrainer(null)}
        />
      )}
    </div>
  )
}
