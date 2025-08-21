'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { DateFilterProps } from '@/types/table-controls'

export function DateFilter({ onDateRangeChange, dateRange }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleStartDateChange = useCallback((date: string) => {
    onDateRangeChange({
      ...dateRange,
      startDate: date || null
    })
  }, [dateRange, onDateRangeChange])

  const handleEndDateChange = useCallback((date: string) => {
    onDateRangeChange({
      ...dateRange,
      endDate: date || null
    })
  }, [dateRange, onDateRangeChange])

  const clearDateRange = useCallback(() => {
    onDateRangeChange({
      startDate: null,
      endDate: null
    })
    setIsOpen(false)
  }, [onDateRangeChange])

  const hasActiveFilter = dateRange.startDate || dateRange.endDate

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Форматирование даты для отображения
  const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  const getButtonText = () => {
    if (dateRange.startDate && dateRange.endDate) {
      return `${formatDateForDisplay(dateRange.startDate)} - ${formatDateForDisplay(dateRange.endDate)}`
    } else if (dateRange.startDate) {
      return `с ${formatDateForDisplay(dateRange.startDate)}`
    } else if (dateRange.endDate) {
      return `до ${formatDateForDisplay(dateRange.endDate)}`
    }
    return 'Выберите период'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-all duration-200 min-w-[180px] justify-between ${
          hasActiveFilter
            ? 'border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100 shadow-sm'
            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400'
        }`}
      >
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{getButtonText()}</span>
        </div>
        {hasActiveFilter && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              clearDateRange()
            }}
            className="ml-2 p-0.5 rounded-full hover:bg-blue-200 transition-colors"
            title="Очистить фильтр"
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  От
                </label>
                <input
                  type="date"
                  value={dateRange.startDate || ''}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  До
                </label>
                <input
                  type="date"
                  value={dateRange.endDate || ''}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  min={dateRange.startDate || undefined}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {hasActiveFilter && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={clearDateRange}
                  className="w-full px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Очистить фильтр
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
