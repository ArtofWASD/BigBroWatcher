'use client'

import type { Table } from '@tanstack/react-table'
import type { Order } from '@/types/database'

interface TablePaginationProps {
  table: Table<Order>
}

export function TablePagination({ table }: TablePaginationProps) {
  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      {/* Мобильная пагинация */}
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

      {/* Десктопная пагинация */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div className="flex gap-x-2 items-baseline">
          <span className="text-sm text-gray-700">
            Показано{' '}
            <span className="font-medium">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>
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
          {/* Выбор количества строк на странице */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Строк на странице:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => {
                const value = e.target.value
                if (value === 'all') {
                  const totalRows = table.getFilteredRowModel().rows.length
                  table.setPageSize(Math.max(totalRows, 1))
                } else {
                  table.setPageSize(Number(value))
                }
              }}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[10, 20, 30].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
              <option value="all">Все</option>
            </select>
          </div>

          {/* Кнопки навигации */}
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
            
            {/* Номера страниц */}
            {(() => {
              const currentPage = table.getState().pagination.pageIndex
              const totalPages = table.getPageCount()
              const pages: React.ReactElement[] = []
              
              // Если нет страниц, не отображаем номера
              if (totalPages === 0) {
                return pages
              }
              
              // Логика для отображения номеров страниц
              const maxVisiblePages = 5
              let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2))
              const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1)
              
              // Корректируем начальную страницу, если достигли конца
              if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(0, endPage - maxVisiblePages + 1)
              }
              
              // Добавляем многоточие в начале, если нужно
              if (startPage > 0) {
                pages.push(
                  <button
                    key={0}
                    onClick={() => table.setPageIndex(0)}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    1
                  </button>
                )
                if (startPage > 1) {
                  pages.push(
                    <span key="start-ellipsis" className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  )
                }
              }
              
              // Добавляем видимые страницы
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => table.setPageIndex(i)}
                    className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${
                      i === currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              }
              
              // Добавляем многоточие в конце, если нужно
              if (endPage < totalPages - 1) {
                if (endPage < totalPages - 2) {
                  pages.push(
                    <span key="end-ellipsis" className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  )
                }
                pages.push(
                  <button
                    key={totalPages - 1}
                    onClick={() => table.setPageIndex(totalPages - 1)}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {totalPages}
                  </button>
                )
              }
              
              return pages
            })()}
            
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
  )
}
