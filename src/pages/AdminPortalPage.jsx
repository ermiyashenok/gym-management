import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { Card, PrimaryButton, FormField, Input, Select, GhostButton } from '@/components/ui'

export default function AdminPortalPage() {
  const navigate = useNavigate()
  const gyms = useStore((s) => s.gyms)
  const branches = useStore((s) => s.branches)
  const systemUsers = useStore((s) => s.systemUsers)
  const addSystemUser = useStore((s) => s.addSystemUser)
  const setCurrentBranch = useStore((s) => s.setCurrentBranch)
  const deleteGym = useStore((s) => s.deleteGym)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'Manager', branch_id: branches[0]?.id || '' })

  const handleCreateUser = (e) => {
    e.preventDefault()
    addSystemUser({ ...userForm, trainer_id: null }) // simplified for now
    setUserForm({ name: '', email: '', password: '', role: 'Manager', branch_id: branches[0]?.id || '' })
    setIsAddingUser(false)
  }

  const selectBranch = (id) => {
    setCurrentBranch(id)
    navigate('/app/dashboard')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 page-enter p-6">
      <div className="flex justify-between items-end border-b border-border-subtle pb-4">
        <div>
          <h1 className="font-headline text-3xl font-bold text-text-primary">System Administrator Dashboard</h1>
          <p className="text-text-muted mt-1">Manage physical gym locations, branches, and system actors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card className="p-5">
           <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Total Gyms</p>
           <p className="font-headline text-2xl font-bold text-text-primary mt-1">{gyms?.length || 0}</p>
         </Card>
         <Card className="p-5">
           <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Total Branches</p>
           <p className="font-headline text-2xl font-bold text-text-primary mt-1">{branches.length}</p>
         </Card>
         <Card className="p-5">
           <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Total Accounts</p>
           <p className="font-headline text-2xl font-bold text-text-primary mt-1">{systemUsers.length}</p>
         </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Gyms & Branches List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-lg border border-border-subtle">
            <h2 className="font-headline text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">domain</span>
              Gyms & Branches
            </h2>
          </div>

          <div className="grid gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {(gyms || []).map(g => {
              const gymBranches = branches.filter(b => b.gym_id === g.id || (g.id === 'g1' && !b.gym_id))
              return (
                <Card key={g.id} className="p-4 border border-border-subtle bg-surface-container-low overflow-hidden">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-text-primary text-lg">{g.name}</h3>
                    <div className="flex gap-2">
                      <GhostButton onClick={() => navigate('/app/branches')} className="text-xs py-1 px-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">add</span> Add Branch
                      </GhostButton>
                      <button onClick={() => { if(window.confirm('Delete this gym completely?')) deleteGym(g.id); }} className="text-danger-red hover:bg-danger-red/10 px-2 py-1 rounded transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 pl-4 border-l-2 border-border-subtle">
                    {gymBranches.length === 0 ? (
                      <p className="text-xs text-text-muted italic">No branches under this gym.</p>
                    ) : gymBranches.map(b => (
                      <div key={b.id} onClick={() => selectBranch(b.id)} className="p-2 bg-surface hover:border-primary border border-transparent rounded cursor-pointer transition-colors group flex justify-between items-center">
                        <div>
                          <p className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors">{b.name}</p>
                          <p className="text-[10px] text-text-muted">{b.address || 'No address provided'}</p>
                        </div>
                        <span className="material-symbols-outlined text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* System Actors List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-lg border border-border-subtle">
            <h2 className="font-headline text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">manage_accounts</span>
              System Actors
            </h2>
            <PrimaryButton onClick={() => setIsAddingUser(!isAddingUser)} className="text-xs py-1.5 px-3">
              {isAddingUser ? 'Cancel' : '+ New Account'}
            </PrimaryButton>
          </div>

          {isAddingUser && (
            <Card className="p-4 bg-surface-container-lowest border-primary/30">
              <form onSubmit={handleCreateUser} className="space-y-3">
                <FormField label="Full Name *"><Input required value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} /></FormField>
                <FormField label="Username / Email *"><Input type="email" required value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} /></FormField>
                <FormField label="Password *"><Input type="text" required value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} /></FormField>
                <FormField label="Role *">
                  <Select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                    <option value="Trainer">Trainer</option>
                    <option value="SuperAdmin">SuperAdmin</option>
                  </Select>
                </FormField>
                {userForm.role !== 'SuperAdmin' && (
                  <FormField label="Assign to Branch *">
                    <Select value={userForm.branch_id} onChange={e => setUserForm({...userForm, branch_id: e.target.value})}>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </Select>
                  </FormField>
                )}
                <PrimaryButton type="submit" className="w-full text-xs">Create Actor Account</PrimaryButton>
              </form>
            </Card>
          )}

          <div className="grid gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {systemUsers.map(u => {
              const branch = branches.find(b => b.id === u.branch_id)
              return (
                <Card key={u.email} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-text-primary">{u.name}</h3>
                      <p className="text-[10px] text-text-muted">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-0.5">{u.role}</span>
                    <span className="block text-[10px] text-text-muted truncate max-w-[120px]">{branch ? branch.name : 'System-Wide Admin'}</span>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
