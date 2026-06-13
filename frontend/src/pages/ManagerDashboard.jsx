import { useState } from 'react'
import { Users, ClipboardList, CheckCircle, User, Sparkles, RefreshCw, Search, MessageSquare, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import ScoreSlider from '../components/ScoreSlider'
import StatCard from '../components/StatCard'
import { reviewsApi, aiApi } from '../services/api'
import { useReviews } from '../hooks/useReviews'
import { useAuth, USERS } from '../context/AuthContext'
import { calcAverage, formatMonth, getMonthOptions, scoreBgColor, formatDate, getInitials } from '../utils/helpers'
import MarkdownRenderer from '../components/MarkdownRenderer'

// Employees available for review (from hardcoded users)
const EMPLOYEES = USERS.filter((u) => u.role === 'employee').map((u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatar: u.avatar,
}))

const INITIAL_FORM = {
  employeeId: '',
  employeeName: '',
  employeeEmail: '',
  month: getMonthOptions()[0]?.value || '',
  outputQuality: 3,
  attendance: 3,
  teamwork: 3,
  comment: '',
}

export default function ManagerDashboard() {
  const { user } = useAuth()
  const { reviews, loading: reviewsLoading, refetch } = useReviews()
  const [activeModal, setActiveModal] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState(null)

  const handleAnalyzeFeedback = async () => {
    if (!form.comment.trim()) return
    setAnalyzing(true)
    setAiAnalysis(null)
    try {
      const { data } = await aiApi.analyzeFeedback({
        outputQuality: form.outputQuality,
        attendance: form.attendance,
        teamwork: form.teamwork,
        comment: form.comment,
        employeeName: form.employeeName,
      })
      setAiAnalysis(data.analysis)
      if (data.analysis.isInconsistent) {
        toast.error('AI flagged a consistency issue between scores and feedback text!', { duration: 4000 })
      } else {
        toast.success('Feedback analysis complete! Scores & comment align.')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyze feedback. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleApplySuggestion = () => {
    if (aiAnalysis?.suggestion) {
      setForm((f) => ({ ...f, comment: aiAnalysis.suggestion }))
      setAiAnalysis(null)
      toast.success('AI suggested feedback applied!')
    }
  }

  const [hrQuery, setHrQuery] = useState('')
  const [queryingHR, setQueryingHR] = useState(false)
  const [hrAnswer, setHrAnswer] = useState('')

  const handleQueryHR = async (e) => {
    e.preventDefault()
    await triggerQueryHR(hrQuery)
  }

  const triggerQueryHR = async (queryText) => {
    if (!queryText.trim()) return
    setHrQuery(queryText)
    setQueryingHR(true)
    setHrAnswer('')
    try {
      const { data } = await aiApi.queryHR(queryText.trim())
      setHrAnswer(data.answer)
      toast.success('AI team query succeeded!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to query AI assistant. Please try again.')
    } finally {
      setQueryingHR(false)
    }
  }

  const monthOptions = getMonthOptions()

  const handleEmployeeSelect = (e) => {
    const emp = EMPLOYEES.find((em) => em.id === e.target.value)
    setForm((f) => ({
      ...f,
      employeeId: emp?.id || '',
      employeeName: emp?.name || '',
      employeeEmail: emp?.email || '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.employeeId) { toast.error('Please select an employee'); return }
    if (!form.month) { toast.error('Please select a review month'); return }
    if (!form.comment.trim()) { toast.error('Please add a feedback comment'); return }

    setSubmitting(true)
    try {
      const avg = calcAverage(form.outputQuality, form.attendance, form.teamwork)
      await reviewsApi.create({
        ...form,
        averageScore: avg,
        managerName: user.name,
        timestamp: new Date().toISOString(),
      })
      toast.success('Review submitted successfully!')
      setSubmitted(true)
      setForm(INITIAL_FORM)
      setAiAnalysis(null)
      refetch()
      setTimeout(() => setSubmitted(false), 3000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Stats
  const totalReviews = reviews.length
  const uniqueEmployees = new Set(reviews.map((r) => r.employeeId)).size
  const avgAll = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.averageScore || 0), 0) / reviews.length).toFixed(2)
    : '—'

  const latestReview = reviews.length > 0
    ? [...reviews].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
    : null
  const latestReviewDate = latestReview ? formatDate(latestReview.timestamp) : '—'
  const lastReviewedEmployee = latestReview ? latestReview.employeeName : '—'
  const highestTeamScore = reviews.length > 0
    ? Math.max(...reviews.map((r) => r.averageScore || 0)).toFixed(2)
    : '—'

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="page-title">Manager Dashboard</h1>
          <p className="text-muted mt-1">Submit and manage employee performance reviews</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<ClipboardList className="w-5 h-5" />}
            label="Total Reviews"
            value={reviewsLoading ? '…' : totalReviews}
            color="primary"
            onClick={() => setActiveModal('totalReviews')}
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Employees Reviewed"
            value={reviewsLoading ? '…' : uniqueEmployees}
            color="secondary"
            onClick={() => setActiveModal('employeesReviewed')}
          />
          <StatCard
            icon={<User className="w-5 h-5" />}
            label="Team Size"
            value={EMPLOYEES.length}
            color="accent"
            onClick={() => setActiveModal('teamSize')}
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Team Avg Score"
            value={reviewsLoading ? '…' : avgAll}
            color="amber"
            onClick={() => setActiveModal('teamAvgScore')}
          />
        </div>

        {/* AI Team Assistant */}
        <div className="card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary-400" />
            <div>
              <h2 className="section-title">AI Team Assistant</h2>
              <p className="text-xs text-text-secondary">Ask questions about review trends, monthly status, or team performance metrics.</p>
            </div>
          </div>

          <form onSubmit={handleQueryHR} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow">
                <input
                  id="hr-query-input"
                  type="text"
                  className="input pr-10"
                  placeholder="e.g. Who hasn't been reviewed this month?"
                  value={hrQuery}
                  onChange={(e) => setHrQuery(e.target.value)}
                  disabled={queryingHR}
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-500" />
                </div>
              </div>
              <button
                type="submit"
                disabled={queryingHR || !hrQuery.trim()}
                className="btn-primary py-2.5 px-6 whitespace-nowrap"
              >
                {queryingHR ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Querying...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Ask Assistant
                  </>
                )}
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Queries:</span>
              <button
                type="button"
                onClick={() => triggerQueryHR("Who hasn't been reviewed this month?")}
                disabled={queryingHR}
                className="px-3 py-1.5 bg-[#0F1934]/60 border border-slate-800 hover:border-primary-500/30 text-xs font-medium rounded-lg text-slate-300 hover:text-white transition-all duration-150"
              >
                Who hasn't been reviewed this month?
              </button>
              <button
                type="button"
                onClick={() => triggerQueryHR("What is the average score of all employees?")}
                disabled={queryingHR}
                className="px-3 py-1.5 bg-[#0F1934]/60 border border-slate-800 hover:border-primary-500/30 text-xs font-medium rounded-lg text-slate-300 hover:text-white transition-all duration-150"
              >
                Overall team average score?
              </button>
              <button
                type="button"
                onClick={() => triggerQueryHR("Suggest improvement actions for low scorers.")}
                disabled={queryingHR}
                className="px-3 py-1.5 bg-[#0F1934]/60 border border-slate-800 hover:border-primary-500/30 text-xs font-medium rounded-lg text-slate-300 hover:text-white transition-all duration-150"
              >
                Improvement actions for low scorers?
              </button>
            </div>
          </form>

          {/* Answer Panel */}
          {(queryingHR || hrAnswer) && (
            <div className="mt-4 p-4 bg-[#0f1934]/60 border border-slate-800/80 rounded-xl animate-fadeIn">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-400 mb-2.5">
                <MessageSquare className="w-4 h-4" />
                <span>Assistant Response</span>
              </div>
              {queryingHR ? (
                <div className="flex items-center gap-3 py-2 text-slate-400">
                  <span className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                  <span className="text-xs">Analyzing spreadsheet data & formulating answer...</span>
                </div>
              ) : (
                <div className="text-sm text-slate-200 leading-relaxed">
                  <MarkdownRenderer content={hrAnswer} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Review form – 3 cols */}
          <div className="lg:col-span-3">
            <div className="card">
              <h2 className="section-title mb-6 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary-500" />
                Submit Performance Review
              </h2>

              {submitted && (
                <div className="flex items-center gap-3 p-4 bg-primary-950/20 border border-primary-500/20 rounded-xl mb-6">
                  <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <p className="text-sm font-semibold text-primary-400">Review submitted and saved to Google Sheets!</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Employee select */}
                <div>
                  <label htmlFor="employee-select" className="label">Employee</label>
                  <select
                    id="employee-select"
                    className="select"
                    value={form.employeeId}
                    onChange={handleEmployeeSelect}
                    required
                  >
                    <option value="">Select employee…</option>
                    {EMPLOYEES.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                {/* Month select */}
                <div>
                  <label htmlFor="month-select" className="label">Review Month</label>
                  <select
                    id="month-select"
                    className="select"
                    value={form.month}
                    onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
                    required
                  >
                    {monthOptions.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <hr className="border-slate-800/80" />

                {/* Score sliders */}
                <div className="space-y-5">
                  <ScoreSlider
                    id="output-quality-slider"
                    label="Output Quality"
                    value={form.outputQuality}
                    onChange={(v) => setForm((f) => ({ ...f, outputQuality: v }))}
                  />
                  <ScoreSlider
                    id="attendance-slider"
                    label="Attendance"
                    value={form.attendance}
                    onChange={(v) => setForm((f) => ({ ...f, attendance: v }))}
                  />
                  <ScoreSlider
                    id="teamwork-slider"
                    label="Teamwork"
                    value={form.teamwork}
                    onChange={(v) => setForm((f) => ({ ...f, teamwork: v }))}
                  />
                </div>

                {/* Average preview */}
                <div className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-800">
                  <span className="text-sm text-text-secondary font-medium">Average Score</span>
                  <span className={`text-lg font-bold ${scoreBgColor(calcAverage(form.outputQuality, form.attendance, form.teamwork)).split(' ')[1]}`}>
                    {calcAverage(form.outputQuality, form.attendance, form.teamwork).toFixed(2)} / 5
                  </span>
                </div>

                <hr className="border-slate-800/80" />

                {/* Comment */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="feedback-comment" className="label mb-0">Manager Feedback</label>
                    <button
                      type="button"
                      onClick={handleAnalyzeFeedback}
                      disabled={analyzing || !form.comment.trim()}
                      className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed select-none"
                    >
                      {analyzing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary-400" />
                          Analyzing…
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                          AI Feedback Assistant
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    id="feedback-comment"
                    rows={4}
                    className="input resize-none"
                    placeholder="Write constructive feedback for this employee…"
                    value={form.comment}
                    onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                    required
                  />
                  <p className="text-xs text-text-secondary mt-1">{form.comment.length}/500 characters</p>
                </div>

                {/* AI Assistant Results */}
                {aiAnalysis && (
                  <div className="p-4 bg-[#0f1934]/60 rounded-xl border border-slate-800/80 space-y-3 mt-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-primary-400" />
                        <span className="text-white">AI Assistant Review</span>
                      </div>
                      <span className={`badge text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        aiAnalysis.isInconsistent 
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50' 
                          : 'bg-primary-950/80 text-primary-400 border border-primary-800/50'
                      }`}>
                        {aiAnalysis.isInconsistent ? '⚠️ Inconsistent' : '✓ Consistent'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-400">Analysis: </span>
                      {aiAnalysis.explanation}
                    </p>

                    {aiAnalysis.suggestion && (
                      <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Improvement:</p>
                        <p className="text-xs text-slate-200 leading-relaxed italic">"{aiAnalysis.suggestion}"</p>
                        <button
                          type="button"
                          onClick={handleApplySuggestion}
                          className="btn-primary w-full py-2 text-[10px] font-bold tracking-wider"
                        >
                          Apply Suggestion
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <button
                  id="submit-review-btn"
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-3"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-950 rounded-full animate-spin" />
                      Submitting…
                    </span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Submit Review
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Recent reviews – 2 cols */}
          <div className="lg:col-span-2">
            <div className="card h-full">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary-400" />
                Recent Reviews
              </h2>

              {reviewsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-20 bg-slate-800/40 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ClipboardList className="w-10 h-10 text-slate-700 mb-3" />
                  <p className="text-sm font-bold text-text-secondary">No reviews yet</p>
                  <p className="text-xs text-text-secondary/70 mt-1">Submit the first review using the form</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-hide pr-1">
                  {[...reviews].reverse().map((r, i) => (
                    <div key={i} className="p-3.5 bg-[#0F1934]/40 hover:bg-[#162447] border border-slate-800/80 hover:border-primary-500/30 rounded-xl transition-all duration-150">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-slate-950 text-xs font-bold shadow-md">
                            {getInitials(r.employeeName)}
                          </div>
                          <span className="text-sm font-bold text-white">{r.employeeName}</span>
                        </div>
                        <span className={`badge text-xs font-bold ${scoreBgColor(r.averageScore)}`}>
                          {r.averageScore?.toFixed(2) || '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-text-secondary">
                        <span>{formatMonth(r.month)}</span>
                        <span>{formatDate(r.timestamp)}</span>
                      </div>
                      {r.comment && (
                        <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                          {r.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {activeModal && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-card w-full max-w-sm rounded-2xl border border-slate-800/80 p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'totalReviews' && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary-400" />
                  Total Reviews Details
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Reviews</span>
                    <span className="text-2xl font-bold text-white">{reviewsLoading ? '…' : totalReviews}</span>
                  </div>
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Latest Review Date</span>
                    <span className="text-lg font-bold text-white">{reviewsLoading ? '…' : latestReviewDate}</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'employeesReviewed' && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary-400" />
                  Employees Reviewed Details
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Number of Employees Reviewed</span>
                    <span className="text-2xl font-bold text-white">{reviewsLoading ? '…' : uniqueEmployees}</span>
                  </div>
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Last Reviewed Employee</span>
                    <span className="text-lg font-bold text-white">{reviewsLoading ? '…' : lastReviewedEmployee}</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'teamSize' && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-accent-400" />
                  Team Size Details
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Team Members</span>
                    <span className="text-2xl font-bold text-white">{EMPLOYEES.length}</span>
                  </div>
                  
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 flex flex-col">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Team Members List</span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                      {EMPLOYEES.map((emp) => (
                        <div key={emp.id} className="p-2.5 bg-[#0F1934]/60 border border-slate-800/50 rounded-lg flex flex-col gap-0.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white">{emp.name}</span>
                            <span className="text-[10px] text-accent-400 font-mono bg-accent-950/30 px-1.5 py-0.5 rounded border border-accent-800/30">ID: {emp.id}</span>
                          </div>
                          <span className="text-[11px] text-text-secondary">{emp.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'teamAvgScore' && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-400" />
                  Team Average Score Details
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Team Average Score</span>
                    <span className="text-2xl font-bold text-white">{reviewsLoading ? '…' : avgAll}</span>
                  </div>
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Highest Team Score</span>
                    <span className="text-lg font-bold text-white">{reviewsLoading ? '…' : highestTeamScore}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
