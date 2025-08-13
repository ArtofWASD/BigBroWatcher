import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { validateOrderData } from '@/lib/orderUtils'
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
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        throw error
      }

      // Validate and normalize data
      const validatedData = (data || []).map(validateOrderData)
      setOrders(validatedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных')
    } finally {
      setLoading(false)
    }
  }

  return { orders, loading, error, refetch: fetchOrders }
}
