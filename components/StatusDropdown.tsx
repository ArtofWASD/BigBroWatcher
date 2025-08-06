'use client'

import { useState } from 'react'

interface StatusDropdownProps {
  currentStatus: string | null
  allStatuses?: string[]
}

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

  // Если нет статусов для отображения, показываем только текущий
  if (!allStatuses.length) {
    return <span>{currentStatus || '-'}</span>
  }

  // Убираем дубликаты и фильтруем пустые значения
  const uniqueStatuses = Array.from(new Set(allStatuses.filter(Boolean)))

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-1 text-left bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className="truncate">{currentStatus || '-'}</span>
        <ChevronDownIcon 
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
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
              {uniqueStatuses.map((status, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                    status === currentStatus 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-900'
                  }`}
                >
                  {status}
                  {status === currentStatus && (
                    <span className="ml-2 text-xs text-blue-500">(текущий)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
