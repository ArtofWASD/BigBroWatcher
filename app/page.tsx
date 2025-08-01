'use client'

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  PaginationState,
} from '@tanstack/react-table'
import { useOrders } from '@/hooks/useOrders'
import type { Order } from '@/types/database'

// Функция для конвертации времени обработки в минуты для сортировки
const parseProcessingTime = (time: string | null): number => {
  if (!time) return 0
  
  const match = time.match(/(\d+)ч\s*(\d+)?мин/)
  if (match) {
    const hours = parseInt(match[1])
    const minutes = match[2] ? parseInt(match[2]) : 0
    return hours * 60 + minutes
  }
  // Обработка случая только минут
  const minutesMatch = time.match(/(\d+)мин/)
  if (minutesMatch) {
    return parseInt(minutesMatch[1])
  }
  return 0
}

// Функция для определения цвета строки на основе времени обработки
const getRowColor = (processingTime: string | null, highlightEnabled: boolean): string => {
  if (!highlightEnabled) return 'hover:bg-gray-50'
  
  const minutes = parseProcessingTime(processingTime)
  
  if (minutes > 30) {
    return 'bg-red-50 hover:bg-red-100'
  } else if (minutes > 20) {
    return 'bg-yellow-50 hover:bg-yellow-100'
  }
  
  return 'hover:bg-gray-50'
}

// Создаем helper для колонок
const columnHelper = createColumnHelper<Order>()

// Определяем колонки
const columns = [
  columnHelper.accessor('order_id', {
    header: 'Номер заказа',
    cell: info => info.getValue() || '-',
  }),
  columnHelper.accessor('order_first_time', {
    header: 'Время первого заказа',
    cell: info => info.getValue() || '-',
  }),
  columnHelper.accessor('order_second_time', {
    header: 'Время второго заказа',
    cell: info => info.getValue() || '-',
  }),
  columnHelper.accessor('time_between_messages', {
    header: 'Время обработки заказа',
    cell: info => info.getValue() || '-',
    sortingFn: (rowA, rowB) => {
      const timeA = parseProcessingTime(rowA.getValue('time_between_messages'))
      const timeB = parseProcessingTime(rowB.getValue('time_between_messages'))
      return timeA - timeB
    },
  }),
  columnHelper.accessor('department', {
    header: 'Подразделение',
    cell: info => info.getValue() || '-',
  }),
]

export default function Home() {
  const { orders, loading, error, refetch } = useOrders()
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })
  const [highlightEnabled, setHighlightEnabled] = useState(false)

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка данных...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Ошибка загрузки данных</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={refetch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Таблица заказов
          </h1>
          
          {/* Кнопка-переключатель для выделения */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Выделение по времени:</span>
              <button
                onClick={() => setHighlightEnabled(!highlightEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  highlightEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    highlightEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {/* Легенда */}
            {highlightEnabled && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                  <span>20-30 мин</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-200 rounded"></div>
                  <span>&gt;30 мин</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() === 'asc' && (
                            <span className="text-gray-400">↑</span>
                          )}
                          {header.column.getIsSorted() === 'desc' && (
                            <span className="text-gray-400">↓</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id} 
                    className={getRowColor(row.original.time_between_messages, highlightEnabled)}
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
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Пагинация */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Предыдущая
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Следующая
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex gap-x-2 items-baseline">
                <span className="text-sm text-gray-700">
                  Показано{' '}
                  <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span>
                  {' '}до{' '}
                  <span className="font-medium">
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                      table.getFilteredRowModel().rows.length
                    )}
                  </span>
                  {' '}из{' '}
                  <span className="font-medium">{table.getFilteredRowModel().rows.length}</span>
                  {' '}результатов
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Строк на странице:</span>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={e => {
                      table.setPageSize(Number(e.target.value))
                    }}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[5, 10, 15, 20].map(pageSize => (
                      <option key={pageSize} value={pageSize}>
                        {pageSize}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Первая страница</span>
                    &laquo;
                  </button>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Предыдущая страница</span>
                    &lsaquo;
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Следующая страница</span>
                    &rsaquo;
                  </button>
                  <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Последняя страница</span>
                    &raquo;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Нажмите на заголовки колонок &ldquo;Время обработки заказа&rdquo; или &ldquo;Подразделение&rdquo; для сортировки</p>
          <p className="mt-1">Используйте переключатель для включения выделения строк по времени обработки</p>
        </div>
      </div>
    </div>
  )
}
