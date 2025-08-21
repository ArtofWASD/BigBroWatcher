export type Order = {
  id: number
  order_id: number | null
  order_first_time: string | null
  order_second_time: string | null
  time_between_messages: string | null
  department: string | null
  first_order_timestamp: number | null
  order_status: string | string[] | null // Может быть строкой или массивом
  current_order_status: string[] | null // Теперь всегда массив для отображения
  all_statuses?: string[] // Массив всех статусов для выпадающего меню
  order_amount: number | null // Стоимость заказа
}

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: Order
        Insert: Omit<Order, 'id'>
        Update: Partial<Omit<Order, 'id'>>
      }
    }
  }
}
