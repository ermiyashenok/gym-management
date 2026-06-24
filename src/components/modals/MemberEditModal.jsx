import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { FormField, Input, Select, Textarea, PrimaryButton, GhostButton } from '@/components/ui'

export default function MemberEditModal({ member, onClose }) {
  const trainers     = useStore((s) => s.trainers)
  const branches     = useStore((s) => s.branches)
  const updateMember = useStore((s) => s.updateMember)

  const [form, setForm] = useState({
    first_name:   member?.first_name   ?? '',
    last_name:    member?.last_name    ?? '',
    phone:        member?.phone        ?? '',
    email:        member?.email        ?? '',
    dob:          member?.dob          ?? '',
    gender:       member?.gender       ?? 'Male',
    plan:         member?.plan         ?? 'Monthly',
    renewal_date: member?.renewal_date ?? '',
    trainer_id:   member?.trainer_id   ?? '',
    branch_id:    member?.branch_id    ?? '',
    notes:        member?.notes        ?? '',
  })

  if (!member) return null

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMember({ id: member.id, ...form, trainer_id: form.trainer_id || null })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl bg-surface border border-border-subtle rounded-xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar page-enter"
      >
        <div className="flex justify-between items-center border-b border-border-subtle pb-4">
          <h3 className="font-headline text-lg font-bold text-text-primary">Edit Member Profile</h3>
          <button type="button" onClick={onClose} className="p-1 text-text-muted hover:text-text-primary hover:bg-white/5 rounded">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="First Name *">
            <Input required value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
          </FormField>
          <FormField label="Last Name *">
            <Input required value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
          </FormField>
          <FormField label="Phone *">
            <Input required value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </FormField>
          <FormField label="Email">
            <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </FormField>
          <FormField label="Date of Birth">
            <Input type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} />
          </FormField>
          <FormField label="Gender">
            <Select value={form.gender} onChange={(e) => set('gender', e.target.value)}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
          </FormField>
          <FormField label="Membership Plan">
            <Select value={form.plan} onChange={(e) => set('plan', e.target.value)}>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annual">Annual</option>
            </Select>
          </FormField>
          <FormField label="Renewal Date *">
            <Input type="date" required value={form.renewal_date} onChange={(e) => set('renewal_date', e.target.value)} />
          </FormField>
          <FormField label="Assigned Coach">
            <Select value={form.trainer_id} onChange={(e) => set('trainer_id', e.target.value)}>
              <option value="">No Personal Coach</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Branch">
            <Select value={form.branch_id} onChange={(e) => set('branch_id', e.target.value)}>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="Locker Notes">
          <Textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </FormField>

        <div className="flex justify-end gap-3 border-t border-border-subtle pt-4">
          <GhostButton type="button" onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton type="submit">Save Changes</PrimaryButton>
        </div>
      </form>
    </div>
  )
}
