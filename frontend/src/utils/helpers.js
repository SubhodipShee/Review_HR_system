/**
 * Utility helpers for Crystal People Lite
 */

// Month list for selector
export const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
]

// Get month label from value (e.g. "2024-01" → "January 2024")
export function formatMonth(monthStr) {
  if (!monthStr) return ''
  const [year, month] = monthStr.split('-')
  const monthName = MONTHS[parseInt(month, 10) - 1]
  return `${monthName} ${year}`
}

// Generate month options for last 12 months
export function getMonthOptions() {
  const options = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
    options.push({ value, label })
  }
  return options
}

// Calculate average of scores
export function calcAverage(...scores) {
  const valid = scores.filter((s) => typeof s === 'number' && !isNaN(s))
  if (!valid.length) return 0
  return parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2))
}

// Score to color mapping
export function scoreColor(score) {
  if (score >= 4.5) return 'text-primary-600'
  if (score >= 3.5) return 'text-secondary-600'
  if (score >= 2.5) return 'text-accent-600'
  if (score >= 1.5) return 'text-yellow-600'
  return 'text-red-500'
}

export function scoreBgColor(score) {
  if (score >= 4.5) return 'bg-primary-50 text-primary-700'
  if (score >= 3.5) return 'bg-secondary-50 text-secondary-700'
  if (score >= 2.5) return 'bg-accent-50 text-accent-700'
  if (score >= 1.5) return 'bg-yellow-50 text-yellow-700'
  return 'bg-red-50 text-red-600'
}

// Score label
export function scoreLabel(score) {
  if (score >= 4.5) return 'Excellent'
  if (score >= 3.5) return 'Good'
  if (score >= 2.5) return 'Average'
  if (score >= 1.5) return 'Below Average'
  return 'Needs Improvement'
}

// Format timestamp
export function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Avatar initials from name
export function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
