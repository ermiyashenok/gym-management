import { useStore } from '@/store/useStore'
import { notifIcon, notifColor } from '@/utils/helpers'
import { Card, PrimaryButton } from '@/components/ui'
import { clsx } from 'clsx'

export default function NotificationsPage() {
  const notifications   = useStore((s) => s.notifications)
  const currentBranch   = useStore((s) => s.currentBranch)
  const markNotifRead   = useStore((s) => s.markNotifRead)
  const markAllNotifsRead = useStore((s) => s.markAllNotifsRead)

  const filtered = notifications.filter(
    (n) => currentBranch === 'all' || n.branch_id === currentBranch
  )

  const unread = filtered.filter((n) => !n.is_read).length

  const TYPE_LABELS = {
    Overdue: { label: 'Overdue', bg: 'bg-danger-red/10 border-danger-red/20', text: 'text-danger-red' },
    Warning: { label: 'Expiring', bg: 'bg-warning-orange/10 border-warning-orange/20', text: 'text-warning-orange' },
    Success: { label: 'Success', bg: 'bg-success-emerald/10 border-success-emerald/20', text: 'text-success-emerald' },
    Info:    { label: 'Info', bg: 'bg-primary/10 border-primary/20', text: 'text-primary' },
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto page-enter">
      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-text-primary">System Notifications</h1>
          <p className="text-text-muted text-xs mt-1">
            {unread > 0 ? `${unread} unread alert${unread !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unread > 0 && (
          <PrimaryButton onClick={markAllNotifsRead} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">done_all</span>
            Mark All as Read
          </PrimaryButton>
        )}
      </div>

      {/* Notification list */}
      <Card className="overflow-hidden divide-y divide-border-subtle/50">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-text-muted block mb-3">notifications_off</span>
            <p className="text-text-muted text-sm">No notification alerts in the history log.</p>
          </div>
        ) : filtered.map((n) => {
          const meta = TYPE_LABELS[n.type] ?? TYPE_LABELS.Info
          return (
            <div
              key={n.id}
              className={clsx(
                'flex items-start gap-4 p-5 transition-colors hover:bg-white/[0.01]',
                !n.is_read && 'bg-primary/[0.03]'
              )}
            >
              {/* Icon */}
              <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border mt-0.5', meta.bg)}>
                <span className={clsx('material-symbols-outlined text-lg', meta.text)}>
                  {notifIcon(n.type)}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={clsx('text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border', meta.bg, meta.text)}>
                    {meta.label}
                  </span>
                  {!n.is_read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" title="Unread" />
                  )}
                </div>
                <p className="text-sm text-text-primary font-medium leading-relaxed">{n.message}</p>
                <p className="font-mono text-[10px] text-text-muted mt-1.5">
                  {new Date(n.created_at).toLocaleString([], {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Mark read button */}
              {!n.is_read && (
                <button
                  onClick={() => markNotifRead(n.id)}
                  className="shrink-0 px-3 py-1.5 text-[10px] font-mono font-bold text-primary border border-primary/20 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  Mark Read
                </button>
              )}
            </div>
          )
        })}
      </Card>
    </div>
  )
}
