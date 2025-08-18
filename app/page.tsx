'use client'

import { useCallback } from 'react'
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
import { useOrderTable } from '@/hooks/useOrderTable'
import { getRowColor } from '@/lib/timeUtils'
import { DraggableColumnHeader } from '@/components/DraggableColumnHeader'
import { HighlightToggle } from '@/components/HighlightToggle'
import { DateFilter } from '@/components/DateFilter'
import { AnalyticsToggle } from '@/components/AnalyticsToggle'
import { TablePagination } from '@/components/TablePagination'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { Instructions } from '@/components/Instructions'
import { OrdersChart } from '@/components/OrdersChart'
import { StatusDropdown } from '@/components/StatusDropdown'
import { useAppContext } from '@/contexts/AppContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { orders, loading, error, refetch } = useOrders()
  const {
    highlightEnabled,
    dateRange,
    setDateRange,
    showAnalytics,
    toggleAnalytics,
    selectedDepartment,
    setSelectedDepartment,
    user,
    loading: userLoading,
  } = useAppContext()
  
  const router = useRouter()

  // Memoized handlers
  const handleDateRangeChange = useCallback((newDateRange: { startDate: string | null; endDate: string | null }) => {
    setDateRange(newDateRange)
  }, [setDateRange])

  const {
    table,
    columnOrder,
    setColumnOrder,
  } = useOrderTable(orders, dateRange, selectedDepartment)

  // Setup sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handler for department click in chart
  const handleDepartmentClick = useCallback((department: string) => {
    setSelectedDepartment(department === selectedDepartment ? null : department)
  }, [selectedDepartment, setSelectedDepartment])

  // Handler for drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = columnOrder.indexOf(active.id as string)
      const newIndex = columnOrder.indexOf(over?.id as string)

      const newColumnOrder = arrayMove(columnOrder, oldIndex, newIndex)
      setColumnOrder(newColumnOrder)
    }
  }
  
  // Handler for logout
  const handleLogout = async () => {
    try {
      // Используем серверный endpoint для выхода
      window.location.href = '/api/logout'
    } catch (error) {
      console.error('Unexpected logout error:', error)
    }
  }
  
  // Показываем состояние загрузки, если данные пользователя еще загружаются
  if (userLoading) {
    return <LoadingState />
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
            {user && (
              <div className="text-sm text-gray-700">
                Привет, {user.email}
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Выйти
            </button>
            
            <AnalyticsToggle 
              showAnalytics={showAnalytics}
              onToggle={toggleAnalytics}
            />
            
            <DateFilter 
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
            />
            
            <HighlightToggle 
              highlightEnabled={highlightEnabled} 
              onHighlightToggle={() => {}} // Handled by context
            />
          </div>
        </div>
        
        {showAnalytics && (
          <div className="mb-8">
            <OrdersChart 
              orders={table.getFilteredRowModel().rows.map(row => row.original)} 
              onDepartmentClick={handleDepartmentClick}
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
                          // For different columns we use different styles
                          const isStatusColumn = cell.column.id === 'current_order_status'
                          const isTimeColumn = cell.column.id === 'time_between_messages'
                          const isOrderIdColumn = cell.column.id === 'order_id'
                          
                          let cellClassName = "px-6 py-4 text-sm text-gray-900"
                          
                          if (isStatusColumn) {
                            cellClassName += " w-72 min-w-72" // Increase width for status (288px)
                          } else if (isTimeColumn) {
                            cellClassName += " w-32 max-w-32" // Reduce width for processing time (128px)
                          } else if (isOrderIdColumn) {
                            cellClassName += " w-28 max-w-28" // Reduce width for order ID (112px)
                          } else {
                            cellClassName += " whitespace-nowrap"
                          }
                          
                          return (
                            <td
                              key={cell.id}
                              className={cellClassName}
                            >
                              {isStatusColumn ? (
                                <div className="max-w-full">
                                  <StatusDropdown 
                                    currentStatus={row.original.current_order_status}
                                    allStatuses={row.original.all_statuses}
                                  />
                                </div>
                              ) : (
                                String(cell.renderValue() ?? '-')
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
