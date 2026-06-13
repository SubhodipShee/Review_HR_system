import { scoreLabel, scoreBgColor } from '../utils/helpers'

/**
 * A 1–5 score slider with label and dot indicators
 */
export default function ScoreSlider({ id, label, value, onChange }) {
  const filled = Math.round(value)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="label mb-0">{label}</label>
        <span className={`badge text-xs font-semibold px-2.5 py-1 rounded-lg ${scoreBgColor(value)}`}>
          {value}/5 · {scoreLabel(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary-500"
        style={{
          background: `linear-gradient(to right, #06B6D4 ${((value - 1) / 4) * 100}%, #1E293B ${((value - 1) / 4) * 100}%)`,
        }}
      />
      <div className="flex justify-between">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
              n <= filled
                ? 'bg-primary-500 text-slate-950'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  )
}
