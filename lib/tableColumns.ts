import { createColumnHelper } from '@tanstack/react-table'
import { parseProcessingTime } from './timeUtils'
import type { Order } from '@/types/database'

// Создаем helper для колонок
const columnHelper = createColumnHelper<Order>()

// Определяем колонки
export const columns = [
  columnHelper.accessor('order_id', {
    id: 'order_id',
    header: 'Номер заказа',
    cell: info => info.getValue() || '-',
  }),
  columnHelper.accessor('order_first_time', {
    id: 'order_first_time',
    header: 'Время первого заказа',
    cell: info => info.getValue() || '-',
  }),
  columnHelper.accessor('order_second_time', {
    id: 'order_second_time',
    header: 'Время второго заказа',
    cell: info => info.getValue() || '-',
  }),
  columnHelper.accessor('time_between_messages', {
    id: 'time_between_messages',
    header: 'Время обработки заказа',
    cell: info => info.getValue() || '-',
    sortingFn: (rowA, rowB) => {
      const timeA = parseProcessingTime(rowA.getValue('time_between_messages'))
      const timeB = parseProcessingTime(rowB.getValue('time_between_messages'))
      return timeA - timeB
    },
  }),
  columnHelper.accessor('department', {
    id: 'department',
    header: 'Подразделение',
    cell: info => info.getValue() || '-',
  }),
]

// Начальный порядок колонок
export const initialColumnOrder = [
  'order_id',
  'order_first_time', 
  'order_second_time',
  'time_between_messages',
  'department'
] as const 