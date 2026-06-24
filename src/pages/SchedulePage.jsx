import { useState, useMemo, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { DAYS_OF_WEEK, TIME_SLOTS, isSlotClosed } from '@/utils/helpers'
import { Card, Select } from '@/components/ui'
import ScheduleSessionModal from '@/components/modals/ScheduleSessionModal'
import { clsx } from 'clsx'

export default function SchedulePage() {
  const trainers       = useStore((s) => s.trainers)
  const members        = useStore((s) => s.members)
  const schedules      = useStore((s) => s.schedules)
  const branches       = useStore((s) => s.branches)
  const currentBranch  = useStore((s) => s.currentBranch)
  const currentUser    = useStore((s) => s.currentUser)
  const cancelSession  = useStore((s) => s.cancelSession)
  const addToast       = useStore((s) => s.addToast)

  const isTrainer = currentUser?.role === 'Trainer'
  const canEdit   = currentUser?.role !== 'Manager'

  // Trainers visible in this branch
  const branchTrainers = useMemo(() =>
    trainers.filter((t) => currentBranch === 'all' || t.branch_id === currentBranch),
    [trainers, currentBranch]
  )

  const defaultTrainerId = isTrainer
    ? currentUser.trainer_id
    : branchTrainers[0]?.id ?? ''

  const [selectedTrainerId, setSelectedTrainerId] = useState(defaultTrainerId)
  const [bookingSlot, setBookingSlot] = useState(null) // { trainer_id, day, time }

  // Keep selection valid when branch changes
  useEffect(() => {
    if (isTrainer) return
    if (!branchTrainers.find((t) => t.id === selectedTrainerId)) {
      setSelectedTrainerId(branchTrainers[0]?.id ?? '')
    }
  }, [branchTrainers, isTrainer])

  const selectedTrainer = trainers.find((t) => t.id === selectedTrainerId)
  const currentTrainerBranch = branches.find((b) => b.id === selectedTrainer?.branch_id)

  // Sessions for selected trainer
  const sessions = useMemo(() => {
    const sched = schedules.find((s) => s.trainer_id === selectedTrainerId)
    return sched?.sessions ?? []
  }, [schedules, selectedTrainerId])

  const getSession = (day, time) => {
    const s = sessions.find((s) => s.day === day && s.time === time)
    if (!s) return null
    return { ...s, member: members.find((m) => m.id === s.member_id) }
  }

  const handleCellClick = (day, time) => {
    if (!canEdit) {
      addToast('Warning', 'Managers have read-only access to the schedule.')
      return
    }
    setBookingSlot({ trainer_id: selectedTrainerId, day, time })
  }

  const handleCancel = (day, time) => {
    if (window.confirm('Cancel this scheduled session?')) {
      cancelSession(selectedTrainerId, day, time)
    }
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-text-primary">Trainer Timetable</h1>
          <p className="text-text-muted text-xs mt-1">Weekly schedule — click an empty slot to book a session.</p>
        </div>

        {/* Trainer selector */}
        {!isTrainer ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-bold">Trainer:</span>
            <Select
              className="w-auto text-xs font-semibold"
              value={selectedTrainerId}
              onChange={(e) => setSelectedTrainerId(e.target.value)}
            >
              {branchTrainers.map((t) => (
                <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
              ))}
            </Select>
          </div>
        ) : (
          <div className="px-4 py-2 bg-surface-container border border-border-subtle rounded-lg">
            <p className="text-[9px] text-text-muted uppercase font-mono tracking-wider">Your Schedule</p>
            <p className="text-sm font-bold text-primary">{currentUser.name}</p>
          </div>
        )}
      </div>

      {!selectedTrainer ? (
        <Card className="p-12 text-center text-text-muted text-sm">
          No trainers registered in this branch yet.
        </Card>
      ) : (
        <>
          {/* Trainer info bar */}
          <Card className="px-5 py-3 flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">
              {selectedTrainer.first_name[0]}{selectedTrainer.last_name[0]}
            </div>
            <div>
              <p className="font-body text-sm font-semibold text-text-primary">
                {selectedTrainer.first_name} {selectedTrainer.last_name}
              </p>
              <p className="text-[10px] text-text-muted">{selectedTrainer.specialization} · {selectedTrainer.experience_yrs} yrs exp</p>
            </div>
            <div className="ml-auto text-xs text-text-muted">
              <span className="font-semibold text-text-primary">{sessions.length}</span> sessions scheduled
            </div>
          </Card>

          {/* Timetable grid */}
          <Card className="overflow-x-auto custom-scrollbar p-0">
            <table className="w-full border-collapse" style={{ minWidth: '860px' }}>
              <thead>
                <tr>
                  <th className="p-3 border border-border-subtle/40 text-left font-mono text-[10px] text-text-muted uppercase w-28 bg-surface-container-low">
                    Time
                  </th>
                  {DAYS_OF_WEEK.map((day) => (
                    <th key={day} className="p-3 border border-border-subtle/40 text-center font-mono text-[10px] text-text-primary uppercase font-bold bg-surface-container-low">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot} className="hover:bg-white/[0.005]">
                    <td className="p-3 border border-border-subtle/40 font-mono text-xs text-text-muted font-medium bg-surface-container-low/50">
                      {slot}
                    </td>
                    {DAYS_OF_WEEK.map((_, dayIdx) => {
                      const session = getSession(dayIdx, slot)
                      const isClosed = isSlotClosed(slot, currentTrainerBranch)
                      return (
                        <td key={dayIdx} className="p-1.5 border border-border-subtle/40 align-top" style={{ minWidth: '120px' }}>
                          {session ? (
                            <div className="relative group p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-left cursor-default">
                              <p className="text-xs font-semibold text-text-primary leading-tight truncate">
                                {session.member?.first_name} {session.member?.last_name}
                              </p>
                              <p className="font-mono text-[9px] text-primary mt-0.5 truncate">
                                {session.member?.id}
                              </p>
                              {canEdit && (
                                <button
                                  onClick={() => handleCancel(dayIdx, slot)}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 text-danger-red hover:bg-danger-red/10 rounded transition-all"
                                  title="Cancel session"
                                >
                                  <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                              )}
                            </div>
                          ) : isClosed ? (
                            <div className="w-full h-12 border border-border-subtle/30 rounded-lg flex items-center justify-center font-mono text-[10px] text-text-muted/40 bg-surface-container-highest/20 cursor-not-allowed">
                              Closed
                            </div>
                          ) : (
                            <button
                              onClick={() => handleCellClick(dayIdx, slot)}
                              className={clsx(
                                'w-full h-12 border border-dashed border-border-subtle rounded-lg flex items-center justify-center gap-1',
                                'font-mono text-[10px] text-text-muted transition-all',
                                canEdit
                                  ? 'hover:border-primary/50 hover:text-primary hover:bg-primary/5 cursor-pointer'
                                  : 'cursor-not-allowed opacity-40'
                              )}
                            >
                              {canEdit && <span className="material-symbols-outlined text-sm">add</span>}
                              {canEdit ? 'Book' : 'Free'}
                            </button>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {/* Session booking modal */}
      <ScheduleSessionModal
        slot={bookingSlot}
        onClose={() => setBookingSlot(null)}
      />
    </div>
  )
}
