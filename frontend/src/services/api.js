import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Reviews
export const reviewsApi = {
  create: (data) => api.post('/reviews', data),
  getAll: () => api.get('/reviews'),
  getByEmployee: (employeeId) => api.get(`/reviews/${employeeId}`),
}

// Employees
export const employeesApi = {
  getAll: () => api.get('/employees'),
}

// AI
export const aiApi = {
  generateSummary: (employeeId) => api.post('/ai/summary', { employeeId }),
  analyzeFeedback: (data) => api.post('/ai/analyze-feedback', data),
  queryHR: (query) => api.post('/ai/query-hr', { query }),
}

export default api
