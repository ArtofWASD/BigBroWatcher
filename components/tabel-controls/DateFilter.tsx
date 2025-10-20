'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { DateFilterProps } from '@/types/table-controls'

export function DateFilter({ onDateRangeChange, dateRange }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Функция для получения дат для быстрого выбора
  const getQuickRange = (rangeType: 'week' | 'month' | 'quarter') => {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (rangeType) {
      case 'week':
        // Текущая неделя (понедельник до воскресенья)
        const dayOfWeek = now.getDay() // Воскресенье = 0, Понедельник = 1, ..., Суббота = 6
        // Рассчитываем понедельник текущей недели
        // Чтобы получить понедельник, нужно отнять (dayOfWeek - 1) дней
        // Но если сегодня воскресенье (dayOfWeek = 0), то нужно отнять 6 дней
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        startDate = new Date(now)
        startDate.setDate(now.getDate() - daysToSubtract)
        // Рассчитываем воскресенье текущей недели (6 дней после понедельника)
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        break
      case 'month':
        // Текущий месяц
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'quarter':
        // Последний квартал (текущий квартал)
        const currentMonth = now.getMonth()
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3
        startDate = new Date(now.getFullYear(), quarterStartMonth, 1)
        endDate = new Date(now.getFullYear(), quarterStartMonth + 3, 0)
        break
      default:
        return { startDate: null, endDate: null }
    }

    // Преобразуем даты в строки
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]
    
    // Убедимся, что startDate не больше endDate
    if (new Date(startDateStr) > new Date(endDateStr)) {
      // Если есть ошибка в расчетах, меняем местами
      return {
        startDate: endDateStr,
        endDate: startDateStr
      }
    }

    return {
      startDate: startDateStr,
      endDate: endDateStr
    }
  }

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

  // Обработчики для быстрого выбора диапазонов
  const handleQuickSelect = useCallback((rangeType: 'week' | 'month' | 'quarter') => {
    const range = getQuickRange(rangeType)
    onDateRangeChange(range)
    setIsOpen(false)
  }, [onDateRangeChange])

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
          {/* Кнопки быстрого выбора */}
          <div className="p-3 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-2">Быстрый выбор:</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickSelect('week')}
                className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                Неделя
              </button>
              <button
                onClick={() => handleQuickSelect('month')}
                className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                Месяц
              </button>
              <button
                onClick={() => handleQuickSelect('quarter')}
                className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                Квартал
              </button>
            </div>
          </div>
          
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