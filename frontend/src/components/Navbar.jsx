import { useNavigate } from 'react-router-dom'
import { LogOut, Leaf } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-[#070B19] border-b border-slate-800/80 shadow-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white flex items-center justify-center shadow-md rounded-none">
            <svg className="w-6 h-4 text-black" viewBox="0 0 100 60" fill="currentColor">
              <path d="M50,10 L85,35 L75,42 L50,24 L25,42 L15,35 Z" />
              <path d="M50,28 L85,53 L75,60 L50,42 L25,60 L15,53 Z" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-white text-base leading-none tracking-wide">Crystal</span>
            <span className="text-[10px] text-slate-400 ml-1.5 font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded-md">People Lite</span>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-slate-950 text-xs font-bold shadow-md">
                  {user.avatar || user.name?.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-right leading-tight">
                  <p className="text-sm font-bold text-white">{user.name}</p>
                  <p className="text-[11px] text-slate-400 font-medium capitalize">{user.role}</p>
                </div>
              </div>
              <button
                id="logout-btn"
                onClick={handleLogout}
                className="btn-ghost text-slate-400 hover:text-red-400 hover:bg-red-950/30 p-2 rounded-xl transition-all"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
