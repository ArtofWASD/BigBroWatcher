/**
 * Configuration constants for the application
 */

export const APP_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZES: [10, 20, 30] as const,
  },
  TIME_THRESHOLDS: {
    WARNING: 20, // minutes
    CRITICAL: 30, // minutes
  },
  DATE_FORMATS: {
    ORDER_DATE: 'dd.MM.yyyy HH:mm:ss',
  },
} as const