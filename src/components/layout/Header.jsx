import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { notifIcon, notifColor } from '@/utils/helpers'
import { clsx } from 'clsx'

export default function Header() {
  const currentUser      = useStore((s) => s.currentUser)
  const currentBranch    = useStore((s) => s.currentBranch)
  const setCurrentBranch = useStore((s) => s.setCurrentBranch)
  const branches         = useStore((s) => s.branches)
  const notifications    = useStore((s) => s.notifications)
  const markNotifRead    = useStore((s) => s.markNotifRead)
  const markAllNotifsRead = useStore((s) => s.markAllNotifsRead)
  const addToast         = useStore((s) => s.addToast)

  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)
  const navigate = useNavigate()

  // Branch-filtered notifications
  const branchNotifs = notifications.filter(
    (n) => currentBranch === 'all' || n.branch_id === currentBranch
  )
  const unread = branchNotifs.filter((n) => !n.is_read).length

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const branchName = currentBranch === 'all'
    ? 'All Branches'
    : branches.find((b) => b.id === currentBranch)?.name ?? 'Unknown Branch'

  return (
    <header className="flex items-center justify-between h-16 px-6 md:px-8 bg-background border-b border-border-subtle shrink-0 z-40 relative">
      {/* Left — branch badge / selector */}
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          storefront
        </span>
        {currentUser?.role === 'SuperAdmin' ? (
          <select
            value={currentBranch}
            onChange={(e) => {
              setCurrentBranch(e.target.value)
              addToast('Info', `Workspace switched to ${e.target.value === 'all' ? 'All Branches' : branches.find((b) => b.id === e.target.value)?.name}`)
            }}
            className="bg-transparent border-none text-xs font-bold text-primary focus:ring-0 focus:outline-none cursor-pointer"
          >
            <option value="all">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        ) : (
          <span className="text-xs font-bold text-primary">{branchName}</span>
        )}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3">
        {/* Quick payment button */}
        {(currentUser?.role === 'SuperAdmin' || currentUser?.role === 'Staff') && (
          <button
            onClick={() => navigate('/app/payments')}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-all"
          >
            <span className="material-symbols-outlined text-sm">payments</span>
            Record Payment
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={() => document.documentElement.classList.toggle('dark')}
          className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
          title="Toggle Theme"
        >
          <span className="material-symbols-outlined text-2xl">contrast</span>
        </button>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-red rounded-full" />
            )}
          </button>

          {/* Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface border border-border-subtle rounded-xl shadow-2xl z-50 overflow-hidden page-enter">
              <div className="flex justify-between items-center px-4 py-3 border-b border-border-subtle bg-surface-container-low">
                <span className="font-headline text-sm font-bold">Notifications</span>
                {unread > 0 && (
                  <button
                    onClick={() => { markAllNotifsRead(); setNotifOpen(false) }}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-border-subtle/50">
                {branchNotifs.length === 0 ? (
                  <p className="text-center text-text-muted text-xs py-8">No notifications.</p>
                ) : branchNotifs.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    className={clsx('p-3.5 flex gap-3 hover:bg-white/5 transition-colors', !n.is_read && 'bg-primary/5')}
                  >
                    <span className={clsx('material-symbols-outlined text-lg shrink-0 mt-0.5', notifColor(n.type))}>
                      {notifIcon(n.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-primary font-medium leading-normal">{n.message}</p>
                      <p className="text-[9px] text-text-muted mt-1">
                        {new Date(n.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    {!n.is_read && (
                      <button onClick={() => markNotifRead(n.id)} title="Mark read" className="self-center">
                        <span className="material-symbols-outlined text-sm text-primary">done</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-border-subtle bg-surface-container-low text-center">
                <button
                  onClick={() => { navigate('/app/notifications'); setNotifOpen(false) }}
                  className="w-full py-2.5 text-xs text-primary font-bold hover:underline"
                >
                  View all alerts →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-border-subtle" />
        <span className="text-xs text-text-muted font-medium hidden sm:block">{currentUser?.name}</span>
      </div>
    </header>
  )
}
