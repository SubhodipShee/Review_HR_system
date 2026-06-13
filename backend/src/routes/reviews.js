import { Router } from 'express'
import { submitReview, getAllReviews, getEmployeeReviewsCtrl } from '../controllers/reviewsController.js'

const router = Router()

router.post('/', submitReview)
router.get('/', getAllReviews)
router.get('/:employeeId', getEmployeeReviewsCtrl)

export default router
