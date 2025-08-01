'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { flexRender } from '@tanstack/react-table'
import type { Header } from '@tanstack/react-table'
import type { Order } from '@/types/database'

interface DraggableColumnHeaderProps {
  header: Header<Order, unknown>
}

export function DraggableColumnHeader({ header }: DraggableColumnHeaderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: header.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <th
      ref={setNodeRef}
      style={style}
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={header.column.getToggleSortingHandler()}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2">
        <div className="cursor-grab active:cursor-grabbing mr-2">
          ⋮⋮
        </div>
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
  )
} 