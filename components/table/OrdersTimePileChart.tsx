'use client'

import { useMemo, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import type { Order } from '@/types/database'
import { parseProcessingTime } from '@/lib/timeUtils'

interface PieChartData {
  name: string
  value: number
  color: string
}

interface PieChartComponentProps {
  orders: Order[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: {
    payload: PieChartData
  }[]
}

const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444']

export function OrdersTimePileChart({ orders }: PieChartComponentProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  // Функция для переключения состояния
  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }
  
  const pieData = useMemo(() => {
    // Подсчет заказов по категориям времени обработки
    const timeCategories = {
      'До 10 мин': 0,
      '10-20 мин': 0,
      '20-30 мин': 0,
      'Более 30 мин': 0,
    }

    orders.forEach(order => {
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

    // Преобразуем в формат для диаграммы
    const data: PieChartData[] = [
      { name: 'До 10 мин', value: timeCategories['До 10 мин'], color: COLORS[0] },
      { name: '10-20 мин', value: timeCategories['10-20 мин'], color: COLORS[1] },
      { name: '20-30 мин', value: timeCategories['20-30 мин'], color: COLORS[2] },
      { name: 'Более 30 мин', value: timeCategories['Более 30 мин'], color: COLORS[3] },
    ]

    // Фильтруем пустые категории
    return data.filter(item => item.value > 0)
  }, [orders])

  // Кастомный тултип
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">{`${data.value} заказов`}</p>
        </div>
      )
    }
    return null
  }

  // Кастомная метка
  const renderCustomizedLabel = (props: { 
    cx: number; 
    cy: number; 
    midAngle?: number; 
    innerRadius: number; 
    outerRadius: number; 
    percent?: number;
  }) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    
    // Проверяем, что необходимые значения существуют
    if (midAngle === undefined || percent === undefined) {
      return null;
    }

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180)
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (pieData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Распределение заказов по времени обработки
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

  // Подсчет общего количества заказов
  const totalOrders = pieData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Распределение заказов по времени обработки
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
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            <p>Всего заказов: {totalOrders}</p>
            <p>Диаграмма показывает доли заказов по времени обработки.</p>
          </div>
        </>
      )}
    </div>
  )
}