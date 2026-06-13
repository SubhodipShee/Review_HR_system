import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, Eye, EyeOff, LogIn, Search, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, USERS } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  const filteredUsers = (USERS || []).filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole =
      filterRole === 'all' ||
      (filterRole === 'manager' && u.role === 'manager') ||
      (filterRole === 'employee' && u.role === 'employee')

    return matchesSearch && matchesRole
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your email and password')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 400)) // simulate network
    const result = login(email.trim(), password)
    setLoading(false)
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}!`)
      navigate(result.user.role === 'manager' ? '/manager' : '/employee')
    } else {
      toast.error(result.message || 'Invalid credentials')
    }
  }

  const fillDemo = ({ email, password }) => {
    setEmail(email)
    setPassword(password)
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 lg:sticky lg:top-0 lg:h-screen bg-[#070B19] flex-col justify-between p-12 relative border-r border-slate-900">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-primary-400 font-extrabold text-2xl tracking-wide">Crystal People</span>
            <span className="text-white/40 text-xs font-bold tracking-wider uppercase ml-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg">Lite</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center my-auto">
          {/* Logo container matching reference */}
          <div className="bg-white p-8 rounded-none w-64 h-64 flex flex-col items-center justify-center shadow-lg border border-slate-800">
            {/* Chevron Shapes */}
            <svg className="w-24 h-16 text-black" viewBox="0 0 100 60" fill="currentColor">
              {/* Upper chevron */}
              <path d="M50,10 L85,35 L75,42 L50,24 L25,42 L15,35 Z" />
              {/* Lower chevron */}
              <path d="M50,28 L85,53 L75,60 L50,42 L25,60 L15,53 Z" />
            </svg>
            {/* Crystal Text */}
            <h2 className="text-black font-extrabold text-3xl tracking-wide mt-2 font-sans">
              Crystal
            </h2>
            {/* Tagline */}
            <p className="text-black text-[10px] font-bold tracking-wider mt-1 uppercase text-center">
              Cold Chain Solution Company
            </p>
          </div>
        </div>

        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          © 2026 CRYSTAL PEOPLE LITE. AI-POWERED PERFORMANCE.
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 bg-[#0A1128] flex flex-col justify-between p-8 sm:p-12 md:p-16 min-h-screen">
        <div /> {/* Top spacer to match layout */}

        <div className="w-full max-w-md mx-auto my-auto py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center text-center gap-4 mb-8">
            <div className="bg-white p-4 rounded-none w-36 h-36 flex flex-col items-center justify-center shadow-lg border border-slate-800">
              <svg className="w-16 h-10 text-black" viewBox="0 0 100 60" fill="currentColor">
                <path d="M50,10 L85,35 L75,42 L50,24 L25,42 L15,35 Z" />
                <path d="M50,28 L85,53 L75,60 L50,42 L25,60 L15,53 Z" />
              </svg>
              <h2 className="text-black font-extrabold text-xl tracking-wide mt-1 font-sans">
                Crystal
              </h2>
            </div>
            <div className="mt-2">
              <span className="text-white font-extrabold text-xl">Crystal People</span>
              <span className="text-primary-400 text-sm font-semibold ml-1 bg-slate-900 px-2 py-0.5 rounded-lg">Lite</span>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-2">Sign in</h2>
          <p className="text-slate-400 text-sm mb-8 font-medium">Enter your credentials to access your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="bob@crystal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="emp123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-400 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-800 bg-[#0F1934] text-primary-500 focus:ring-primary-500/20"
                />
                Remember me
              </label>
              <a href="#forgot" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-xs tracking-wider"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </span>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 border-t border-slate-900 pt-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                Demo Credentials
              </p>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">
                {filteredUsers.length} available
              </span>
            </div>

            {/* Search and Filters */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search demo users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-[#0F1934]/60 transition-all duration-200"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Role filter tabs */}
              <div className="flex gap-1.5">
                {['all', 'manager', 'employee'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFilterRole(role)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-150 border ${
                      filterRole === role
                        ? 'bg-primary-500/10 text-primary-400 border-primary-500/30'
                        : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300 hover:bg-[#162447]/30'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable list */}
            <div className="grid gap-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
              {filteredUsers.map((cred) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => fillDemo(cred)}
                  className="flex items-center justify-between p-2.5 bg-[#0F1934]/40 hover:bg-[#162447] border border-slate-800 hover:border-primary-500/50 rounded-xl transition-all duration-150 group"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar circle */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                      cred.role === 'manager'
                        ? 'bg-accent-500/10 text-accent-400 border border-accent-500/20'
                        : 'bg-primary-500/10 text-primary-400 border border-primary-500/20 group-hover:bg-primary-500/20 group-hover:text-primary-300'
                    }`}>
                      {cred.avatar || '??'}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white group-hover:text-primary-400 transition-colors">
                        {cred.name}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <span>{cred.email}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                          {cred.role}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors bg-[#0F1934] border border-slate-800 group-hover:border-primary-500/30 px-2.5 py-1 rounded-lg">
                    Use →
                  </span>
                </button>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-[#0F1934]/20">
                  <p className="text-xs text-slate-500 font-medium">No matching demo credentials found</p>
                  <p className="text-[10px] text-slate-600 mt-1">Try refining your search query</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-full mt-auto">
          <a href="#privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          <a href="#contact" className="hover:text-slate-400 transition-colors">Contact</a>
        </div>
      </div>
    </div>
  )
}
