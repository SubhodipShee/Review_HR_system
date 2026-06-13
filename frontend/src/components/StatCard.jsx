/**
 * Stat card with icon, value, label, and optional change indicator
 */
export default function StatCard({ icon, label, value, sub, color = 'primary', onClick }) {
  const colorMap = {
    primary: 'from-primary-400 to-primary-500 text-slate-950',
    secondary: 'from-secondary-400 to-secondary-500 text-white',
    accent: 'from-accent-400 to-accent-500 text-white',
    amber: 'from-amber-400 to-amber-500 text-slate-950',
  }

  return (
    <div 
      onClick={onClick}
      className={`card-sm flex items-center gap-4 ${
        onClick 
          ? 'cursor-pointer hover:border-slate-700/80 active:scale-[0.98] transition-all duration-200' 
          : ''
      }`}
    >
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.primary} flex items-center justify-center shadow-md flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        <p className="text-xs font-semibold text-text-secondary mt-0.5 truncate">{label}</p>
        {sub && <p className="text-xs text-text-secondary/70 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
