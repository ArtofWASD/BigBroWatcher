'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  PaginationState,
  ColumnOrderState,
} from '@tanstack/react-table'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useOrders } from '@/hooks/useOrders'
import { getRowColor, filterOrdersByDateRange, DateRange } from '@/lib/timeUtils'
import { columns, initialColumnOrder } from '@/lib/tableColumns'
import { DraggableColumnHeader } from '@/components/DraggableColumnHeader'
import { HighlightToggle } from '@/components/HighlightToggle'
import { DateFilter } from '@/components/DateFilter'
import { AnalyticsToggle } from '@/components/AnalyticsToggle'
import { TablePagination } from '@/components/TablePagination'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { Instructions } from '@/components/Instructions'
import { OrdersChart } from '@/components/OrdersChart'



export default function Home() {
  const { orders, loading, error, refetch } = useOrders()
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [highlightEnabled, setHighlightEnabled] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([...initialColumnOrder])
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)

  // Оптимизированный обработчик для тогглера
  const handleHighlightToggle = useCallback((enabled: boolean) => {
    setHighlightEnabled(enabled)
  }, [])

  const handleDateRangeChange = useCallback((newDateRange: DateRange) => {
    setDateRange(newDateRange)
    // Сбрасываем пагинацию при изменении фильтра
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }, [])

  // Настройка сенсоров для drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Обработчик клика по подразделению в графике
  const handleDepartmentClick = useCallback((department: string) => {
    setSelectedDepartment(department === selectedDepartment ? null : department)
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }, [selectedDepartment])

  // Обработчик переключения аналитики
  const handleAnalyticsToggle = useCallback(() => {
    setShowAnalytics(!showAnalytics)
  }, [showAnalytics])

  // Применяем все фильтры последовательно
  const filteredOrders = useMemo(() => {
    let result = orders
    
    // Фильтруем по датам
    result = filterOrdersByDateRange(result, dateRange)
    
    // Фильтруем по выбранному подразделению
    if (selectedDepartment) {
      result = result.filter(order => order.department === selectedDepartment)
    }
    
    return result
  }, [orders, dateRange, selectedDepartment])

  const table = useReactTable({
    data: filteredOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      pagination,
      columnOrder,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnOrderChange: setColumnOrder,
  })

  // Обработчик завершения перетаскивания
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = columnOrder.indexOf(active.id as string)
      const newIndex = columnOrder.indexOf(over?.id as string)

      const newColumnOrder = arrayMove(columnOrder, oldIndex, newIndex)
      setColumnOrder(newColumnOrder)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Таблица заказов
          </h1>
          
          <div className="flex items-center gap-4">
            <AnalyticsToggle 
              showAnalytics={showAnalytics}
              onToggle={handleAnalyticsToggle}
            />
            
            <DateFilter 
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
            />
            
            <HighlightToggle 
              highlightEnabled={highlightEnabled} 
              onHighlightToggle={handleHighlightToggle}
            />
          </div>
        </div>
        
        {showAnalytics && (
          <div className="mb-8">
            <OrdersChart 
              orders={filteredOrders} 
              onDepartmentClick={handleDepartmentClick}
              selectedDepartment={selectedDepartment}
              dateRange={dateRange}
            />
          </div>
        )}
        
        {selectedDepartment && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Фильтр по подразделению: <strong>{selectedDepartment}</strong>
            </span>
            <button
              onClick={() => setSelectedDepartment(null)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Сбросить
            </button>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      <SortableContext
                        items={headerGroup.headers.map(header => header.id)}
                        strategy={horizontalListSortingStrategy}
                      >
                        {headerGroup.headers.map(header => (
                          <DraggableColumnHeader key={header.id} header={header} />
                        ))}
                      </SortableContext>
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.map(row => {
                    const rowColor = getRowColor(row.original.time_between_messages, highlightEnabled)
                    return (
                      <tr 
                        key={row.id} 
                        className={rowColor}
                      >
                        {row.getVisibleCells().map(cell => {
                          // Для разных колонок используем разные стили
                          const isStatusColumn = cell.column.id === 'current_order_status'
                          const isTimeColumn = cell.column.id === 'time_between_messages'
                          const isOrderIdColumn = cell.column.id === 'order_id'
                          
                          let cellClassName = "px-6 py-4 text-sm text-gray-900"
                          
                          if (isStatusColumn) {
                            cellClassName += " w-72 min-w-72" // Увеличиваем ширину для статуса (288px)
                          } else if (isTimeColumn) {
                            cellClassName += " w-32 max-w-32" // Уменьшаем ширину для времени обработки (128px)
                          } else if (isOrderIdColumn) {
                            cellClassName += " w-28 max-w-28" // Уменьшаем ширину для номера заказа (112px)
                          } else {
                            cellClassName += " whitespace-nowrap"
                          }
                          
                          return (
                            <td
                              key={cell.id}
                              className={cellClassName}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </DndContext>
          </div>
          
          <TablePagination table={table} />
        </div>
        
        <Instructions />
      </div>
    </div>
  )
}
