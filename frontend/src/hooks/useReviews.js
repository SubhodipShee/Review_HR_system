import { useState, useEffect, useCallback } from 'react'
import { reviewsApi } from '../services/api'
import toast from 'react-hot-toast'

export function useReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await reviewsApi.getAll()
      setReviews(data.reviews || [])
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load reviews'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { reviews, loading, error, refetch: fetchAll }
}

export function useEmployeeReviews(employeeId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!employeeId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await reviewsApi.getByEmployee(employeeId)
      setReviews(data.reviews || [])
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load your reviews'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [employeeId])

  useEffect(() => { fetch() }, [fetch])

  return { reviews, loading, error, refetch: fetch }
}
