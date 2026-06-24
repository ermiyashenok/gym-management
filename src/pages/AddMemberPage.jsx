import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { PLAN_PRICES, extendDate, TODAY_STR } from '@/utils/helpers'
import { Card, FormField, Input, Select, Textarea, PrimaryButton, GhostButton } from '@/components/ui'

export default function AddMemberPage() {
  const navigate     = useNavigate()
  const trainers     = useStore((s) => s.trainers)
  const branches     = useStore((s) => s.branches)
  const currentUser  = useStore((s) => s.currentUser)
  const currentBranch = useStore((s) => s.currentBranch)
  const addMember    = useStore((s) => s.addMember)

  const [form, setForm] = useState({
    first_name:      '',
    last_name:       '',
    phone:           '',
    email:           '',
    dob:             '',
    gender:          'Male',
    plan:            'Monthly',
    start_date:      TODAY_STR,
    trainer_id:      '',
    branch_id:       currentBranch !== 'all' ? currentBranch : (branches[0]?.id ?? ''),
    payment_amount:  String(PLAN_PRICES['Monthly']),
    payment_method:  'Card',
    notes:           '',
  })

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  // Auto-update price when plan changes
  useEffect(() => {
    setField('payment_amount', String(PLAN_PRICES[form.plan] ?? 99))
  }, [form.plan])

  // Clear trainer if branch changes and trainer is not in branch
  useEffect(() => {
    const trainer = trainers.find(t => t.id === form.trainer_id)
    if (trainer && trainer.branch_id !== form.branch_id) {
      setField('trainer_id', '')
    }
  }, [form.branch_id, form.trainer_id, trainers])

  // Preview renewal date
  const previewRenewal = form.start_date ? extendDate(form.start_date, form.plan) : '—'

  const handleSubmit = (e) => {
    e.preventDefault()
    addMember({ ...form, trainer_id: form.trainer_id || null })
    navigate('/app/members')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 page-enter">
      <div>
        <h1 className="font-headline text-2xl font-bold text-text-primary">Register New Member</h1>
        <p className="text-text-muted text-xs mt-1">Enroll a new member, select a plan, and log the initial payment.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal information */}
        <Card className="p-6 space-y-5">
          <h2 className="font-mono text-[10px] text-text-muted uppercase tracking-widest border-b border-border-subtle pb-3">
            Personal Information
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
            <FormField label="Date of Birth">
              <Input type="date" value={form.dob} onChange={(e) => setField('dob', e.target.value)} />
            </FormField>
            <FormField label="Gender">
              <Select value={form.gender} onChange={(e) => setField('gender', e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </FormField>
          </div>
        </Card>

        {/* Membership & Billing */}
        <Card className="p-6 space-y-5">
          <h2 className="font-mono text-[10px] text-text-muted uppercase tracking-widest border-b border-border-subtle pb-3">
            Membership & Billing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Membership Plan *">
              <Select value={form.plan} onChange={(e) => setField('plan', e.target.value)}>
                <option value="Monthly">Monthly — 2,500 Birr/mo</option>
                <option value="Quarterly">Quarterly — 7,000 Birr/quarter</option>
                <option value="Annual">Annual — 25,000 Birr/year</option>
              </Select>
            </FormField>
            <FormField label="Start Date *">
              <Input required type="date" value={form.start_date} onChange={(e) => setField('start_date', e.target.value)} />
            </FormField>
            <FormField label="Assign Personal Trainer">
              <Select value={form.trainer_id} onChange={(e) => setField('trainer_id', e.target.value)}>
                <option value="">No Assigned Trainer</option>
                {trainers.filter(t => t.branch_id === form.branch_id).map((t) => (
                  <option key={t.id} value={t.id}>{t.first_name} {t.last_name} — {t.specialization}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Branch Location *">
              <Select value={form.branch_id} onChange={(e) => setField('branch_id', e.target.value)}>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </FormField>
            <FormField label="First Payment Amount (Birr) *">
              <Input required type="number" min="0" value={form.payment_amount} onChange={(e) => setField('payment_amount', e.target.value)} />
            </FormField>
            <FormField label="Payment Method *">
              <Input required value={form.payment_method} onChange={(e) => setField('payment_method', e.target.value)} list="payment_methods" />
              <datalist id="payment_methods">
                <option value="Card" />
                <option value="Cash" />
                <option value="Transfer" />
              </datalist>
            </FormField>
          </div>

          {/* Renewal preview */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 text-xs text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">info</span>
            Membership will renew until <strong className="ml-1">{previewRenewal}</strong>
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-6">
          <FormField label="Coach / Reception Notes">
            <Textarea rows={3} value={form.notes} onChange={(e) => setField('notes', e.target.value)} placeholder="Allergies, peak hours, specific goals…" />
          </FormField>
        </Card>

        {/* Form actions */}
        <div className="flex justify-end gap-3">
          <GhostButton type="button" onClick={() => navigate('/app/members')}>Cancel</GhostButton>
          <PrimaryButton type="submit">Submit Registration</PrimaryButton>
        </div>
      </form>
    </div>
  )
}
