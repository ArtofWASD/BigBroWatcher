'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { DateRange } from '@/lib/timeUtils'

interface AppContextType {
  highlightEnabled: boolean
  toggleHighlight: () => void
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  showAnalytics: boolean
  toggleAnalytics: () => void
  selectedDepartment: string | null
  setSelectedDepartment: (department: string | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [highlightEnabled, setHighlightEnabled] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)

  const toggleHighlight = () => setHighlightEnabled(!highlightEnabled)
  const toggleAnalytics = () => setShowAnalytics(!showAnalytics)

  return (
    <AppContext.Provider
      value={{
        highlightEnabled,
        toggleHighlight,
        dateRange,
        setDateRange,
        showAnalytics,
        toggleAnalytics,
        selectedDepartment,
        setSelectedDepartment,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}