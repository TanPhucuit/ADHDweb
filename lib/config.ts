// Environment configuration
const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof window !== 'undefined') {
    return defaultValue // Client-side fallback
  }
  return process.env[key] || defaultValue
}

const getEnvBoolean = (key: string, defaultValue: boolean = false): boolean => {
  const value = getEnvVar(key, defaultValue.toString())
  return value === 'true'
}

export const config = {
  // API URLs
  API_BASE_URL: getEnvVar('NEXT_PUBLIC_API_URL', 'http://127.0.0.1:8000'),
  
  // WebSocket URLs (nếu cần realtime updates)
  WS_BASE_URL: getEnvVar('NEXT_PUBLIC_WS_URL', 'ws://127.0.0.1:8000/ws'),
  
  // App settings
  APP_NAME: 'ADHD Dashboard',
  APP_VERSION: '1.0.0',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  
  // Focus session settings
  FOCUS: {
    MIN_DURATION: 5, // minutes
    MAX_DURATION: 120, // minutes
    DEFAULT_DURATION: 25, // minutes (Pomodoro)
    BREAK_DURATION: 5, // minutes
    LONG_BREAK_DURATION: 15, // minutes
  },
  
  // Medication settings
  MEDICATION: {
    REMINDER_WINDOW: 30, // minutes before/after scheduled time
    MAX_DAILY_LOGS: 10,
  },
  
  // Rewards settings
  REWARDS: {
    POINTS_PER_FOCUS_MINUTE: 1,
    POINTS_PER_MEDICATION_TAKEN: 10,
    POINTS_PER_TASK_COMPLETED: 5,
    LEVEL_UP_POINTS: 1000,
  },
  
  // Notification settings
  NOTIFICATIONS: {
    PERMISSION_REQUEST: true,
    FOCUS_REMINDERS: true,
    MEDICATION_REMINDERS: true,
    ACHIEVEMENT_ALERTS: true,
  },
  
  // Data refresh intervals (in milliseconds)
  REFRESH_INTERVALS: {
    DASHBOARD: 30000, // 30 seconds
    FOCUS_SESSION: 5000, // 5 seconds when active
    MEDICATION: 60000, // 1 minute
    REWARDS: 120000, // 2 minutes
  },
  
  // Local storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_PREFERENCES: 'user_preferences',
    SELECTED_CHILD: 'selected_child',
    THEME: 'theme',
  },
  
  // Date formats
  DATE_FORMATS: {
    DISPLAY: 'dd/MM/yyyy',
    DISPLAY_TIME: 'dd/MM/yyyy HH:mm',
    API: 'yyyy-MM-dd',
    API_DATETIME: "yyyy-MM-dd'T'HH:mm:ss'Z'",
  },
  
  // Chart colors
  CHART_COLORS: {
    PRIMARY: '#3B82F6',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#6366F1',
    NEUTRAL: '#6B7280',
  },
  
  // Status colors
  STATUS_COLORS: {
    FOCUS: {
      planned: '#6B7280',
      active: '#3B82F6',
      completed: '#10B981',
      cancelled: '#6B7280',
    },
    MEDICATION: {
      pending: '#F59E0B',
      taken: '#10B981',
      missed: '#EF4444',
      late: '#F59E0B',
    },
    SCHEDULE: {
      pending: '#6B7280',
      completed: '#10B981',
      skipped: '#6B7280',
      in_progress: '#3B82F6',
    },
  },
  
  // Feature flags
  FEATURES: {
    AI_ASSISTANT: getEnvBoolean('NEXT_PUBLIC_ENABLE_AI', false),
    REAL_TIME_UPDATES: getEnvBoolean('NEXT_PUBLIC_ENABLE_REALTIME', false),
    ADVANCED_ANALYTICS: getEnvBoolean('NEXT_PUBLIC_ENABLE_ANALYTICS', false),
    GAMIFICATION: true,
    PARENT_CHILD_CHAT: true,
  },
} as const

// Type-safe config access
export type Config = typeof config