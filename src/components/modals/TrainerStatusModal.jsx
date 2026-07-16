import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { TODAY_STR } from '@/utils/helpers'
import { FormField, Input, Select, PrimaryButton, GhostButton } from '@/components/ui'

export default function TrainerStatusModal({ trainer, onClose }) {
  const updateTrainerStatus = useStore((s) => s.updateTrainerStatus)

  const [status, setStatus] = useState(trainer?.status ?? 'Active')
  const [durationPreset, setDurationPreset] = useState('1 Week')
  const [customDate, setCustomDate] = useState('')

  useEffect(() => {
    if (trainer) {
      setStatus(trainer.status ?? 'Active')
      if (trainer.status !== 'Active') {
        const dur = trainer.unavailable_duration ?? '1 Week'
        setDurationPreset(dur)
        if (dur === 'Custom Date' || !['1 Day', '3 Days', '1 Week', '2 Weeks', '1 Month', 'Indefinitely'].includes(dur)) {
          setDurationPreset('Custom Date')
          setCustomDate(trainer.unavailable_until ?? '')
        }
      }
    }
  }, [trainer])

  if (!trainer) return null

  // Calculate preview date based on duration select
  const getCalculatedDate = () => {
    if (durationPreset === 'Indefinitely') return null
    if (durationPreset === 'Custom Date') return customDate || null

    const base = new Date(TODAY_STR)
    if (durationPreset === '1 Day') base.setDate(base.getDate() + 1)
    else if (durationPreset === '3 Days') base.setDate(base.getDate() + 3)
    else if (durationPreset === '1 Week') base.setDate(base.getDate() + 7)
    else if (durationPreset === '2 Weeks') base.setDate(base.getDate() + 14)
    else if (durationPreset === '1 Month') base.setMonth(base.getMonth() + 1)

    return base.toISOString().split('T')[0]
  };

  const previewDate = getCalculatedDate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (status === 'Active') {
      updateTrainerStatus(trainer.id, 'Active', null, null)
    } else {
      const finalDuration = durationPreset === 'Custom Date' ? 'Custom Date' : durationPreset
      const finalUntil = finalDuration === 'Indefinitely' ? null : previewDate
      updateTrainerStatus(trainer.id, status, finalUntil, finalDuration)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-surface border border-border-subtle rounded-xl p-6 shadow-2xl space-y-5 page-enter"
      >
        <div className="flex justify-between items-center border-b border-border-subtle pb-4">
          <div className="space-y-0.5">
            <h3 className="font-headline text-base font-bold text-text-primary">Update Trainer Status</h3>
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
              {trainer.first_name} {trainer.last_name}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-text-muted hover:text-text-primary hover:bg-white/5 rounded">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Status Select */}
          <FormField label="Availability Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Active">Active (Available)</option>
              <option value="On Break">On Break (Temporary Away)</option>
              <option value="Offline">Offline (Unavailable)</option>
            </Select>
          </FormField>

          {/* Unavailability details */}
          {status !== 'Active' && (
            <>
              <FormField label="Unavailability Duration">
                <Select value={durationPreset} onChange={(e) => setDurationPreset(e.target.value)}>
                  <option value="1 Day">1 Day</option>
                  <option value="3 Days">3 Days</option>
                  <option value="1 Week">1 Week</option>
                  <option value="2 Weeks">2 Weeks</option>
                  <option value="1 Month">1 Month</option>
                  <option value="Indefinitely">Indefinitely</option>
                  <option value="Custom Date">Custom Date</option>
                </Select>
              </FormField>

              {durationPreset === 'Custom Date' && (
                <FormField label="Return Date *">
                  <Input
                    required
                    type="date"
                    min={TODAY_STR}
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                  />
                </FormField>
              )}

              {/* Status Preview Bar */}
              <div className="bg-surface-container-low border border-border-subtle rounded-lg px-4 py-3 text-xs space-y-1">
                <span className="text-text-muted font-mono uppercase block text-[9px] tracking-wider">Status Summary</span>
                <div className="flex items-center gap-2 font-semibold text-text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning-orange animate-pulse" />
                  Trainer will be <strong className="text-warning-orange">{status}</strong>
                  {durationPreset === 'Indefinitely' ? (
                    ' indefinitely.'
                  ) : (
                    <>
                      {' '}until <strong>{previewDate || '—'}</strong>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 border-t border-border-subtle pt-4">
          <GhostButton type="button" onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton type="submit">Save Status</PrimaryButton>
        </div>
      </form>
    </div>
  )
}
