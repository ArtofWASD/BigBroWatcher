'use client'

import { useState } from 'react'
import { StatusDropdownProps } from '@/types/table'

// Простая SVG иконка стрелки вниз
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

export function StatusDropdown({ currentStatus, allStatuses = [] }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Теперь currentStatus уже массив, просто проверяем и фильтруем
  const statusArray = currentStatus ? currentStatus.filter(Boolean) : null
  
  // Получаем только последний (текущий) статус для отображения
  const currentStatusDisplay = statusArray && statusArray.length > 0 ? statusArray[statusArray.length - 1] : null

  // Если нет статусов для отображения, показываем прочерк
  if (!currentStatusDisplay) {
    return (
      <div className="max-w-full">
        <span className="text-sm leading-relaxed break-words">-</span>
      </div>
    )
  }

  // Используем allStatuses если есть, иначе fallback на statusArray
  const effectiveAllStatuses = allStatuses && allStatuses.length > 0 ? allStatuses : (statusArray || []);
  
  // Убираем дубликаты и фильтруем пустые значения
  const uniqueStatuses = Array.from(new Set(effectiveAllStatuses.filter(Boolean)))
  
  // Всегда показываем выпадающее меню если у нас есть статусы
  // Даже если всего один статус, показываем его в выпадающем меню для единообразия

  // Сортируем статусы так, чтобы текущий был наверху
  const sortedStatuses = uniqueStatuses.sort((a, b) => {
    const aIsCurrent = a === currentStatusDisplay
    const bIsCurrent = b === currentStatusDisplay
    
    if (aIsCurrent && !bIsCurrent) return -1
    if (!aIsCurrent && bIsCurrent) return 1
    return 0
  })

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-1 text-left bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[2.5rem]"
      >
        <div className="text-sm leading-relaxed break-words flex-1 pr-2">
          <div className="py-0.5">
            {currentStatusDisplay}
          </div>
        </div>
        <ChevronDownIcon 
          className={`ml-2 h-4 w-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay для закрытия при клике вне */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Выпадающее меню */}
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="py-1">
              {sortedStatuses.map((status, index) => {
                const isCurrentStatus = status === currentStatusDisplay
                return (
                  <div
                    key={index}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                      isCurrentStatus 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-900'
                    }`}
                  >
                    {status}
                    {isCurrentStatus && (
                      <span className="ml-2 text-xs text-blue-500">(текущий)</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
