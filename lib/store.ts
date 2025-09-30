// Data store để cache và sync data giữa components
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from './api-client'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  user_type: 'parent' | 'child'
  avatar?: string
}

interface Child {
  id: string
  name: string
  age: number
  avatar?: string
  settings: any
}

interface FocusSession {
  id: string
  planned_duration: number
  actual_duration?: number
  focus_score?: number
  status: 'planned' | 'active' | 'completed' | 'cancelled'
  subject?: string
  created_at: string
}

interface MedicationLog {
  id: string
  medication_name: string
  scheduled_time: string
  actual_time?: string
  status: 'taken' | 'missed' | 'late'
}

interface RewardPoints {
  total_points: number
  available_points: number
  lifetime_earned: number
  lifetime_spent: number
}

interface ScheduleItem {
  id: string
  title: string
  start_time: string
  end_time: string
  completion_status: 'pending' | 'completed' | 'skipped'
  item_type: string
}

interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean
  
  // Children state
  children: Child[]
  selectedChild: Child | null
  
  // Focus state
  focusSessions: FocusSession[]
  activeFocusSession: FocusSession | null
  focusStats: any
  
  // Medication state
  medicationLogs: MedicationLog[]
  medicationStats: any
  
  // Rewards state
  userPoints: RewardPoints | null
  achievements: any[]
  availableRewards: any[]
  
  // Schedule state
  todaySchedule: ScheduleItem[]
  weeklySchedule: any
  
  // Loading states
  loading: {
    auth: boolean
    children: boolean
    focus: boolean
    medication: boolean
    rewards: boolean
    schedule: boolean
  }
  
  // Actions
  setUser: (user: User | null) => void
  setChildren: (children: Child[]) => void
  selectChild: (child: Child) => void
  
  // Focus actions
  setFocusSessions: (sessions: FocusSession[]) => void
  setActiveFocusSession: (session: FocusSession | null) => void
  addFocusSession: (session: FocusSession) => void
  updateFocusSession: (sessionId: string, updates: Partial<FocusSession>) => void
  
  // Medication actions
  setMedicationLogs: (logs: MedicationLog[]) => void
  addMedicationLog: (log: MedicationLog) => void
  
  // Rewards actions
  setUserPoints: (points: RewardPoints) => void
  setAchievements: (achievements: any[]) => void
  setAvailableRewards: (rewards: any[]) => void
  updatePoints: (pointsChange: number) => void
  
  // Schedule actions
  setTodaySchedule: (schedule: ScheduleItem[]) => void
  setWeeklySchedule: (schedule: any) => void
  updateScheduleItem: (itemId: string, updates: Partial<ScheduleItem>) => void
  
  // Loading actions
  setLoading: (key: keyof AppState['loading'], value: boolean) => void
  
  // Data refresh actions
  refreshUserData: () => Promise<void>
  refreshFocusData: () => Promise<void>
  refreshMedicationData: () => Promise<void>
  refreshRewardsData: () => Promise<void>
  refreshScheduleData: () => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      children: [],
      selectedChild: null,
      focusSessions: [],
      activeFocusSession: null,
      focusStats: null,
      medicationLogs: [],
      medicationStats: null,
      userPoints: null,
      achievements: [],
      availableRewards: [],
      todaySchedule: [],
      weeklySchedule: null,
      loading: {
        auth: false,
        children: false,
        focus: false,
        medication: false,
        rewards: false,
        schedule: false
      },

      // User actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setChildren: (children) => set({ children }),
      
      selectChild: (child) => set({ selectedChild: child }),

      // Focus actions
      setFocusSessions: (sessions) => set({ focusSessions: sessions }),
      
      setActiveFocusSession: (session) => set({ activeFocusSession: session }),
      
      addFocusSession: (session) => set((state) => ({
        focusSessions: [session, ...state.focusSessions]
      })),
      
      updateFocusSession: (sessionId, updates) => set((state) => ({
        focusSessions: state.focusSessions.map(session =>
          session.id === sessionId ? { ...session, ...updates } : session
        ),
        activeFocusSession: state.activeFocusSession?.id === sessionId
          ? { ...state.activeFocusSession, ...updates }
          : state.activeFocusSession
      })),

      // Medication actions
      setMedicationLogs: (logs) => set({ medicationLogs: logs }),
      
      addMedicationLog: (log) => set((state) => ({
        medicationLogs: [log, ...state.medicationLogs]
      })),

      // Rewards actions
      setUserPoints: (points) => set({ userPoints: points }),
      
      setAchievements: (achievements) => set({ achievements }),
      
      setAvailableRewards: (rewards) => set({ availableRewards: rewards }),
      
      updatePoints: (pointsChange) => set((state) => ({
        userPoints: state.userPoints ? {
          ...state.userPoints,
          total_points: state.userPoints.total_points + pointsChange,
          available_points: pointsChange > 0 
            ? state.userPoints.available_points + pointsChange
            : state.userPoints.available_points - Math.abs(pointsChange),
          lifetime_earned: pointsChange > 0 
            ? state.userPoints.lifetime_earned + pointsChange
            : state.userPoints.lifetime_earned,
          lifetime_spent: pointsChange < 0 
            ? state.userPoints.lifetime_spent + Math.abs(pointsChange)
            : state.userPoints.lifetime_spent
        } : null
      })),

      // Schedule actions
      setTodaySchedule: (schedule) => set({ todaySchedule: schedule }),
      
      setWeeklySchedule: (schedule) => set({ weeklySchedule: schedule }),
      
      updateScheduleItem: (itemId, updates) => set((state) => ({
        todaySchedule: state.todaySchedule.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      })),

      // Loading actions
      setLoading: (key, value) => set((state) => ({
        loading: { ...state.loading, [key]: value }
      })),

      // Data refresh actions
      refreshUserData: async () => {
        const { setLoading, setUser, setChildren } = get()
        
        setLoading('auth', true)
        try {
          const profileResponse = await apiClient.getProfile()
          if (profileResponse.data) {
            setUser(profileResponse.data)
          }

          const childrenResponse = await apiClient.getChildren()
          if (childrenResponse.data) {
            setChildren(childrenResponse.data)
          }
        } catch (error) {
          console.error('Error refreshing user data:', error)
        } finally {
          setLoading('auth', false)
        }
      },

      refreshFocusData: async () => {
        const { setLoading, setFocusSessions } = get()
        
        setLoading('focus', true)
        try {
          const sessionsResponse = await apiClient.getFocusSessions({ limit: 20 })
          if (sessionsResponse.data) {
            setFocusSessions(sessionsResponse.data.results || sessionsResponse.data)
          }
        } catch (error) {
          console.error('Error refreshing focus data:', error)
        } finally {
          setLoading('focus', false)
        }
      },

      refreshMedicationData: async () => {
        const { setLoading, setMedicationLogs } = get()
        
        setLoading('medication', true)
        try {
          const dashboardResponse = await apiClient.getMedicationDashboard()
          if (dashboardResponse.data?.recent_logs) {
            setMedicationLogs(dashboardResponse.data.recent_logs)
          }
        } catch (error) {
          console.error('Error refreshing medication data:', error)
        } finally {
          setLoading('medication', false)
        }
      },

      refreshRewardsData: async () => {
        const { setLoading, setUserPoints, setAchievements, setAvailableRewards } = get()
        
        setLoading('rewards', true)
        try {
          const [pointsResponse, achievementsResponse, rewardsResponse] = await Promise.all([
            apiClient.getUserPoints(),
            apiClient.getAchievements(),
            apiClient.getRewards()
          ])

          if (pointsResponse.data) {
            setUserPoints(pointsResponse.data)
          }
          
          if (achievementsResponse.data) {
            setAchievements(achievementsResponse.data)
          }
          
          if (rewardsResponse.data) {
            setAvailableRewards(rewardsResponse.data)
          }
        } catch (error) {
          console.error('Error refreshing rewards data:', error)
        } finally {
          setLoading('rewards', false)
        }
      },

      refreshScheduleData: async () => {
        const { setLoading, setTodaySchedule } = get()
        
        setLoading('schedule', true)
        try {
          const today = new Date().toISOString().split('T')[0]
          const todayResponse = await apiClient.getDailySchedule(today)
          
          if (todayResponse.data?.items) {
            setTodaySchedule(todayResponse.data.items)
          }
        } catch (error) {
          console.error('Error refreshing schedule data:', error)
        } finally {
          setLoading('schedule', false)
        }
      }
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        selectedChild: state.selectedChild
      })
    }
  )
)