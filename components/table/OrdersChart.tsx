'use client'

import { useMemo, useState } from 'react'
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
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import type { Order } from '@/types/database'
import { parseProcessingTime, DateRange } from '@/lib/timeUtils'
import { OrdersChartProps, ChartData } from '@/types/table'

export function OrdersChart({ orders, onDepartmentClick, dateRange }: OrdersChartProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  // Функция для переключения состояния
  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }
  
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

      // Подсчет отмененных заказов
      let cancelledCount = 0

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

        // Проверяем, есть ли статус "Отменен" в массиве статусов
        if (order.current_order_status && Array.isArray(order.current_order_status)) {
          if (order.current_order_status.some(status => 
            status && status.toLowerCase().includes('отменен')
          )) {
            cancelledCount++
          }
        }
      })

      return {
        department,
        ...timeCategories,
        total: departmentOrders.length,
        cancelled: cancelledCount,
      }
    })

    // Сортируем по общему количеству заказов (по убыванию)
    return data.sort((a, b) => b.total - a.total)
  }, [orders])

  // Расчет сумм выполненных и отмененных заказов
  const orderAmounts = useMemo(() => {
    let completedAmount = 0
    let cancelledAmount = 0
    
    orders.forEach(order => {
      // Проверяем, что order_amount не null
      if (order.order_amount !== null) {
        // Проверяем статус заказа (предполагаем, что статусы могут быть в массиве current_order_status)
        const statuses = order.current_order_status || []
        
        // Проверяем, есть ли статус, указывающий на выполнение или отмену
        // Для выполненных заказов проверяем статусы, содержащие "Выполнен" (игнорируем регистр)
        const isCompleted = statuses.some(status => 
          status && status.toLowerCase().includes('выполнен')
        )
        
        // Для отмененных заказов проверяем статусы, содержащие "Отменен" (игнорируем регистр)
        const isCancelled = statuses.some(status => 
          status && status.toLowerCase().includes('отменен')
        )
        
        if (isCompleted) {
          completedAmount += order.order_amount
        } else if (isCancelled) {
          cancelledAmount += order.order_amount
        }
      }
    })
    
    return {
      completedAmount,
      cancelledAmount
    }
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
      // Найдем данные для текущего подразделения
      const departmentData = chartData.find(item => item.department === label)
      const total = payload.reduce((sum: number, entry: TooltipPayload) => sum + entry.value, 0)
      const cancelled = departmentData ? departmentData.cancelled : 0
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{`${label}`}</p>
          <p className="text-sm text-gray-600 mb-1">{`Всего заказов: ${total}`}</p>
          <p className="text-sm text-gray-600 mb-2">{`Отменено: ${cancelled}`}</p>
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

  // Подсчет заказов для "Возрождение" и остальных филиалов
  const vozrozhdenieTotalOrders = useMemo(() => {
    return orders.filter(order => order.department === 'Возрождение').length
  }, [orders])

  const otherDepartmentsTotalOrders = useMemo(() => {
    return orders.filter(order => order.department !== 'Возрождение').length
  }, [orders])

  // Подсчет отмененных заказов
  const cancelledOrdersCount = useMemo(() => {
    return orders.filter(order => {
      // Проверяем, есть ли статус "Отменен" в массиве статусов
      if (order.current_order_status && Array.isArray(order.current_order_status)) {
        return order.current_order_status.some(status => 
          status && status.toLowerCase().includes('отменен')
        )
      }
      return false
    }).length
  }, [orders])

  // Обработчик клика по столбцу
  const handleBarClick = (data: { payload?: ChartData }) => {
    if (onDepartmentClick && data && data.payload) {
      onDepartmentClick(data.payload.department)
    }
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Распределение заказов по подразделениям
          </h2>
          <button
            onClick={toggleExpand}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label={isExpanded ? "Свернуть" : "Развернуть"}
          >
            {isExpanded ? (
              <MinusIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <PlusIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-500">
          Нет данных для отображения
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Распределение заказов по подразделениям и времени обработки {formatDateRange(dateRange)}
        </h2>
        <button
          onClick={toggleExpand}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          aria-label={isExpanded ? "Свернуть" : "Развернуть"}
        >
          {isExpanded ? (
            <MinusIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <PlusIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>
      
      {isExpanded && (
        <>
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
          
          <div className="mt-2 text-sm text-gray-600">
            <div className="flex flex-wrap gap-4">
              <p><span className='font-bold'>Возрождение:</span> {vozrozhdenieTotalOrders} заказов</p>
              <p><span className='font-bold'>Магазины</span>: {otherDepartmentsTotalOrders} заказов</p>
              <p><span className='font-bold'>Отменено</span>: {cancelledOrdersCount} заказов</p>
              <p><span className='font-bold'>Сумма выполненных</span>: {orderAmounts.completedAmount.toFixed(2)} ₽</p>
              <p><span className='font-bold'>Сумма отмененных</span>: {orderAmounts.cancelledAmount.toFixed(2)} ₽</p>
            </div>
            <p className="mt-1">График показывает распределение заказов по подразделениям с разбивкой по времени обработки.</p>
            <p>Подразделения отсортированы по общему количеству заказов.</p>
          </div>
        </>
      )}
    </div>
  )
}
