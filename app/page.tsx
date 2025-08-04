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
import { getRowColor, filterProblemOrders } from '@/lib/timeUtils'
import { columns, initialColumnOrder } from '@/lib/tableColumns'
import { DraggableColumnHeader } from '@/components/DraggableColumnHeader'
import { HighlightToggle } from '@/components/HighlightToggle'
import { TablePagination } from '@/components/TablePagination'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { Instructions } from '@/components/Instructions'



export default function Home() {
  const { orders, loading, error, refetch } = useOrders()
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [highlightEnabled, setHighlightEnabled] = useState(false)
  const [filterEnabled, setFilterEnabled] = useState(false)
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([...initialColumnOrder])

  // Оптимизированные обработчики для тогглеров
  const handleHighlightToggle = useCallback((enabled: boolean) => {
    setHighlightEnabled(enabled)
  }, [])

  const handleFilterToggle = useCallback((enabled: boolean) => {
    setFilterEnabled(enabled)
  }, [])

  // Настройка сенсоров для drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Фильтруем данные если включен фильтр проблемных заказов
  const filteredOrders = useMemo(() => {
    return filterProblemOrders(orders, filterEnabled)
  }, [orders, filterEnabled])

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
          
          <HighlightToggle 
            highlightEnabled={highlightEnabled} 
            onHighlightToggle={handleHighlightToggle}
            filterEnabled={filterEnabled}
            onFilterToggle={handleFilterToggle}
          />
        </div>
        
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
                        {row.getVisibleCells().map(cell => (
                          <td
                            key={cell.id}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
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
