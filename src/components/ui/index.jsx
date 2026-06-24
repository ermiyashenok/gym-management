import { clsx } from 'clsx'
import { statusClasses } from '@/utils/helpers'

/** Generic status pill badge */
export function StatusBadge({ status }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
      statusClasses(status)
    )}>
      <span className={clsx(
        'w-1.5 h-1.5 rounded-full',
        status === 'Active'   ? 'bg-success-emerald' :
        status === 'Expiring' ? 'bg-warning-orange' :
        status === 'Overdue'  ? 'bg-danger-red' :
        status === 'On Break' ? 'bg-warning-orange' : 'bg-on-surface-variant'
      )} />
      {status}
    </span>
  )
}

/** Section card wrapper */
export function Card({ className = '', children }) {
  return (
    <div className={clsx('bg-surface border border-border-subtle rounded-xl', className)}>
      {children}
    </div>
  )
}

/** Labelled input */
export function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

/** Dark-mode styled input */
export function Input({ className = '', ...props }) {
  return (
    <input
      className={clsx(
        'w-full bg-background border border-border-subtle rounded-lg px-3 py-2 text-sm text-on-surface',
        'placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all',
        className
      )}
      {...props}
    />
  )
}

/** Dark-mode styled select */
export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={clsx(
        'w-full bg-background border border-border-subtle rounded-lg px-3 py-2 text-sm text-on-surface',
        'focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

/** Dark-mode styled textarea */
export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={clsx(
        'w-full bg-background border border-border-subtle rounded-lg px-3 py-2 text-sm text-on-surface',
        'placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all',
        className
      )}
      {...props}
    />
  )
}

/** Primary action button */
export function PrimaryButton({ className = '', children, ...props }) {
  return (
    <button
      className={clsx(
        'px-5 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold',
        'hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/** Ghost / outline button */
export function GhostButton({ className = '', children, ...props }) {
  return (
    <button
      className={clsx(
        'px-4 py-2 border border-border-subtle rounded-lg text-xs font-semibold text-on-surface',
        'hover:bg-surface-container-high transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/** Icon button (circle) */
export function IconButton({ icon, className = '', ...props }) {
  return (
    <button
      className={clsx(
        'p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors',
        className
      )}
      {...props}
    >
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </button>
  )
}

/** Avatar initials circle */
export function Avatar({ name, size = 'md', className = '' }) {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '??'

  const sizeCls = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs'
  return (
    <div className={clsx(
      'rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0',
      sizeCls, className
    )}>
      {initials}
    </div>
  )
}

/** Metric card used on Dashboard */
export function MetricCard({ icon, label, value, color = 'primary' }) {
  const colorMap = {
    primary:  { bg: 'bg-primary/10',        text: 'text-primary',        val: 'text-text-primary' },
    success:  { bg: 'bg-success-emerald/10', text: 'text-success-emerald', val: 'text-success-emerald' },
    warning:  { bg: 'bg-warning-orange/10',  text: 'text-warning-orange',  val: 'text-warning-orange'  },
    danger:   { bg: 'bg-danger-red/10',      text: 'text-danger-red',      val: 'text-danger-red'      },
  }
  const c = colorMap[color] ?? colorMap.primary
  return (
    <Card className="p-5">
      <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center mb-3', c.bg)}>
        <span className={clsx('material-symbols-outlined', c.text)}>{icon}</span>
      </div>
      <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">{label}</p>
      <h3 className={clsx('font-headline text-2xl mt-1 font-bold', c.val)}>{value}</h3>
    </Card>
  )
}

/** Search input with leading icon */
export function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={clsx('relative', className)}>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg pointer-events-none">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-background border border-border-subtle rounded-lg pl-10 pr-4 py-2 text-xs text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
      />
    </div>
  )
}
