import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { Input, PrimaryButton } from '@/components/ui'

export default function LoginPage() {
  const navigate  = useNavigate()
  const login     = useStore((s) => s.login)
  const addToast  = useStore((s) => s.addToast)

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.role === 'SuperAdmin') {
        navigate('/app/admin-portal')
      } else if (user.role === 'Trainer') {
        navigate('/app/schedule')
      } else if (user.role === 'Owner') {
        navigate('/app/owner-dashboard')
      } else {
        navigate('/app/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.')
      addToast('Error', 'Login failed — invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  // Seeded accounts for quick testing — passwords match seed.sql
  const presets = [
    { name: 'Alex Rivera',   email: 'manager@gym-sys.com',  password: '123', role: 'Manager'    },
    { name: 'Maria Santos',  email: 'staff@gym-sys.com',    password: '123', role: 'Staff'      },
    { name: 'David Chen',    email: 'trainer@gym-sys.com',  password: '123', role: 'Trainer'    },
    { name: 'Owner One',     email: 'owner@gym-sys.com',    password: '123', role: 'Owner'      },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
      {/* Back to landing */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm"
      >
        <span className="material-symbols-outlined text-xl">arrow_back</span>
        Back to site
      </button>

      <div className="w-full max-w-md bg-surface border border-border-subtle rounded-xl p-8 shadow-2xl">
        {/* Brand */}
        <div className="text-center mb-8">
          <span className="font-headline text-3xl font-bold text-primary flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            GYM-SYS
          </span>
          <p className="text-text-muted text-sm mt-2">
            Enter credentials to access your gym's management portal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1.5">Email Address</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gym-sys.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Password</label>
            </div>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-danger-red bg-danger-red/10 border border-danger-red/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          <PrimaryButton type="submit" className="w-full py-3 text-sm" disabled={loading}>
            {loading ? 'Authenticating…' : 'Authenticate'}
          </PrimaryButton>
        </form>

        {/* Testing presets */}
        <div className="mt-8 border-t border-border-subtle pt-6">
          <p className="text-center text-[10px] font-mono text-text-muted uppercase tracking-wider mb-3">
            Quick Login — Testing Profiles
          </p>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((user) => (
              <button
                key={user.email}
                type="button"
                onClick={() => { setEmail(user.email); setPassword(user.password); setError('') }}
                className="p-3 text-left bg-surface-container-low border border-border-subtle rounded-lg hover:bg-surface-container-high hover:border-outline transition-all"
              >
                <span className="block text-xs font-bold text-text-primary leading-tight">{user.name}</span>
                <span className="block text-[10px] text-primary mt-0.5">{user.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
