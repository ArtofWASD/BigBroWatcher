import { useState, useEffect } from 'react'
import type { Order } from '@/types/database'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/orders')
      const result = await response.json()

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Произошла ошибка при загрузке данных')
      }

      setOrders(result.orders || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных')
    } finally {
      setLoading(false)
    }
  }

  return { orders, loading, error, refetch: fetchOrders }
}
