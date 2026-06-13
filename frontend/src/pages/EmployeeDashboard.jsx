import { useMemo } from 'react'
import { Star, TrendingUp, BarChart2, Calendar } from 'lucide-react'
import Navbar from '../components/Navbar'
import ReviewCard from '../components/ReviewCard'
import AIInsightsCard from '../components/AIInsightsCard'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import { useEmployeeReviews } from '../hooks/useReviews'
import { scoreBgColor, scoreLabel } from '../utils/helpers'

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const { reviews, loading } = useEmployeeReviews(user?.id)

  const sorted = useMemo(
    () => [...reviews].sort((a, b) => (b.month > a.month ? 1 : -1)),
    [reviews]
  )

  const avgScore = useMemo(() => {
    if (!reviews.length) return null
    return (reviews.reduce((s, r) => s + (r.averageScore || 0), 0) / reviews.length).toFixed(2)
  }, [reviews])

  const latestReview = sorted[0]

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="page-title">My Performance</h1>
            <p className="text-muted mt-1">Review history and AI-powered insights for {user?.name}</p>
          </div>
          {avgScore && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-bold ${scoreBgColor(parseFloat(avgScore))}`}>
              <Star className="w-4 h-4" />
              {avgScore} Overall · {scoreLabel(parseFloat(avgScore))}
            </div>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Calendar className="w-5 h-5" />}
            label="Total Reviews"
            value={loading ? '…' : reviews.length}
            color="primary"
          />
          <StatCard
            icon={<Star className="w-5 h-5" />}
            label="Overall Average"
            value={loading ? '…' : (avgScore || '—')}
            color="secondary"
          />
          <StatCard
            icon={<BarChart2 className="w-5 h-5" />}
            label="Latest Output"
            value={loading ? '…' : (latestReview?.outputQuality || '—')}
            sub="Output Quality"
            color="accent"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Latest Teamwork"
            value={loading ? '…' : (latestReview?.teamwork || '—')}
            sub="Teamwork Score"
            color="amber"
          />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Timeline – 3 cols */}
          <div className="lg:col-span-3">
            <div className="card">
              <h2 className="section-title mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-400" />
                Review History
              </h2>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 animate-pulse flex-shrink-0" />
                      <div className="flex-1 h-28 bg-slate-800/60 rounded-xl animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-slate-700" />
                  </div>
                  <p className="text-sm font-bold text-text-secondary">No reviews yet</p>
                  <p className="text-xs text-text-secondary/70 mt-1.5 max-w-xs leading-relaxed">
                    Your manager hasn't submitted any performance reviews for your account yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {sorted.map((review, i) => (
                    <ReviewCard
                      key={`${review.month}-${i}`}
                      review={review}
                      isLast={i === sorted.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Insights – 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <AIInsightsCard employeeId={user?.id} employeeName={user?.name} />

            {/* Latest scores breakdown */}
            {latestReview && (
              <div className="card">
                <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <BarChart2 className="w-4 h-4 text-primary-400" />
                  Latest Breakdown
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Output Quality', value: latestReview.outputQuality, color: 'from-primary-400 to-primary-500' },
                    { label: 'Attendance', value: latestReview.attendance, color: 'from-secondary-400 to-secondary-500' },
                    { label: 'Teamwork', value: latestReview.teamwork, color: 'from-accent-400 to-accent-500' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-text-secondary font-semibold">{label}</span>
                        <span className="font-bold text-white">{value}/5</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
                          style={{ width: `${((value - 1) / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
