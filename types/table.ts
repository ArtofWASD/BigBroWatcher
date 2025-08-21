import type { Header } from '@tanstack/react-table'
import type { Order } from '@/types/database'
import type { DateRange } from '@/lib/timeUtils'
import type { Table } from '@tanstack/react-table'

export interface DraggableColumnHeaderProps {
  header: Header<Order, unknown>
}

export interface OrdersChartProps {
  orders: Order[]
  onDepartmentClick?: (department: string) => void
  dateRange?: DateRange
}

export interface ChartData {
  department: string
  'До 10 мин': number
  '10-20 мин': number
  '20-30 мин': number
  'Более 30 мин': number
  total: number
  cancelled: number
}

export interface PieChartData {
  name: string
  value: number
  color: string
}

export interface PieChartComponentProps {
  orders: Order[]
}

export interface CustomTooltipProps {
  active?: boolean
  payload?: {
    payload: PieChartData
  }[]
}

export interface StatusDropdownProps {
  currentStatus: string[] | null
  allStatuses?: string[]
}

export interface TablePaginationProps {
  table: Table<Order>
}