'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { Order } from '@/types/database'
import { parseProcessingTime, DateRange } from '@/lib/timeUtils'

interface OrdersChartProps {
  orders: Order[]
  onDepartmentClick?: (department: string) => void
  selectedDepartment?: string | null
  dateRange?: DateRange
}

interface ChartData {
  department: string
  'До 10 мин': number
  '10-20 мин': number
  '20-30 мин': number
  'Более 30 мин': number
  total: number
}

export function OrdersChart({ orders, onDepartmentClick, selectedDepartment, dateRange }: OrdersChartProps) {
  // Функция для форматирования диапазона дат
  const formatDateRange = (dateRange?: DateRange): string => {
    if (!dateRange || (!dateRange.startDate && !dateRange.endDate)) {
      return 'за всё время'
    }
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    if (dateRange.startDate && dateRange.endDate) {
      return `с ${formatDate(dateRange.startDate)} по ${formatDate(dateRange.endDate)}`
    } else if (dateRange.startDate) {
      return `с ${formatDate(dateRange.startDate)}`
    } else if (dateRange.endDate) {
      return `по ${formatDate(dateRange.endDate)}`
    }
    
    return 'за всё время'
  }

  const chartData = useMemo(() => {
    // Группируем заказы по подразделениям
    const departmentGroups = orders.reduce((acc, order) => {
      const department = order.department || 'Не указано'
      if (!acc[department]) {
        acc[department] = []
      }
      acc[department].push(order)
      return acc
    }, {} as Record<string, Order[]>)

    // Создаем данные для графика
    const data: ChartData[] = Object.entries(departmentGroups).map(([department, departmentOrders]) => {
      const timeCategories = {
        'До 10 мин': 0,
        '10-20 мин': 0,
        '20-30 мин': 0,
        'Более 30 мин': 0,
      }

      departmentOrders.forEach(order => {
        const minutes = parseProcessingTime(order.time_between_messages)
        
        if (minutes < 10) {
          timeCategories['До 10 мин']++
        } else if (minutes < 20) {
          timeCategories['10-20 мин']++
        } else if (minutes < 30) {
          timeCategories['20-30 мин']++
        } else {
          timeCategories['Более 30 мин']++
        }
      })

      return {
        department,
        ...timeCategories,
        total: departmentOrders.length,
      }
    })

    // Сортируем по общему количеству заказов (по убыванию)
    return data.sort((a, b) => b.total - a.total)
  }, [orders])

  interface TooltipPayload {
    value: number
    dataKey: string
    color: string
  }

  interface TooltipProps {
    active?: boolean
    payload?: TooltipPayload[]
    label?: string
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: TooltipPayload) => sum + entry.value, 0)
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{`${label}`}</p>
          <p className="text-sm text-gray-600 mb-2">{`Всего заказов: ${total}`}</p>
          {payload.map((entry: TooltipPayload, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value} заказов`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Обработчик клика по столбцу
  const handleBarClick = (data: { payload?: ChartData }) => {
    if (onDepartmentClick && data && data.payload) {
      onDepartmentClick(data.payload.department)
    }
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Распределение заказов по подразделениям
        </h2>
        <div className="flex items-center justify-center h-64 text-gray-500">
          Нет данных для отображения
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Распределение заказов по подразделениям и времени обработки {formatDateRange(dateRange)}
      </h2>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="department" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              fontSize={12}
              stroke="#666"
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
            />
            
            <Bar 
              dataKey="До 10 мин" 
              stackId="a" 
              fill="#10b981" 
              name="До 10 мин"
              radius={[0, 0, 0, 0]}
              onClick={handleBarClick}
              style={{ cursor: onDepartmentClick ? 'pointer' : 'default' }}
            />
            <Bar 
              dataKey="10-20 мин" 
              stackId="a" 
              fill="#f59e0b" 
              name="10-20 мин"
              radius={[0, 0, 0, 0]}
              onClick={handleBarClick}
              style={{ cursor: onDepartmentClick ? 'pointer' : 'default' }}
            />
            <Bar 
              dataKey="20-30 мин" 
              stackId="a" 
              fill="#f97316" 
              name="20-30 мин"
              radius={[0, 0, 0, 0]}
              onClick={handleBarClick}
              style={{ cursor: onDepartmentClick ? 'pointer' : 'default' }}
            />
            <Bar 
              dataKey="Более 30 мин" 
              stackId="a" 
              fill="#ef4444" 
              name="Более 30 мин"
              radius={[2, 2, 0, 0]}
              onClick={handleBarClick}
              style={{ cursor: onDepartmentClick ? 'pointer' : 'default' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>График показывает распределение заказов по подразделениям с разбивкой по времени обработки.</p>
        <p>Подразделения отсортированы по общему количеству заказов.</p>
      </div>
    </div>
  )
}
