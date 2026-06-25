import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-headline text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              GYM-SYS
            </span>
            <div className="hidden md:flex gap-6">
              {['Features', 'Pricing', 'Solutions'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-text-muted hover:text-primary transition-colors font-mono text-xs">
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin-login')} className="px-4 py-2 text-on-surface font-mono text-xs hover:text-primary transition-colors font-bold">Admin Login</button>
            <button onClick={() => navigate('/login')} className="px-5 py-2 bg-primary text-on-primary font-mono text-xs rounded-lg hover:opacity-90 active:scale-95 transition-all font-bold">Gym Login</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative pt-32 pb-20 hero-gradient overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary pulse-dot" />
              <span className="text-primary font-mono text-[10px] uppercase tracking-wider">The Professional Choice</span>
            </div>

            <h1 className="font-headline text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-text-primary">
              Elevate Your <br />
              <span className="text-primary">Gym Management</span>
            </h1>

            <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
              A surgical-grade platform for elite fitness facilities. Streamline memberships, billing, trainers and multi-branch operations with precision.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-primary text-on-primary font-mono font-bold rounded-lg shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.97] transition-all"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-surface border border-border-subtle text-on-surface font-mono font-bold rounded-lg hover:bg-surface-container-high transition-all"
              >
                Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {[""].map((init, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {init}
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Dashboard mockup preview */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-container rounded-xl blur opacity-15 group-hover:opacity-25 transition duration-1000" />
            <div className="relative bg-surface border border-border-subtle rounded-xl p-5 shadow-2xl">
              {/* Fake window chrome */}
              <div className="flex items-center gap-1.5 mb-5 border-b border-border-subtle pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-danger-red" />
                <span className="w-2.5 h-2.5 rounded-full bg-warning-orange" />
                <span className="w-2.5 h-2.5 rounded-full bg-success-emerald" />
                <span className="ml-auto font-mono text-[9px] text-text-muted">GF-DOWNTOWN-PORTAL</span>
              </div>
              {/* Fake KPIs */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[{ l: 'Members', v: '1,240', c: 'text-text-primary' }, { l: 'Active', v: '980', c: 'text-success-emerald' }, { l: 'Revenue', v: 'Birr 42.8k', c: 'text-primary' }].map((kpi) => (
                  <div key={kpi.l} className="bg-surface-container-low rounded-lg p-3 border border-border-subtle">
                    <span className="font-mono text-[9px] text-text-muted block">{kpi.l}</span>
                    <span className={`font-headline text-lg font-bold ${kpi.c}`}>{kpi.v}</span>
                  </div>
                ))}
              </div>
              {/* Fake bar chart */}
              <div className="h-28 bg-surface-container-low rounded-lg border border-border-subtle p-3 flex items-end gap-2">
                {[40, 60, 85, 55, 70, 100].map((h, i) => (
                  <div
                    key={i}
                    className={`rounded-sm flex-1 transition-all ${i === 5 ? 'bg-primary' : 'bg-surface-container-highest'}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-headline text-4xl font-bold mb-4 text-text-primary">Precision Engineered Features</h2>
            <p className="text-text-muted">The most comprehensive toolkit for modern fitness businesses.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-card bg-surface p-8 rounded-xl hover:bg-surface-container-high transition-colors group">
                <div className={`w-12 h-12 ${f.iconBg} rounded-lg flex items-center justify-center mb-5 group-hover:${f.hoverBg} transition-colors`}>
                  <span className={`material-symbols-outlined ${f.iconColor} group-hover:${f.hoverColor}`}>{f.icon}</span>
                </div>
                <h3 className="font-headline text-xl font-bold mb-3 text-text-primary">{f.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-headline text-4xl font-bold mb-4 text-text-primary">Transform Your Workflow</h2>
            <p className="text-text-muted">Designed specifically to eliminate administrative bottlenecks and accelerate gym growth.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                { title: 'Centralized Multi-Gym Management', desc: 'Manage multiple physical locations from a single dashboard. System Admins can instantly deploy new gyms and assign local managers, ensuring secure data isolation per facility.' },
                { title: 'Zero-Friction Renewals', desc: 'Automated status tracking instantly flags expiring and overdue memberships, while the built-in Point of Sale handles membership fees and amenity sales.' },
                { title: 'Empowered Trainers', desc: 'No more overlapping schedules. Trainers manage their own calendars, while managers oversee stipends and attendance seamlessly.' }
              ].map((benefit, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-headline text-lg font-bold text-text-primary mb-1">{benefit.title}</h3>
                    <p className="text-sm text-text-muted leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative p-6 bg-surface-container-low border border-border-subtle rounded-2xl shadow-xl">
              <div className="aspect-[4/3] rounded-lg border border-border-subtle bg-background flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                <span className="material-symbols-outlined text-6xl text-primary/40">query_stats</span>
                <div className="absolute bottom-4 left-4 right-4 h-24 bg-surface rounded shadow border border-border-subtle p-3 flex gap-2 items-end">
                  {[30, 45, 60, 50, 75, 90, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/80 rounded-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-border-subtle py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
          <span className="font-headline font-bold text-primary text-base">GYM-SYS</span>
          <span>© 2026 GYM-SYS. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

const FEATURES = [
  { title: 'Member Management', icon: 'group', iconBg: 'bg-primary/10', iconColor: 'text-primary', hoverBg: 'bg-primary', hoverColor: 'text-on-primary', desc: 'Track the full member lifecycle — enrollment, renewals, attendance, and health profiles with real-time status flags.' },
  { title: 'Automated Billing', icon: 'payments', iconBg: 'bg-tertiary/10', iconColor: 'text-tertiary', hoverBg: 'bg-tertiary', hoverColor: 'text-on-tertiary', desc: 'Record payments in seconds, auto-extend memberships, generate print-ready receipts and trigger dunning alerts.' },
  { title: 'Trainer Timetable', icon: 'calendar_today', iconBg: 'bg-primary/10', iconColor: 'text-primary', hoverBg: 'bg-primary', hoverColor: 'text-on-primary', desc: 'Schedule weekly training slots on an interactive calendar per trainer and assign members with one click.' },
]

