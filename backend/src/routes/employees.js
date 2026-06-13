import { Router } from 'express'
import { getEmployees } from '../controllers/employeesController.js'

const router = Router()

router.get('/', getEmployees)

export default router
