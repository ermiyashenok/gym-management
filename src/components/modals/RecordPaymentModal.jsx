import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '@/store/useStore'
import { PLAN_PRICES } from '@/utils/helpers'
import { FormField, Input, Select, PrimaryButton, GhostButton } from '@/components/ui'

/**
 * member prop can be:
 *  - a member object (pre-fills member info)
 *  - 'select' (shows a dropdown to choose any member)
 *  - null (closed)
 */
export default function RecordPaymentModal({ member, onClose }) {
  const members       = useStore((s) => s.members)
  const recordPayment = useStore((s) => s.recordPayment)
  const currentUser   = useStore((s) => s.currentUser)

  const isSelectMode = member === 'select'

  const [selectedId,  setSelectedId]  = useState(isSelectMode ? '' : member?.id ?? '')
  const [amount,      setAmount]      = useState('99')
  const [method,      setMethod]      = useState('Card')
  const [duration,    setDuration]    = useState('Monthly')
  const [planLabel,   setPlanLabel]   = useState('Standard Monthly Renewal')

  const targetMember = members.find((m) => m.id === selectedId)

  // Auto-fill defaults when member changes
  useEffect(() => {
    if (!targetMember) return
    const plan = targetMember.plan ?? 'Monthly'
    setDuration(plan)
    setAmount(String(PLAN_PRICES[plan] ?? 99))
    setPlanLabel(`${plan} Membership Renewal`)
  }, [selectedId])

  // Update price / label when duration changes
  useEffect(() => {
    setAmount(String(PLAN_PRICES[duration] ?? 99))
    setPlanLabel(`${duration} Membership Renewal`)
  }, [duration])

  if (!member) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedId) return
    recordPayment({ member_id: selectedId, amount, method, plan_duration: duration, plan_label: planLabel })
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-surface border border-border-subtle rounded-xl p-6 shadow-2xl space-y-5 page-enter"
      >
        <div className="flex justify-between items-center border-b border-border-subtle pb-4">
          <h3 className="font-headline text-base font-bold text-text-primary">Record Transaction</h3>
          <button type="button" onClick={onClose} className="p-1 text-text-muted hover:text-text-primary hover:bg-white/5 rounded">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Member selector or preview */}
        {isSelectMode ? (
          <FormField label="Select Member *">
            <Select required value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              <option value="">Choose a member...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.first_name} {m.last_name} ({m.id})
                </option>
              ))}
            </Select>
          </FormField>
        ) : (
          <div className="bg-surface-container-low border border-border-subtle rounded-lg p-3 text-xs">
            <span className="text-text-muted uppercase font-mono block text-[9px] tracking-wider">Member Renewal</span>
            <span className="font-semibold text-text-primary block mt-1">
              {member.first_name} {member.last_name} ({member.id})
            </span>
            <span className="text-text-muted mt-0.5 block">Current expiry: {member.renewal_date}</span>
          </div>
        )}

        <FormField label="Plan Extension *">
          <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="Monthly">Add 1 Month</option>
            <option value="Quarterly">Add 3 Months</option>
            <option value="Annual">Add 1 Year</option>
          </Select>
        </FormField>

        <FormField label="Transaction Label *">
          <Input required value={planLabel} onChange={(e) => setPlanLabel(e.target.value)} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Amount Paid (Birr) *">
            <Input type="number" min="1" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          </FormField>
          <FormField label="Payment Method *">
            <Input required value={method} onChange={(e) => setMethod(e.target.value)} list="record_payment_methods" />
            <datalist id="record_payment_methods">
              <option value="Card" />
              <option value="Cash" />
              <option value="Transfer" />
            </datalist>
          </FormField>
        </div>

        <div className="flex justify-end gap-3 border-t border-border-subtle pt-4">
          <GhostButton type="button" onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton type="submit" disabled={!selectedId}>
            Record &amp; Renew
          </PrimaryButton>
        </div>
      </form>
    </div>,
    document.body
  )
}
