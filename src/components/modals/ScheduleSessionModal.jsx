import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { DAYS_OF_WEEK } from '@/utils/helpers'
import { FormField, Select, PrimaryButton, GhostButton } from '@/components/ui'

/**
 * slot = { trainer_id, day (0-6), time }
 */
export default function ScheduleSessionModal({ slot, onClose }) {
  const members         = useStore((s) => s.members)
  const scheduleSession = useStore((s) => s.scheduleSession)

  const [memberId, setMemberId] = useState('')

  if (!slot) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!memberId) return
    scheduleSession(slot.trainer_id, slot.day, slot.time, memberId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm bg-surface border border-border-subtle rounded-xl p-6 shadow-2xl space-y-5 page-enter"
      >
        <div className="flex justify-between items-center border-b border-border-subtle pb-4">
          <h3 className="font-headline text-base font-bold text-text-primary">Book Workout Slot</h3>
          <button type="button" onClick={onClose} className="p-1 text-text-muted hover:text-text-primary hover:bg-white/5 rounded">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Slot info */}
        <div className="bg-surface-container-low border border-border-subtle rounded-lg p-3 text-xs space-y-1">
          <span className="text-text-muted font-mono uppercase block text-[9px] tracking-wider">Selected Slot</span>
          <span className="font-bold text-text-primary text-sm block">
            {DAYS_OF_WEEK[slot.day]}, {slot.time}
          </span>
        </div>

        <FormField label="Assign Member *">
          <Select required value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            <option value="">Choose a member...</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.first_name} {m.last_name} ({m.id})
              </option>
            ))}
          </Select>
        </FormField>

        <div className="flex justify-end gap-3 border-t border-border-subtle pt-4">
          <GhostButton type="button" onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton type="submit" disabled={!memberId}>
            Confirm Booking
          </PrimaryButton>
        </div>
      </form>
    </div>
  )
}
