import { createReview, getReviews, getEmployeeReviews } from '../services/googleSheetsService.js'

/**
 * POST /api/reviews
 * Submit a new performance review
 */
export async function submitReview(req, res, next) {
  try {
    const {
      employeeId,
      employeeName,
      employeeEmail,
      month,
      outputQuality,
      attendance,
      teamwork,
      averageScore,
      comment,
      managerName,
      timestamp,
    } = req.body

    // Validation
    if (!employeeId || !employeeName || !month) {
      return res.status(400).json({ message: 'employeeId, employeeName and month are required' })
    }
    for (const [field, val] of [['outputQuality', outputQuality], ['attendance', attendance], ['teamwork', teamwork]]) {
      const n = Number(val)
      if (!val || n < 1 || n > 5) {
        return res.status(400).json({ message: `${field} must be between 1 and 5` })
      }
    }

    const review = await createReview({
      employeeId,
      employeeName,
      employeeEmail: employeeEmail || '',
      month,
      outputQuality: Number(outputQuality),
      attendance: Number(attendance),
      teamwork: Number(teamwork),
      averageScore: Number(averageScore) || (Number(outputQuality) + Number(attendance) + Number(teamwork)) / 3,
      comment: comment || '',
      managerName: managerName || 'Manager',
      timestamp: timestamp || new Date().toISOString(),
    })

    res.status(201).json({ message: 'Review submitted successfully', review })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/reviews
 * Fetch all reviews
 */
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await getReviews()
    res.json({ reviews, total: reviews.length })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/reviews/:employeeId
 * Fetch reviews for a specific employee
 */
export async function getEmployeeReviewsCtrl(req, res, next) {
  try {
    const { employeeId } = req.params
    if (!employeeId) {
      return res.status(400).json({ message: 'employeeId is required' })
    }
    const reviews = await getEmployeeReviews(employeeId)
    res.json({ reviews, total: reviews.length, employeeId })
  } catch (err) {
    next(err)
  }
}
