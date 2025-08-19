'use client'

import { ChartBarIcon } from '@heroicons/react/24/outline'

interface AnalyticsToggleProps {
  showAnalytics: boolean
  onToggle: () => void
}

export function AnalyticsToggle({ showAnalytics, onToggle }: AnalyticsToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-all duration-200 min-w-[140px] ${
        showAnalytics
          ? 'border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100 shadow-sm'
          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400'
      }`}
    >
      <ChartBarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
      <span>{showAnalytics ? 'Скрыть аналитику' : 'Показать аналитику'}</span>
    </button>
  )
}
