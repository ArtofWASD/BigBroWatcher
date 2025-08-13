import { useState, useMemo } from 'react'
import {
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
  type PaginationState,
  type ColumnOrderState,
} from '@tanstack/react-table'
import { columns, initialColumnOrder } from '@/lib/tableColumns'
import type { Order } from '@/types/database'
import { filterOrdersByDateRange, type DateRange } from '@/lib/timeUtils'

export function useOrderTable(orders: Order[], dateRange: DateRange, selectedDepartment: string | null) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([...initialColumnOrder])

  // Apply filters
  const filteredOrders = useMemo(() => {
    let result = orders
    
    // Filter by date range
    result = filterOrdersByDateRange(result, dateRange)
    
    // Filter by selected department
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

  return {
    table,
    sorting,
    setSorting,
    pagination,
    setPagination,
    columnOrder,
    setColumnOrder,
    filteredOrders,
  }
}