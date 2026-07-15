import { useStore } from '@/store/useStore'
import { Card, PrimaryButton } from '@/components/ui'
import { clsx } from 'clsx'

export default function SettingsPage() {
  const currentUser            = useStore((s) => s.currentUser)
  const runStatusRecalculation = useStore((s) => s.runStatusRecalculation)
  const actionLogs             = useStore((s) => s.actionLogs)
  const undoAction             = useStore((s) => s.undoAction)
  const addToast               = useStore((s) => s.addToast)

  return (
    <div className="space-y-6 max-w-2xl mx-auto page-enter">
      <div>
        <h1 className="font-headline text-2xl font-bold text-text-primary">System Settings</h1>
        <p className="text-text-muted text-xs mt-1">Configure automation, webhooks, and preferences.</p>
      </div>

      {/* Current session */}
      <Card className="p-5">
        <SectionHeader icon="person" title="Active Session" />
        <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
          <InfoRow label="Name"   value={currentUser?.name} />
          <InfoRow label="Role"   value={currentUser?.role} />
          <InfoRow label="Email"  value={currentUser?.email ?? '—'} />
          <InfoRow label="Branch" value={currentUser?.branch_id ?? 'All Branches'} />
        </div>
      </Card>

      {/* Cron / automation */}
      <Card className="p-5">
        <SectionHeader icon="event_repeat" title="Automated Status Checks" />
        <p className="text-text-muted text-xs mt-2 mb-4">
          Simulates the nightly cron job that recalculates membership statuses (Active / Expiring / Overdue) and generates system alerts for at-risk members.
        </p>
        <div className="bg-background border border-border-subtle rounded-lg p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-text-primary">Daily Expiry Reconciliation</p>
            <p className="text-[10px] text-text-muted mt-0.5">Triggers status recalculation for all members and pushes new notifications.</p>
          </div>
          <PrimaryButton onClick={runStatusRecalculation} className="shrink-0 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">play_arrow</span>
            Run Now
          </PrimaryButton>
        </div>
      </Card>

      {/* Logs / Undo */}
      <Card className="p-5">
        <SectionHeader icon="history" title="Action Logs & Undo" />
        <p className="text-text-muted text-xs mt-2 mb-4">
          Review recent system actions and undo mistakes. Undoing an action restores the data to exactly how it was before the action occurred.
        </p>
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
          {(!actionLogs || actionLogs.length === 0) ? (
            <p className="text-xs text-text-muted text-center py-4">No recent actions logged.</p>
          ) : actionLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between gap-4 p-3 bg-background border border-border-subtle rounded-lg">
              <div>
                <p className="text-sm font-semibold text-text-primary">{log.description}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
              <button
                onClick={() => undoAction(log.id)}
                className="shrink-0 px-3 py-1.5 bg-danger-red/10 border border-danger-red/20 text-danger-red text-xs font-bold rounded-lg hover:bg-danger-red/20 transition-colors"
              >
                Undo
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function SectionHeader({ icon, title, iconColor = 'text-primary' }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border-subtle pb-3">
      <span className={clsx('material-symbols-outlined text-xl', iconColor)}>{icon}</span>
      <h3 className="font-headline text-sm font-bold text-text-primary">{title}</h3>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="font-mono text-[9px] text-text-muted uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-text-primary">{value}</p>
    </div>
  )
}
