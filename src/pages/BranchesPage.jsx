import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Card, FormField, Input, Select, PrimaryButton, GhostButton } from '@/components/ui'
import { ALL_TIMES } from '@/utils/helpers'
import { clsx } from 'clsx'

export default function BranchesPage() {
  const branches     = useStore((s) => s.branches)
  const gyms         = useStore((s) => s.gyms)
  const members      = useStore((s) => s.members)
  const trainers     = useStore((s) => s.trainers)
  const updateBranch = useStore((s) => s.updateBranch)
  const deleteBranch = useStore((s) => s.deleteBranch)
  const currentUser  = useStore((s) => s.currentUser)
  const isSuperAdmin = currentUser?.role === 'SuperAdmin'

  const visibleBranches = isSuperAdmin ? branches : branches.filter(b => b.id === currentUser?.branch_id)

  const emptyForm = { gym_id: gyms[0]?.id || 'g1', name: '', address: '', phone: '', manager_name: '', opening_time: '06:00 AM', closing_time: '10:00 PM', lunch_start: '12:00 PM', lunch_end: '02:00 PM', monthly_rate: '', quarterly_rate: '', daily_rate: '' }
  const [form,      setForm]      = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateBranch({ id: editingId, ...form })
      setEditingId(null)
    } else {
      addBranch(form)
    }
    setForm(emptyForm)
  }

  const triggerEdit = (b) => {
    setEditingId(b.id)
    setForm({ gym_id: b.gym_id || 'g1', name: b.name, address: b.address, phone: b.phone, manager_name: b.manager_name, opening_time: b.opening_time || '06:00 AM', closing_time: b.closing_time || '10:00 PM', lunch_start: b.lunch_start || '12:00 PM', lunch_end: b.lunch_end || '02:00 PM', monthly_rate: b.monthly_rate || '', quarterly_rate: b.quarterly_rate || '', daily_rate: b.daily_rate || '' })
  }

  const handleDelete = (b) => {
    if (window.confirm(`Deactivate "${b.name}"? Members and trainers will lose their branch assignment.`)) {
      deleteBranch(b.id)
    }
  }

  // Stats per branch
  const branchStats = (id) => ({
    members:  members.filter((m) => m.branch_id === id).length,
    trainers: trainers.filter((t) => t.branch_id === id).length,
  })

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="font-headline text-2xl font-bold text-text-primary">Branch Locations</h1>
        <p className="text-text-muted text-xs mt-1">Manage physical gym locations and assign managers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── Create / Edit form ── */}
        {(isSuperAdmin || editingId) && (
        <Card className="p-5 space-y-4">
          <h2 className="font-mono text-[10px] text-text-muted uppercase tracking-widest border-b border-border-subtle pb-3">
            {editingId ? 'Edit Branch' : 'Add New Branch'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSuperAdmin && (
              <FormField label="Assign to Gym *">
                <Select required value={form.gym_id} onChange={(e) => setField('gym_id', e.target.value)}>
                  {gyms.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </Select>
              </FormField>
            )}
            <FormField label="Branch Name *">
              <Input required value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Uptown Fitness" />
            </FormField>
            <FormField label="Address *">
              <Input required value={form.address} onChange={(e) => setField('address', e.target.value)} placeholder="123 Main St, City" />
            </FormField>
            <FormField label="Phone *">
              <Input required type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="(555) 000-0000" />
            </FormField>
            <FormField label="Manager Name">
              <Input value={form.manager_name} onChange={(e) => setField('manager_name', e.target.value)} placeholder="Optional" />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Opening Time *">
                <Select required value={form.opening_time} onChange={(e) => setField('opening_time', e.target.value)}>
                  {ALL_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </FormField>
              <FormField label="Closing Time *">
                <Select required value={form.closing_time} onChange={(e) => setField('closing_time', e.target.value)}>
                  {ALL_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </FormField>
              <FormField label="Lunch Start">
                <Select value={form.lunch_start} onChange={(e) => setField('lunch_start', e.target.value)}>
                  {ALL_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </FormField>
              <FormField label="Lunch End">
                <Select value={form.lunch_end} onChange={(e) => setField('lunch_end', e.target.value)}>
                  {ALL_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Daily Entry Rate (Birr)">
                <Input type="number" required min="0" value={form.daily_rate} onChange={(e) => setField('daily_rate', e.target.value)} />
              </FormField>
              <FormField label="Monthly Rate (Birr)">
                <Input type="number" required min="0" value={form.monthly_rate} onChange={(e) => setField('monthly_rate', e.target.value)} />
              </FormField>
              <FormField label="Quarterly Rate (Birr)">
                <Input type="number" required min="0" value={form.quarterly_rate} onChange={(e) => setField('quarterly_rate', e.target.value)} />
              </FormField>
            </div>

            <div className="flex gap-2 pt-1">
              {editingId && (
                <GhostButton type="button" onClick={() => { setEditingId(null); setForm(emptyForm) }} className="flex-1">
                  Cancel
                </GhostButton>
              )}
              <PrimaryButton type="submit" className="flex-1">
                {editingId ? 'Save Changes' : 'Create Branch'}
              </PrimaryButton>
            </div>
          </form>
        </Card>
        )}

        {/* ── Branches list ── */}
        <div className={`space-y-4 ${isSuperAdmin || editingId ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {visibleBranches.length === 0 ? (
            <Card className="p-12 text-center text-text-muted text-sm">No branches configured yet.</Card>
          ) : visibleBranches.map((b) => {
            const stats = branchStats(b.id)
            const isEditing = editingId === b.id
            return (
              <Card key={b.id} className={clsx('p-5 transition-all', isEditing && 'border-primary/40 bg-primary/[0.02]')}>
                <div className="flex items-start justify-between gap-4">
                  {/* Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        storefront
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-headline text-sm font-bold text-text-primary">{b.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">{b.address}</p>
                      <p className="text-xs text-text-muted">{b.phone}</p>
                      {b.manager_name && (
                        <p className="text-xs text-on-surface-variant mt-1">
                          <span className="text-text-muted">Manager:</span> {b.manager_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => triggerEdit(b)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Edit branch"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    {isSuperAdmin && (
                    <button
                      onClick={() => handleDelete(b)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-danger-red hover:bg-danger-red/10 transition-colors"
                      title="Deactivate branch"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                    )}
                  </div>
                </div>

                {/* Mini stats */}
                <div className="flex gap-4 mt-4 pt-4 border-t border-border-subtle/50">
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <span className="material-symbols-outlined text-sm">group</span>
                    <span><strong className="text-text-primary">{stats.members}</strong> members</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <span className="material-symbols-outlined text-sm">fitness_center</span>
                    <span><strong className="text-text-primary">{stats.trainers}</strong> trainers</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
