import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { clsx } from 'clsx'
import { Avatar } from '@/components/ui'

const ALL_NAV = [
  { to: '/app/dashboard',      label: 'Dashboard',    icon: 'dashboard',            roles: ['Manager', 'Staff'] },
  { to: '/app/owner-dashboard',label: 'Owner Hub',    icon: 'monitoring',           roles: ['Owner'] },
  { to: '/app/members',        label: 'Members',      icon: 'group',                roles: ['Manager', 'Staff', 'Trainer'] },
  { to: '/app/trainers',       label: 'Trainers',     icon: 'fitness_center',       roles: ['Manager', 'Staff', 'Trainer'] },
  { to: '/app/schedule',       label: 'Schedule',     icon: 'calendar_today',       roles: ['Manager', 'Staff', 'Trainer'] },
  { to: '/app/payments',       label: 'Payments',     icon: 'payments',             roles: ['SuperAdmin', 'Manager', 'Staff', 'Owner'] },
  { to: '/app/expenses',       label: 'Expenses',     icon: 'receipt_long',         roles: ['Manager', 'Staff', 'Owner'] },
  { to: '/app/amenities',      label: 'Amenities',    icon: 'local_mall',           roles: ['Staff', 'Owner'] },
  { to: '/app/notifications',  label: 'Notifications',icon: 'notifications',        roles: ['Manager', 'Staff', 'Trainer'], badge: true },
  { to: '/app/branches',       label: 'Branches',     icon: 'domain',               roles: ['SuperAdmin', 'Manager'] },
  { to: '/app/settings',       label: 'Settings',     icon: 'settings',             roles: ['SuperAdmin'] },
  { to: '/app/admin-portal',   label: 'Admin Portal', icon: 'admin_panel_settings', roles: ['SuperAdmin'] },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [openMenus, setOpenMenus] = useState({})
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSignOutModal, setShowSignOutModal] = useState(false)

  const currentUser    = useStore((s) => s.currentUser)
  const notifications  = useStore((s) => s.notifications)
  const logout         = useStore((s) => s.logout)
  const navigate       = useNavigate()
  const location       = useLocation()

  const role = currentUser?.role
  const visibleNav = ALL_NAV.filter((n) => n.roles.includes(role))

  const unread = notifications.filter((n) => !n.is_read).length

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <aside className={clsx(
      'flex flex-col h-screen py-5 bg-surface-container-low border-r border-border-subtle transition-all duration-300 shrink-0 relative z-50',
      collapsed ? 'w-[68px] px-2' : 'w-60 px-4'
    )}>
      {/* Brand */}
      <div className={clsx("flex items-center mb-8 px-1", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="material-symbols-outlined text-3xl text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <div className="page-enter">
              <p className="font-headline text-base font-bold text-primary leading-none">GYM-SYS</p>
              <p className="font-mono text-[9px] text-text-muted uppercase tracking-widest mt-0.5">Elite System</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-text-muted hover:text-primary transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-lg">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        {visibleNav.map((item) => {
          if (item.children) {
            const visibleChildren = item.children.filter(c => c.roles.includes(role))
            const isActiveParent = visibleChildren.some(c => location.pathname === c.to)
            const isOpen = openMenus[item.label] || isActiveParent
            
            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => {
                    if (collapsed) setCollapsed(false)
                    toggleMenu(item.label)
                  }}
                  className={clsx(
                    'w-full flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-all duration-150 group relative',
                    isActiveParent
                      ? 'text-primary bg-primary/5 border-l-[3px] border-primary pl-[calc(0.625rem-3px)]'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface-container-high border-l-[3px] border-transparent'
                  )}
                >
                  <span
                    className="material-symbols-outlined text-[22px] shrink-0"
                    style={isActiveParent ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="font-body text-sm truncate flex-1 text-left">{item.label}</span>
                  )}
                  {!collapsed && (
                    <span className="material-symbols-outlined text-sm shrink-0 transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                      expand_more
                    </span>
                  )}
                </button>
                {!collapsed && isOpen && (
                  <div className="pl-9 space-y-1 page-enter">
                    {visibleChildren.map(child => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) => clsx(
                          'flex items-center gap-2 rounded-lg px-2 py-2 transition-all duration-150',
                          isActive
                            ? 'text-primary bg-primary/10 font-medium'
                            : 'text-text-muted hover:text-text-primary hover:bg-surface-container-high'
                        )}
                      >
                        <span className="font-body text-xs truncate">{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-all duration-150 group relative',
                isActive
                  ? 'text-primary bg-primary/5 border-l-[3px] border-primary pl-[calc(0.625rem-3px)]'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-container-high border-l-[3px] border-transparent'
              )}
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined text-[22px] shrink-0"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="font-body text-sm truncate flex-1 text-left">{item.label}</span>
                  )}
                  {/* Badge */}
                  {item.badge && unread > 0 && (
                    <span className={clsx(
                      'ml-auto bg-danger-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none',
                      collapsed && 'absolute top-1 right-1'
                    )}>
                      {unread}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Profile card + logout */}
      <div className="border-t border-border-subtle pt-4 mt-4">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-1 mb-3 page-enter">
            <Avatar name={currentUser?.name} size="md" />
            <div className="overflow-hidden flex-1">
              <p className="font-body text-sm font-semibold text-text-primary truncate leading-none mb-1">
                {currentUser?.name}
              </p>
              <span className="inline-block bg-surface-container-highest text-primary font-mono text-[9px] px-1.5 py-0.5 rounded-full uppercase leading-none font-bold">
                {currentUser?.role}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-3">
            <Avatar name={currentUser?.name} size="sm" />
          </div>
        )}

        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full flex items-center gap-3 px-2.5 py-2 mb-1 rounded-lg text-text-muted hover:text-primary hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] shrink-0">key</span>
          {!collapsed && <span className="font-body text-sm">Change Password</span>}
        </button>

        <button
          onClick={() => setShowSignOutModal(true)}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-danger-red hover:bg-danger-red/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] shrink-0">logout</span>
          {!collapsed && <span className="font-body text-sm">Sign Out</span>}
        </button>
      </div>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

      {showSignOutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border-subtle p-6 rounded-xl w-full max-w-xs shadow-2xl relative text-center">
            <span className="material-symbols-outlined text-danger-red text-4xl mb-3">logout</span>
            <h2 className="font-headline text-lg font-bold mb-2">Are you sure?</h2>
            <p className="text-sm text-text-muted mb-6">Do you want to sign out of the system?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowSignOutModal(false)} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary border border-border-subtle rounded-lg">Cancel</button>
              <button onClick={handleLogout} className="px-4 py-2 text-sm bg-danger-red text-white font-bold rounded-lg hover:bg-danger-red/90 transition-all">Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

function ChangePasswordModal({ onClose }) {
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [error, setError] = useState('')
  const addToast = useStore((s) => s.addToast)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newPass !== confirmPass) {
      setError('Passwords do not match.')
      return
    }
    if (newPass.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    // In a real app we'd verify oldPass and update DB
    addToast('Success', 'Password updated successfully.')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border-subtle p-6 rounded-xl w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="font-headline text-lg font-bold mb-4 flex items-center gap-2">
           <span className="material-symbols-outlined text-primary">key</span>
           Change Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1.5">Current Password</label>
            <input type="password" required value={oldPass} onChange={(e) => setOldPass(e.target.value)} className="w-full bg-background border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1.5">New Password</label>
            <input type="password" required value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full bg-background border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1.5">Confirm New Password</label>
            <input type="password" required value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="w-full bg-background border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary" />
          </div>
          {error && <p className="text-xs text-danger-red">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all">Update</button>
          </div>
        </form>
      </div>
    </div>
  )
}
