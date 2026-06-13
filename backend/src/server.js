import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import reviewRoutes from './routes/reviews.js'
import employeeRoutes from './routes/employees.js'
import aiRoutes from './routes/ai.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(url => url.trim()) : [])
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Crystal People Lite API', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/reviews', reviewRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/ai', aiRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` })
})

// Error handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`\n🌿 Crystal People Lite API running on http://localhost:${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Google Sheets: ${process.env.GOOGLE_SHEET_ID ? '✅ configured' : '⚠️  not configured'}`)
  console.log(`   Claude AI:     ${process.env.CLAUDE_API_KEY ? '✅ configured' : '⚠️  not configured'}\n`)
})

export default app
