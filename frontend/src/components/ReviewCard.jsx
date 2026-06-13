import { scoreBgColor, formatMonth } from '../utils/helpers'
import { Calendar, MessageSquare } from 'lucide-react'

/**
 * A single review card shown in the employee timeline
 */
export default function ReviewCard({ review, isLast }) {
  const avg = review.averageScore || ((review.outputQuality + review.attendance + review.teamwork) / 3).toFixed(2)

  return (
    <div className={`relative flex gap-4 ${!isLast ? 'pb-6' : ''}`}>
      {/* Timeline dot + connector */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-md z-10 text-slate-950">
          <span className="text-xs font-bold">{parseFloat(avg).toFixed(1)}</span>
        </div>
        {!isLast && (
          <div className="flex-1 w-0.5 bg-gradient-to-b from-primary-500 to-secondary-500 mt-2 min-h-[24px]" />
        )}
      </div>

      {/* Card content */}
      <div className="flex-1 card-sm hover:border-slate-700/80 transition-all duration-200 mb-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-400" />
            <span className="font-semibold text-white text-sm">
              {formatMonth(review.month)}
            </span>
          </div>
          <span className={`badge text-xs font-bold px-2.5 py-1 rounded-lg ${scoreBgColor(parseFloat(avg))}`}>
            Avg {parseFloat(avg).toFixed(2)}
          </span>
        </div>

        {/* Score bars */}
        <div className="space-y-2 mb-3">
          <ScoreBar label="Output Quality" value={review.outputQuality} />
          <ScoreBar label="Attendance" value={review.attendance} />
          <ScoreBar label="Teamwork" value={review.teamwork} />
        </div>

        {/* Comment */}
        {review.comment && (
          <div className="pt-2.5 border-t border-slate-800">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-text-secondary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-text-secondary leading-relaxed">{review.comment}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ScoreBar({ label, value }) {
  const pct = ((value - 1) / 4) * 100
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-secondary w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-white w-4 text-right">{value}</span>
    </div>
  )
}
