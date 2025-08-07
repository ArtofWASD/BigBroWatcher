import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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

      // Маппим данные из order_status в current_order_status для отображения в таблице
      const mappedData = (data || []).map(order => {
        // Обрабатываем order_status как массив статусов
        let statusArray: string[] = []
        
        if (order.order_status) {
          // Если order_status уже массив
          if (Array.isArray(order.order_status)) {
            statusArray = order.order_status.filter(Boolean)
          } 
          // Если это строка, которая выглядит как массив
          else if (typeof order.order_status === 'string') {
            try {
              const parsed = JSON.parse(order.order_status)
              if (Array.isArray(parsed)) {
                statusArray = parsed.filter(Boolean)
              } else {
                statusArray = [order.order_status]
              }
            } catch {
              // Если не удалось распарсить, считаем это одним статусом
              statusArray = [order.order_status]
            }
          }
        }
        
        return {
          ...order,
          current_order_status: statusArray, // Теперь это массив
          all_statuses: statusArray
        }
      })
      setOrders(mappedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных')
    } finally {
      setLoading(false)
    }
  }

  return { orders, loading, error, refetch: fetchOrders }
}
