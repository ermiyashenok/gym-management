import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { Card, FormField, Input, Select, Textarea, PrimaryButton, GhostButton } from '@/components/ui'

const SPECIALIZATIONS = ['Weight Training', 'Yoga & Mobility', 'Powerlifting', 'Functional Fitness', 'Bio-Mechanics', 'Cardio & HIIT', 'CrossFit']

export default function AddTrainerPage() {
  const navigate    = useNavigate()
  const branches    = useStore((s) => s.branches)
  const addTrainer  = useStore((s) => s.addTrainer)
  const currentBranch = useStore((s) => s.currentBranch)

  const [form, setForm] = useState({
    first_name:      '',
    last_name:       '',
    phone:           '',
    email:           '',
    specialization:  SPECIALIZATIONS[0],
    experience_yrs:  '3',
    branch_id:       currentBranch !== 'all' ? currentBranch : (branches[0]?.id ?? ''),
    stipend_per_member: '0',
    notes:           '',
  })

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    addTrainer(form)
    navigate('/app/trainers')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-enter">
      <div>
        <h1 className="font-headline text-2xl font-bold text-text-primary">Add Elite Trainer</h1>
        <p className="text-text-muted text-xs mt-1">Register a new fitness specialist for scheduled workouts.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-5">
          <h2 className="font-mono text-[10px] text-text-muted uppercase tracking-widest border-b border-border-subtle pb-3">
            Coach Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="First Name *">
              <Input required value={form.first_name} onChange={(e) => setField('first_name', e.target.value)} />
            </FormField>
            <FormField label="Last Name *">
              <Input required value={form.last_name} onChange={(e) => setField('last_name', e.target.value)} />
            </FormField>
            <FormField label="Phone Number *">
              <Input required type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
            </FormField>
            <FormField label="Email Address">
              <Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
            </FormField>
            <FormField label="Specialization *">
              <Select value={form.specialization} onChange={(e) => setField('specialization', e.target.value)}>
                {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </FormField>
            <FormField label="Experience (Years)">
              <Input type="number" min="0" max="40" value={form.experience_yrs} onChange={(e) => setField('experience_yrs', e.target.value)} />
            </FormField>
            <FormField label="Stipend per Member (Birr)">
              <Input type="number" min="0" value={form.stipend_per_member} onChange={(e) => setField('stipend_per_member', e.target.value)} />
            </FormField>
            <FormField label="Branch Assignment *">
              <Select value={form.branch_id} onChange={(e) => setField('branch_id', e.target.value)}>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </FormField>
          </div>
        </Card>

        <Card className="p-6">
          <FormField label="Bio / Certification Notes">
            <Textarea rows={3} value={form.notes} onChange={(e) => setField('notes', e.target.value)} placeholder="Special certifications, past experience…" />
          </FormField>
        </Card>

        <div className="flex justify-end gap-3">
          <GhostButton type="button" onClick={() => navigate('/app/trainers')}>Cancel</GhostButton>
          <PrimaryButton type="submit">Register Trainer</PrimaryButton>
        </div>
      </form>
    </div>
  )
}
