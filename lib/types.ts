export interface User {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  role: "parent" | "child"
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Child {
  id: string
  parentId: string
  name: string
  age: number
  grade: string
  avatar?: string
  deviceId?: string
  settings: ChildSettings
  createdAt: Date
  updatedAt: Date
}

export interface ChildSettings {
  focusGoalMinutes: number
  breakReminderInterval: number
  lowFocusThreshold: number
  subjects: string[]
  schoolHours: {
    start: string
    end: string
  }
}

export interface Device {
  id: string
  childId: string
  name: string
  type: "smartwatch"
  status: "connected" | "disconnected" | "low_battery"
  batteryLevel: number
  lastSync: Date
  firmwareVersion: string
}

export interface FocusSession {
  id: string
  userId: string
  subject: string
  activityType: string
  startTime: Date | null
  endTime?: Date | null
  plannedDuration: number
  actualDuration?: number
  focusScore?: number
  status: "planned" | "active" | "completed" | "cancelled"
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Intervention {
  id: string
  sessionId: string
  type: "reminder" | "break" | "praise" | "redirect"
  message: string
  timestamp: Date
  effectiveness?: number
}

export interface DailyReport {
  id: string
  childId: string
  date: string
  totalFocusTime: number
  averageFocusScore: number
  averageHeartRate: number
  averageFidgetLevel: number
  sessionsCount: number
  interventionsCount: number
  subjectBreakdown: Record<string, number>
  achievements: string[]
}

export interface Notification {
  id: string
  userId: string
  type: "focus_alert" | "daily_summary" | "device_status" | "achievement" | "schedule_completed" | "break_taken" | "medicine_taken" | "child_login" | "child_logout"
  title: string
  message: string
  read: boolean
  createdAt: Date
  childId?: string // ID của child liên quan đến notification
  activityId?: string // ID của activity hoặc medicine liên quan
}

export interface ChatMessage {
  id: string
  userId: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  metadata?: {
    scheduleGenerated?: boolean
    topicCategory?: string
  }
}

export interface ScheduleItem {
  id: string
  childId: string
  title: string
  description: string
  subject: string
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  date: string // YYYY-MM-DD format
  status: "pending" | "in-progress" | "completed" | "overdue"
  priority: "low" | "medium" | "high"
  progress?: number // 0-100
  notes?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface RewardPoints {
  id: string
  childId: string
  points: number
  reason: string
  category: "schedule_completion" | "focus_improvement" | "behavior_improvement" | "bonus" | "medicine_taken"
  earnedAt: Date
  sessionId?: string
  scheduleItemId?: string
  rewardType?: "sticker_unicorn" | "badge_super_star" // New reward types
}

export interface Reward {
  id: string
  childId: string
  title: string
  description: string
  pointsCost: number
  category: "screen_time" | "activity" | "treat" | "privilege" | "custom"
  isActive: boolean
  createdBy: string // parent ID
  createdAt: Date
  updatedAt: Date
}

export interface RewardRedemption {
  id: string
  childId: string
  rewardId: string
  pointsSpent: number
  status: "pending" | "approved" | "completed" | "rejected"
  requestedAt: Date
  approvedAt?: Date
  completedAt?: Date
  approvedBy?: string // parent ID
  notes?: string
}

export interface ChildRewardProfile {
  childId: string
  totalPointsEarned: number
  totalPointsSpent: number
  currentPoints: number
  level: number
  nextLevelPoints: number
  achievements: string[]
  streakDays: number
  lastActivityDate: Date
  // Daily reset counters
  dailyStickers: {
    unicorn: number // 5 stars each, earned from schedule completion
    total: number
  }
  dailyBadges: {
    superStar: number // 10 stars each, earned from medicine taking
    total: number
  }
  lastResetDate: string // YYYY-MM-DD format for daily reset
}

export interface WeeklyAssessment {
  id: string
  childId: string
  weekStartDate: string // YYYY-MM-DD format
  weekEndDate: string // YYYY-MM-DD format
  adhdSeverityScore: number // 0-100, higher = more severe
  focusImprovementScore: number // 0-100, higher = better improvement
  behaviorScore: number // 0-100, higher = better behavior
  overallProgress: "excellent" | "good" | "fair" | "needs_attention"
  recommendations: string[]
  keyInsights: string[]
  parentFeedback?: string
  doctorRecommendation?: "continue_monitoring" | "schedule_consultation" | "urgent_consultation"
  createdAt: Date
  updatedAt: Date
}

export interface ADHDSymptomTracking {
  id: string
  childId: string
  date: string
  hyperactivityLevel: number // 1-5 scale
  inattentionLevel: number // 1-5 scale
  impulsivityLevel: number // 1-5 scale
  emotionalRegulation: number // 1-5 scale
  socialInteraction: number // 1-5 scale
  notes?: string
  reportedBy: "parent" | "child" | "system"
  createdAt: Date
}

export interface MedicationReminder {
  id: string
  childId: string
  medicationName: string
  dosage: string
  frequency: "daily" | "twice_daily" | "three_times_daily" | "weekly" | "custom"
  times: string[] // Array of time strings in HH:MM format
  startDate: string // YYYY-MM-DD format
  endDate?: string // YYYY-MM-DD format, optional for ongoing medication
  isActive: boolean
  notes?: string
  prescribedBy?: string // Doctor name
  sideEffectsToWatch?: string[]
  createdBy: string // parent ID
  createdAt: Date
  updatedAt: Date
}

export interface MedicationLog {
  id: string
  reminderId: string
  childId: string
  scheduledTime: Date
  takenTime?: Date
  status: "pending" | "taken" | "missed" | "delayed"
  notes?: string
  reportedBy: "parent" | "child" | "system"
  createdAt: Date
}

export interface MedicationSettings {
  childId: string
  reminderAdvanceMinutes: number // How many minutes before to send reminder
  allowChildToMarkTaken: boolean
  requireParentConfirmation: boolean
  enableSoundAlerts: boolean
  enablePushNotifications: boolean
  missedDoseAlertMinutes: number // How long to wait before marking as missed
  updatedAt: Date
}
