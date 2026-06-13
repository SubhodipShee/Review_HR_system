import { useState, useEffect, useCallback } from 'react'
import { employeesApi } from '../services/api'

export function useEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await employeesApi.getAll()
      setEmployees(data.employees || [])
    } catch {
      // Silently fail – employees list is non-critical
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { employees, loading, refetch: fetch }
}
