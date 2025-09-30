// Data transformers để convert data từ backend format sang frontend format
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

// Transform user data từ Django backend
export function transformUser(backendUser: any) {
  return {
    id: backendUser.id.toString(),
    email: backendUser.email,
    name: `${backendUser.first_name} ${backendUser.last_name}`.trim(),
    firstName: backendUser.first_name,
    lastName: backendUser.last_name,
    role: backendUser.user_type === 'parent' ? 'parent' as const : 'child' as const,
    avatar: backendUser.profile?.avatar || undefined,
    createdAt: new Date(backendUser.date_joined),
    updatedAt: new Date(backendUser.last_login || backendUser.date_joined)
  }
}

// Transform child data
export function transformChild(backendChild: any) {
  return {
    id: backendChild.id.toString(),
    parentId: backendChild.parent_id?.toString() || '',
    name: `${backendChild.first_name} ${backendChild.last_name}`.trim(),
    age: backendChild.profile?.age || 0,
    grade: backendChild.profile?.grade || '',
    avatar: backendChild.profile?.avatar || undefined,
    deviceId: backendChild.profile?.device_id || undefined,
    settings: {
      focusGoalMinutes: backendChild.profile?.focus_goal_minutes || 60,
      breakReminderInterval: backendChild.profile?.break_reminder_interval || 30,
      lowFocusThreshold: backendChild.profile?.low_focus_threshold || 3,
      subjects: backendChild.profile?.subjects || [],
      schoolHours: {
        start: backendChild.profile?.school_start_time || '08:00',
        end: backendChild.profile?.school_end_time || '16:00'
      }
    },
    createdAt: new Date(backendChild.date_joined),
    updatedAt: new Date(backendChild.last_login || backendChild.date_joined)
  }
}

// Transform focus session data
export function transformFocusSession(backendSession: any) {
  return {
    id: backendSession.id.toString(),
    userId: backendSession.user_id?.toString() || '',
    subject: backendSession.subject || 'Chung',
    activityType: backendSession.activity_type || 'study',
    plannedDuration: backendSession.planned_duration || 0,
    actualDuration: backendSession.actual_duration || 0,
    focusScore: backendSession.focus_score || 0,
    status: backendSession.status || 'planned',
    startTime: backendSession.start_time ? new Date(backendSession.start_time) : null,
    endTime: backendSession.end_time ? new Date(backendSession.end_time) : null,
    notes: backendSession.notes || '',
    createdAt: new Date(backendSession.created_at),
    updatedAt: new Date(backendSession.updated_at)
  }
}

// Transform medication data
export function transformMedication(backendMedication: any) {
  return {
    id: backendMedication.id.toString(),
    name: backendMedication.medication?.name || backendMedication.medication_name || '',
    dosage: backendMedication.dosage || '',
    frequency: backendMedication.frequency || '',
    timeSlots: backendMedication.time_slots || [],
    isActive: backendMedication.is_active !== false,
    notes: backendMedication.notes || '',
    createdAt: new Date(backendMedication.created_at)
  }
}

// Transform medication log
export function transformMedicationLog(backendLog: any) {
  return {
    id: backendLog.id.toString(),
    medicationId: backendLog.user_medication_id?.toString() || '',
    medicationName: backendLog.medication_name || '',
    scheduledTime: new Date(backendLog.scheduled_time),
    actualTime: backendLog.actual_time ? new Date(backendLog.actual_time) : null,
    status: backendLog.status || 'pending',
    notes: backendLog.notes || '',
    createdAt: new Date(backendLog.created_at)
  }
}

// Transform rewards data
export function transformReward(backendReward: any) {
  return {
    id: backendReward.id.toString(),
    categoryId: backendReward.category_id?.toString() || '',
    name: backendReward.name || '',
    description: backendReward.description || '',
    pointsCost: backendReward.points_cost || 0,
    icon: backendReward.icon || '',
    isActive: backendReward.is_active !== false,
    type: backendReward.reward_type || 'digital',
    createdAt: new Date(backendReward.created_at)
  }
}

// Transform user points
export function transformUserPoints(backendPoints: any) {
  return {
    totalPoints: backendPoints.total_points || 0,
    availablePoints: backendPoints.available_points || 0,
    lifetimeEarned: backendPoints.lifetime_earned || 0,
    lifetimeSpent: backendPoints.lifetime_spent || 0,
    level: Math.floor((backendPoints.lifetime_earned || 0) / 1000) + 1,
    nextLevelPoints: ((Math.floor((backendPoints.lifetime_earned || 0) / 1000) + 1) * 1000) - (backendPoints.lifetime_earned || 0)
  }
}

// Transform achievement data
export function transformAchievement(backendAchievement: any) {
  return {
    id: backendAchievement.id.toString(),
    name: backendAchievement.name || '',
    description: backendAchievement.description || '',
    icon: backendAchievement.icon || '🏆',
    pointsReward: backendAchievement.points_reward || 0,
    category: backendAchievement.category || 'general',
    isUnlocked: backendAchievement.is_unlocked || false,
    unlockedAt: backendAchievement.unlocked_at ? new Date(backendAchievement.unlocked_at) : null,
    progress: backendAchievement.progress || 0,
    maxProgress: backendAchievement.max_progress || 100
  }
}

// Transform schedule data
export function transformScheduleItem(backendItem: any) {
  return {
    id: backendItem.id.toString(),
    scheduleId: backendItem.schedule_id?.toString() || '',
    title: backendItem.title || '',
    description: backendItem.description || '',
    type: backendItem.item_type || 'task',
    startTime: new Date(backendItem.start_time),
    endTime: backendItem.end_time ? new Date(backendItem.end_time) : null,
    duration: backendItem.duration || 0,
    priority: backendItem.priority || 'medium',
    status: backendItem.completion_status || 'pending',
    isFlexible: backendItem.is_flexible || false,
    reminderMinutes: backendItem.reminder_minutes || 0,
    color: backendItem.color || '#3B82F6',
    notes: backendItem.notes || '',
    createdAt: new Date(backendItem.created_at)
  }
}

// Transform dashboard stats
export function transformDashboardStats(backendStats: any) {
  return {
    focus: {
      todayMinutes: backendStats.focus?.today_minutes || 0,
      weeklyGoal: backendStats.focus?.weekly_goal || 300,
      completionRate: backendStats.focus?.completion_rate || 0,
      averageScore: backendStats.focus?.average_score || 0,
      streak: backendStats.focus?.streak || 0
    },
    medication: {
      adherenceRate: backendStats.medication?.adherence_rate || 0,
      missedDoses: backendStats.medication?.missed_doses || 0,
      onTimeRate: backendStats.medication?.on_time_rate || 0,
      weeklyTrend: backendStats.medication?.weekly_trend || []
    },
    rewards: {
      totalPoints: backendStats.rewards?.total_points || 0,
      earnedThisWeek: backendStats.rewards?.earned_this_week || 0,
      achievementsUnlocked: backendStats.rewards?.achievements_unlocked || 0,
      level: backendStats.rewards?.level || 1
    },
    schedule: {
      completionRate: backendStats.schedule?.completion_rate || 0,
      completedTasks: backendStats.schedule?.completed_tasks || 0,
      totalTasks: backendStats.schedule?.total_tasks || 0,
      upcomingTasks: backendStats.schedule?.upcoming_tasks || 0
    }
  }
}

// Format dates cho UI
export function formatDateTime(date: Date | string, formatStr: string = 'dd/MM/yyyy HH:mm') {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: vi })
}

export function formatTimeAgo(date: Date | string) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Vừa xong'
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} giờ trước`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} ngày trước`
  
  return formatDateTime(dateObj, 'dd/MM/yyyy')
}

// Format duration
export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} phút`
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) return `${hours} giờ`
  return `${hours} giờ ${remainingMinutes} phút`
}

// Status formatters
export function formatFocusStatus(status: string) {
  const statusMap = {
    planned: 'Đã lên kế hoạch',
    active: 'Đang thực hiện',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

export function formatMedicationStatus(status: string) {
  const statusMap = {
    taken: 'Đã uống',
    missed: 'Bỏ lỡ',
    late: 'Uống muộn',
    pending: 'Chờ uống'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

export function formatScheduleStatus(status: string) {
  const statusMap = {
    pending: 'Chờ thực hiện',
    completed: 'Hoàn thành',
    skipped: 'Đã bỏ qua',
    in_progress: 'Đang thực hiện'
  }
  return statusMap[status as keyof typeof statusMap] || status
}