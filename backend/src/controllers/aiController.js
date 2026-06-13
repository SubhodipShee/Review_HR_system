import { getEmployeeReviews, getReviews } from '../services/googleSheetsService.js'
import { generatePerformanceSummary, analyzeFeedbackConsistency, queryHRData } from '../services/claudeService.js'
import { EMPLOYEES } from './employeesController.js'

/**
 * POST /api/ai/summary
 * Generate AI performance summary for an employee
 */
export async function getAISummary(req, res, next) {
  try {
    const { employeeId } = req.body

    if (!employeeId) {
      return res.status(400).json({ message: 'employeeId is required' })
    }

    // Get employee reviews from Sheets
    const reviews = await getEmployeeReviews(employeeId)

    if (reviews.length === 0) {
      return res.status(404).json({
        message: 'No reviews found for this employee. At least one review is needed to generate insights.',
      })
    }

    // Employee name from first review
    const employeeName = reviews[0]?.employeeName || 'this employee'

    // Generate AI summary
    const summary = await generatePerformanceSummary(reviews, employeeName)

    res.json({ summary, reviewsAnalyzed: Math.min(reviews.length, 3), employeeId })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/ai/analyze-feedback
 * Check manager written comment against numerical scores for consistency and suggest improvements.
 */
export async function analyzeFeedback(req, res, next) {
  try {
    const { outputQuality, attendance, teamwork, comment } = req.body

    if (!outputQuality || !attendance || !teamwork) {
      return res.status(400).json({ message: 'outputQuality, attendance and teamwork scores are required' })
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'comment feedback text is required for analysis' })
    }

    const analysis = await analyzeFeedbackConsistency(
      Number(outputQuality),
      Number(attendance),
      Number(teamwork),
      comment.trim()
    )

    res.json({ analysis })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/ai/query-hr
 * Answer general HR questions based on all reviews and the 20 active employees.
 */
export async function queryHR(req, res, next) {
  try {
    const { query } = req.body

    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'query text is required' })
    }

    const reviews = await getReviews()
    const answer = await queryHRData(query.trim(), reviews, EMPLOYEES)

    res.json({ answer })
  } catch (err) {
    next(err)
  }
}
