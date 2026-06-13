import { useState } from 'react'
import { Sparkles, AlertCircle, TrendingUp, Star, AlertTriangle, Target, RefreshCw } from 'lucide-react'
import { aiApi } from '../services/api'

export default function AIInsightsCard({ employeeId, employeeName }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generateSummary = async () => {
    setLoading(true)
    setError(null)
    setSummary(null)
    try {
      const { data } = await aiApi.generateSummary(employeeId)
      setSummary(data.summary)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate AI insights. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card border-l-4 border-l-primary-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="section-title leading-none">AI Insights</h3>
            <p className="text-xs text-text-secondary mt-0.5">Powered by Claude · Last 3 months</p>
          </div>
        </div>
        <button
          id="generate-ai-insights-btn"
          onClick={generateSummary}
          disabled={loading}
          className="btn-secondary text-xs py-2 px-3.5 tracking-wider font-semibold uppercase"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary-400" />
              Analyzing…
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
              {summary ? 'Regenerate' : 'Generate Summary'}
            </>
          )}
        </button>
      </div>

      {/* States */}
      {!summary && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0F1934] border border-slate-800 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-primary-400" />
          </div>
          <p className="text-sm font-bold text-white mb-1">No AI insights yet</p>
          <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
            Click "Generate Summary" to get an AI-powered performance analysis for {employeeName} based on the last 3 months of reviews.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-[3px] border-slate-800 border-t-primary-500 animate-spin" />
            <Sparkles className="w-4 h-4 text-primary-400 absolute inset-0 m-auto" />
          </div>
          <p className="text-sm font-semibold text-white mt-4">Analyzing performance data…</p>
          <p className="text-xs text-text-secondary mt-0.5">This may take a few seconds</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-950/20 rounded-xl border border-red-900/40">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-400">Unable to generate insights</p>
            <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {summary && (
        <div className="space-y-4">
          {/* Trend */}
          {summary.trend && (
            <div className="p-4 bg-primary-950/20 rounded-xl border border-primary-500/20">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="w-4 h-4 text-primary-400" />
                <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">Trend</span>
              </div>
              <p className="text-sm text-white leading-relaxed">{summary.trend}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            {summary.strengths && (
              <div className="p-4 bg-secondary-950/20 rounded-xl border border-secondary-500/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <Star className="w-4 h-4 text-secondary-400" />
                  <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Strengths</span>
                </div>
                <p className="text-sm text-white leading-relaxed">{summary.strengths}</p>
              </div>
            )}

            {/* Weaknesses */}
            {summary.weaknesses && (
              <div className="p-4 bg-amber-950/20 rounded-xl border border-amber-500/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Focus Areas</span>
                </div>
                <p className="text-sm text-white leading-relaxed">{summary.weaknesses}</p>
              </div>
            )}
          </div>

          {/* Recommendation */}
          {summary.recommendation && (
            <div className="p-4 bg-accent-950/20 rounded-xl border border-accent-500/20">
              <div className="flex items-center gap-2 mb-1.5">
                <Target className="w-4 h-4 text-accent-400" />
                <span className="text-xs font-bold text-accent-400 uppercase tracking-wider">Recommendation</span>
              </div>
              <p className="text-sm text-white leading-relaxed">{summary.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
