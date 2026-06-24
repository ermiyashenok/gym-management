import { useStore } from '@/store/useStore'
import { getMemberStatus, statusClasses } from '@/utils/helpers'
import { Avatar, Card, GhostButton, PrimaryButton } from '@/components/ui'
import { clsx } from 'clsx'

export default function MemberDetailsDrawer({ member, onClose, onEdit, onRecordPayment }) {
  const trainers  = useStore((s) => s.trainers)
  const branches  = useStore((s) => s.branches)
  const payments  = useStore((s) => s.payments)
  const currentUser = useStore((s) => s.currentUser)
  const deleteMember = useStore((s) => s.deleteMember)

  if (!member) return null

  const status   = getMemberStatus(member.renewal_date)
  const trainer  = trainers.find((t) => t.id === member.trainer_id)
  const branch   = branches.find((b) => b.id === member.branch_id)
  const memberPayments = payments.filter((p) => p.member_id === member.id)

  const canEdit = currentUser?.role !== 'Manager' && currentUser?.role !== 'Trainer'

  const handleDelete = () => {
    if (window.confirm('Delete this member? All their data will be removed.')) {
      deleteMember(member.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer panel */}
      <div className="relative w-full max-w-lg bg-surface border-l border-border-subtle flex flex-col h-full shadow-2xl overflow-y-auto custom-scrollbar page-enter">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-subtle shrink-0">
          <span className="font-mono text-xs text-primary font-bold uppercase tracking-widest">{member.id}</span>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary hover:bg-white/5 rounded transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Profile */}
          <div className="text-center">
            <Avatar name={`${member.first_name} ${member.last_name}`} size="lg" className="mx-auto mb-4" />
            <h3 className="font-headline text-xl font-bold text-text-primary">
              {member.first_name} {member.last_name}
            </h3>
            <p className="text-text-muted text-xs mt-1">{member.email ?? 'No email registered'}</p>
            <div className="mt-3 flex justify-center">
              <span className={clsx('px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border', statusClasses(status))}>
                {status}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          {canEdit && (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { onRecordPayment(member); onClose() }}
                className="flex flex-col items-center p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary font-semibold transition-all"
              >
                <span className="material-symbols-outlined text-lg mb-1">payments</span>
                <span className="text-[10px]">Record Pay</span>
              </button>
              <button
                onClick={() => { onEdit(member) }}
                className="flex flex-col items-center p-3 rounded-xl bg-surface-container-high border border-border-subtle hover:bg-surface-variant text-text-primary font-semibold transition-all"
              >
                <span className="material-symbols-outlined text-lg mb-1">edit</span>
                <span className="text-[10px]">Edit Profile</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex flex-col items-center p-3 rounded-xl bg-danger-red/10 border border-danger-red/20 hover:bg-danger-red/20 text-danger-red font-semibold transition-all"
              >
                <span className="material-symbols-outlined text-lg mb-1">delete</span>
                <span className="text-[10px]">Delete</span>
              </button>
            </div>
          )}

          {/* Info fields */}
          <InfoSection title="Demographics">
            <InfoGrid>
              <InfoItem label="Phone"      value={member.phone} />
              <InfoItem label="Gender"     value={member.gender} />
              <InfoItem label="Date of Birth" value={member.dob ?? 'Unlisted'} />
              <InfoItem label="Branch"     value={branch?.name ?? 'Unknown'} />
            </InfoGrid>
          </InfoSection>

          <InfoSection title="Membership">
            <InfoGrid>
              <InfoItem label="Plan"         value={member.plan} />
              <InfoItem label="Trainer"      value={trainer ? `${trainer.first_name} ${trainer.last_name}` : 'No Coach'} />
              <InfoItem label="Enrolled"     value={member.join_date} />
              <InfoItem label="Renewal Date" value={member.renewal_date} highlighted={status !== 'Active'} />
            </InfoGrid>
          </InfoSection>

          {/* Notes */}
          <Card className="p-4">
            <p className="text-[9px] font-mono text-text-muted uppercase tracking-wider mb-2">Locker Notes</p>
            <p className="text-xs text-on-surface leading-relaxed">
              {member.notes || 'No special notes for this member.'}
            </p>
          </Card>

          {/* Payment history */}
          <div>
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-3">Payment History</p>
            {memberPayments.length === 0 ? (
              <p className="text-xs text-text-muted">No transactions registered.</p>
            ) : (
              <div className="space-y-2">
                {memberPayments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center bg-surface-container-low border border-border-subtle rounded-lg p-3 text-xs">
                    <div>
                      <span className="font-semibold text-text-primary block">{p.plan_label}</span>
                      <span className="text-[10px] text-text-muted">
                        {new Date(p.paid_at).toLocaleDateString()} · {p.method}
                      </span>
                    </div>
                    <span className="font-bold text-text-primary">Birr {p.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoSection({ title, children }) {
  return (
    <Card className="p-4 space-y-3">
      <p className="text-[9px] font-mono text-text-muted uppercase tracking-wider">{title}</p>
      {children}
    </Card>
  )
}

function InfoGrid({ children }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>
}

function InfoItem({ label, value, highlighted = false }) {
  return (
    <div>
      <p className="text-[9px] font-mono text-text-muted uppercase tracking-wider mb-0.5">{label}</p>
      <p className={clsx('text-xs font-semibold', highlighted ? 'text-danger-red' : 'text-text-primary')}>
        {value}
      </p>
    </div>
  )
}
