'use client'

interface HighlightToggleProps {
  highlightEnabled: boolean
  onHighlightToggle: (enabled: boolean) => void
}

export function HighlightToggle({ 
  highlightEnabled, 
  onHighlightToggle
}: HighlightToggleProps) {
  const handleHighlightToggle = () => {
    const newState = !highlightEnabled
    onHighlightToggle(newState)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">Выделение по времени</span>
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
  )
}
