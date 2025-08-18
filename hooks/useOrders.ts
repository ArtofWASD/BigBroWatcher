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

      if (!response.ok) {
        if (response.status === 401) {
          // Пользователь не авторизован, перенаправляем на страницу входа
          window.location.href = '/login'
          return
        }
        throw new Error(result.error || 'Произошла ошибка при загрузке данных')
      }

      if (result.error) {
        throw new Error(result.error)
      }

      setOrders(result.orders || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { orders, loading, error, refetch: fetchOrders }
}
