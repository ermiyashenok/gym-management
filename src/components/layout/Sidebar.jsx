import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { clsx } from 'clsx'
import { Avatar } from '@/components/ui'

const ALL_NAV = [
  { to: '/app/dashboard',    label: 'Dashboard',    icon: 'dashboard',          roles: ['SuperAdmin', 'Manager', 'Staff'] },
  { to: '/app/members', label: 'Members', icon: 'group', roles: ['SuperAdmin', 'Manager', 'Staff', 'Trainer'] },
  { to: '/app/trainers', label: 'Trainers', icon: 'fitness_center', roles: ['SuperAdmin', 'Manager', 'Staff'] },
  { to: '/app/schedule',     label: 'Schedule',     icon: 'calendar_today',     roles: ['SuperAdmin', 'Manager', 'Staff', 'Trainer'] },
  { to: '/app/payments',     label: 'Payments',     icon: 'payments',           roles: ['SuperAdmin', 'Manager', 'Staff'] },
  { to: '/app/amenities',    label: 'Amenities',    icon: 'local_mall',         roles: ['SuperAdmin', 'Staff'] },
  { to: '/app/notifications',label: 'Notifications',icon: 'notifications',      roles: ['SuperAdmin', 'Manager', 'Staff', 'Trainer'], badge: true },
  { to: '/app/branches',     label: 'Branches',     icon: 'domain',             roles: ['SuperAdmin'] },
  { to: '/app/settings',     label: 'Settings',     icon: 'settings',           roles: ['SuperAdmin'] },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [openMenus, setOpenMenus] = useState({})

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
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="material-symbols-outlined text-3xl text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          {!collapsed && (
            <div className="page-enter">
              <p className="font-headline text-base font-bold text-primary leading-none">GymFlow Pro</p>
              <p className="font-mono text-[9px] text-text-muted uppercase tracking-widest mt-0.5">Elite System</p>
            </div>
          )}
        </div>
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
          onClick={() => {
            const newPass = window.prompt('Enter new password:')
            if (newPass) useStore.getState().addToast('Success', 'Password updated successfully.')
          }}
          className="w-full flex items-center gap-3 px-2.5 py-2 mb-1 rounded-lg text-text-muted hover:text-primary hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] shrink-0">key</span>
          {!collapsed && <span className="font-body text-sm">Change Password</span>}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-danger-red hover:bg-danger-red/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] shrink-0">logout</span>
          {!collapsed && <span className="font-body text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
