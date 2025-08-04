import type { Order } from '@/types/database'

/**
 * Утилиты для работы с временем обработки заказов
 */

/**
 * Конвертирует строку времени обработки в минуты
 * Поддерживает форматы: "Xч Yмин", "Xч", "Yмин", числа
 */
export const parseProcessingTime = (time: string | null): number => {
  if (!time) return 0
  
  // Обработка формата "Xч Yмин" или "Xч"
  const hoursMinutesMatch = time.match(/(\d+)ч\s*(\d+)?мин?/)
  if (hoursMinutesMatch) {
    const hours = parseInt(hoursMinutesMatch[1])
    const minutes = hoursMinutesMatch[2] ? parseInt(hoursMinutesMatch[2]) : 0
    return hours * 60 + minutes
  }
  
  // Обработка случая только минут "Xмин"
  const minutesMatch = time.match(/(\d+)мин/)
  if (minutesMatch) {
    return parseInt(minutesMatch[1])
  }
  
  // Обработка случая только часов "Xч"
  const hoursMatch = time.match(/(\d+)ч/)
  if (hoursMatch) {
    return parseInt(hoursMatch[1]) * 60
  }
  
  // Попытка извлечь числа из строки
  const numbers = time.match(/\d+/g)
  if (numbers && numbers.length > 0) {
    // Если есть только одно число, считаем его минутами
    if (numbers.length === 1) {
      return parseInt(numbers[0])
    }
    // Если есть два числа, первое - часы, второе - минуты
    if (numbers.length >= 2) {
      return parseInt(numbers[0]) * 60 + parseInt(numbers[1])
    }
  }
  
  return 0
}

/**
 * Определяет цвет строки на основе времени обработки
 */
export const getRowColor = (processingTime: string | null, highlightEnabled: boolean): string => {
  if (!highlightEnabled) return 'hover:bg-gray-50'
  
  const minutes = parseProcessingTime(processingTime)
  
  if (minutes > 30) {
    return 'bg-red-50 hover:bg-red-100'
  } else if (minutes > 20) {
    return 'bg-yellow-50 hover:bg-yellow-100'
  }
  
  return 'hover:bg-gray-50'
}

/**
 * Константы для цветового выделения
 */
export const TIME_THRESHOLDS = {
  WARNING: 20, // минуты
  CRITICAL: 30, // минуты
} as const

/**
 * Фильтрует заказы, оставляя только проблемные (20+ минут)
 */
export const filterProblemOrders = (orders: Order[], filterEnabled: boolean) => {
  if (!filterEnabled) {
    return orders
  }
  
  return orders.filter(order => {
    const processingTime = order.time_between_messages
    const minutes = parseProcessingTime(processingTime)
    return minutes >= TIME_THRESHOLDS.WARNING
  })
}
