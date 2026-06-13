/**
 * Central error handler middleware
 */
export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)

  // Google API errors
  if (err.code === 403 || err.message?.includes('PERMISSION_DENIED')) {
    return res.status(503).json({
      message: 'Google Sheets access denied. Check service account permissions.',
      code: 'SHEETS_PERMISSION_ERROR',
    })
  }

  if (err.message?.includes('credentials not configured') || err.message?.includes('API key')) {
    return res.status(503).json({
      message: 'External service not configured. Check environment variables.',
      code: 'CONFIG_ERROR',
    })
  }

  // Anthropic errors
  if (err.status === 401) {
    return res.status(503).json({
      message: 'AI service authentication failed. Check CLAUDE_API_KEY.',
      code: 'AI_AUTH_ERROR',
    })
  }

  if (err.status === 429) {
    return res.status(429).json({
      message: 'AI service rate limit reached. Please try again in a moment.',
      code: 'RATE_LIMIT',
    })
  }

  const statusCode = err.status || err.statusCode || 500
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  })
}
