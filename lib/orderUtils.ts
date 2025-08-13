import type { Order } from '@/types/database'

/**
 * Validates and normalizes order data
 */
export function validateOrderData(order: Partial<Order> & { id?: unknown }): Order {
  // Ensure required fields exist with proper types
  return {
    id: typeof order.id === 'number' ? order.id : 0,
    order_id: order.order_id ?? null,
    order_first_time: order.order_first_time ?? null,
    order_second_time: order.order_second_time ?? null,
    time_between_messages: order.time_between_messages ?? null,
    department: order.department ?? null,
    first_order_timestamp: order.first_order_timestamp ?? null,
    order_status: order.order_status ?? null,
    current_order_status: Array.isArray(order.current_order_status) 
      ? order.current_order_status.filter(Boolean) 
      : [],
    all_statuses: Array.isArray(order.all_statuses) 
      ? order.all_statuses.filter(Boolean) 
      : [],
  }
}