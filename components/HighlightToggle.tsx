'use client'

import { TIME_THRESHOLDS } from '@/lib/timeUtils'

interface HighlightToggleProps {
  highlightEnabled: boolean
  onHighlightToggle: (enabled: boolean) => void
  filterEnabled: boolean
  onFilterToggle: (enabled: boolean) => void
}

export function HighlightToggle({ 
  highlightEnabled, 
  onHighlightToggle, 
  filterEnabled, 
  onFilterToggle 
}: HighlightToggleProps) {
  const handleHighlightToggle = () => {
    const newState = !highlightEnabled
    onHighlightToggle(newState)
    console.log('Highlight enabled:', newState)
  }

  const handleFilterToggle = () => {
    const newState = !filterEnabled
    onFilterToggle(newState)
    console.log('Filter enabled:', newState)
  }

  return (
    <div className="flex items-center gap-6">
      {/* Переключатель выделения */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Выделение по времени:</span>
        <button
          onClick={handleHighlightToggle}
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

      {/* Переключатель фильтрации */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Только проблемные:</span>
        <button
          onClick={handleFilterToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            filterEnabled ? 'bg-red-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              filterEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      {/* Легенда */}
      {highlightEnabled && (
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-200 rounded"></div>
            <span>{TIME_THRESHOLDS.WARNING}-{TIME_THRESHOLDS.CRITICAL} мин</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-200 rounded"></div>
            <span>&gt;{TIME_THRESHOLDS.CRITICAL} мин</span>
          </div>
        </div>
      )}
    </div>
  )
} 