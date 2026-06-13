import { Router } from 'express'
import { getAISummary, analyzeFeedback, queryHR } from '../controllers/aiController.js'

const router = Router()

router.post('/summary', getAISummary)
router.post('/analyze-feedback', analyzeFeedback)
router.post('/query-hr', queryHR)

export default router
