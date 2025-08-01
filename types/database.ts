export type Order = {
  id: number
  order_id: number | null
  order_first_time: string | null
  order_second_time: string | null
  time_between_messages: string | null
  department: string | null
  first_order_timestamp: number | null
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