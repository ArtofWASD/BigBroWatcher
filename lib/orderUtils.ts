import type { Order } from '@/types/database'

/**
 * Validates and normalizes order data
 */
export function validateOrderData(order: Partial<Order> & { id?: unknown }): Order {
  // Process order_status to extract status array
  let statusArray: string[] = []
  let allStatuses: string[] = []
  
  if (order.order_status) {
    // If order_status is already an array
    if (Array.isArray(order.order_status)) {
      statusArray = order.order_status.filter(Boolean)
    } 
    // If it's a string that looks like an array (JSON)
    else if (typeof order.order_status === 'string') {
      try {
        const parsed = JSON.parse(order.order_status)
        if (Array.isArray(parsed)) {
          statusArray = parsed.filter(Boolean)
        } else {
          statusArray = [order.order_status]
        }
      } catch {
        // If parsing fails, try to split by comma
        // This handles cases like "Одобрен ожидается оплата,Выполнен"
        statusArray = (order.order_status as string).split(',').map((s: string) => s.trim()).filter(Boolean)
      }
    }
  }
  
  // For all_statuses, use the same logic or fallback to statusArray
  if (order.all_statuses) {
    if (Array.isArray(order.all_statuses)) {
      allStatuses = order.all_statuses.filter(Boolean)
    } else if (typeof order.all_statuses === 'string') {
      try {
        const parsed = JSON.parse(order.all_statuses)
        if (Array.isArray(parsed)) {
          allStatuses = parsed.filter(Boolean)
        } else {
          allStatuses = [order.all_statuses]
        }
      } catch {
        // If parsing fails, try to split by comma
        allStatuses = (order.all_statuses as string).split(',').map((s: string) => s.trim()).filter(Boolean)
      }
    }
  } else {
    // Fallback to statusArray if all_statuses is not provided
    allStatuses = [...statusArray]
  }

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
    current_order_status: statusArray,
    all_statuses: allStatuses,
    order_amount: order.order_amount ?? null,
  }
}