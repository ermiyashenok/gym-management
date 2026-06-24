import { useStore } from '@/store/useStore'
import { notifIcon, notifColor } from '@/utils/helpers'
import { clsx } from 'clsx'

export default function ToastContainer() {
  const toasts      = useStore((s) => s.toasts)
  const dismissToast = useStore((s) => s.dismissToast)

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'toast-enter pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md',
            toast.type === 'Success' ? 'bg-success-emerald/10 border-success-emerald/20 text-success-emerald' :
            toast.type === 'Warning' ? 'bg-warning-orange/10  border-warning-orange/20  text-warning-orange'  :
            toast.type === 'Error'   ? 'bg-danger-red/10      border-danger-red/20      text-danger-red'       :
                                       'bg-surface            border-border-subtle      text-primary'
          )}
        >
          <span className="material-symbols-outlined text-lg shrink-0">
            {notifIcon(toast.type)}
          </span>
          <span className="font-body text-sm flex-1">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="ml-2 opacity-60 hover:opacity-100 shrink-0"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      ))}
    </div>
  )
}
