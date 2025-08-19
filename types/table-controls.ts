export interface DateRange {
  startDate: string | null
  endDate: string | null
}

export interface AnalyticsToggleProps {
  showAnalytics: boolean
  onToggle: () => void
}

export interface DateFilterProps {
  onDateRangeChange: (dateRange: DateRange) => void
  dateRange: DateRange
}

export interface HighlightToggleProps {
  highlightEnabled: boolean
  onHighlightToggle: (enabled: boolean) => void
}