// Custom hooks để load data từ backend
import { useState, useEffect, useCallback } from 'react'
import { apiClient } from './api-client'

// Generic hook để fetch data
export function useApi<T>(
  endpoint: () => Promise<any>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await endpoint()
      
      if (response.error) {
        setError(response.error)
      } else {
        setData(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Authentication hooks
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    const response = await apiClient.login(email, password)
    
    if (response.error) {
      setError(response.error)
      setLoading(false)
      return false
    }

    if (response.data?.token) {
      apiClient.setToken(response.data.token)
      setUser(response.data.user)
    }
    
    setLoading(false)
    return true
  }

  const register = async (userData: any) => {
    setLoading(true)
    setError(null)
    
    const response = await apiClient.register(userData)
    
    if (response.error) {
      setError(response.error)
      setLoading(false)
      return false
    }

    if (response.data?.token) {
      apiClient.setToken(response.data.token)
      setUser(response.data.user)
    }
    
    setLoading(false)
    return true
  }

  const logout = () => {
    apiClient.clearToken()
    setUser(null)
  }

  const loadProfile = async () => {
    const response = await apiClient.getProfile()
    if (response.data) {
      setUser(response.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadProfile()
  }, [])

  return { user, loading, error, login, register, logout, refetch: loadProfile }
}

// Focus session hooks
export function useFocusDashboard() {
  return useApi(() => apiClient.getFocusDashboard())
}

export function useFocusSessions(params?: { date?: string; limit?: number }) {
  return useApi(() => apiClient.getFocusSessions(params), [params])
}

// Medication hooks
export function useMedicationDashboard() {
  return useApi(() => apiClient.getMedicationDashboard())
}

export function useMedications() {
  return useApi(() => apiClient.getMedications())
}

export function useMedicationStats(days: number = 30) {
  return useApi(() => apiClient.getMedicationStats(days), [days])
}

// Rewards hooks
export function useRewardsDashboard() {
  return useApi(() => apiClient.getRewardsDashboard())
}

export function useUserPoints() {
  return useApi(() => apiClient.getUserPoints())
}

export function useRewards(categoryId?: string) {
  return useApi(() => apiClient.getRewards(categoryId), [categoryId])
}

export function useAchievements() {
  return useApi(() => apiClient.getAchievements())
}

// Schedule hooks
export function useScheduleDashboard() {
  return useApi(() => apiClient.getScheduleDashboard())
}

export function useSchedules(date?: string) {
  return useApi(() => apiClient.getSchedules(date), [date])
}

export function useDailySchedule(date: string) {
  return useApi(() => apiClient.getDailySchedule(date), [date])
}

export function useWeeklySchedule(date: string) {
  return useApi(() => apiClient.getWeeklySchedule(date), [date])
}

// Children management hooks
export function useChildren() {
  return useApi(() => apiClient.getChildren())
}

// Dashboard hooks
export function useDashboard() {
  return useApi(() => apiClient.getDashboard())
}

export function useDashboardStats() {
  return useApi(() => apiClient.getDashboardStats())
}

// Action hooks cho các operations
export function useActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async (action: () => Promise<any>) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await action()
      
      if (response.error) {
        setError(response.error)
        return false
      }
      
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Focus actions
  const createFocusSession = (sessionData: any) => 
    execute(() => apiClient.createFocusSession(sessionData))

  const startFocusSession = (sessionId: string) => 
    execute(() => apiClient.startFocusSession(sessionId))

  const completeFocusSession = (sessionId: string, data: any) => 
    execute(() => apiClient.completeFocusSession(sessionId, data))

  // Medication actions
  const logMedication = (data: any) => 
    execute(() => apiClient.logMedication(data))

  const createMedication = (medicationData: any) => 
    execute(() => apiClient.createMedication(medicationData))

  // Rewards actions
  const claimReward = (rewardId: string) => 
    execute(() => apiClient.claimReward(rewardId))

  const checkAchievements = (activityType: string, activityData: any) => 
    execute(() => apiClient.checkAchievements(activityType, activityData))

  // Schedule actions
  const createSchedule = (scheduleData: any) => 
    execute(() => apiClient.createSchedule(scheduleData))

  const completeScheduleItem = (itemId: string) => 
    execute(() => apiClient.completeScheduleItem(itemId))

  const skipScheduleItem = (itemId: string, reason?: string) => 
    execute(() => apiClient.skipScheduleItem(itemId, reason))

  // Children actions
  const createChild = (childData: any) => 
    execute(() => apiClient.createChild(childData))

  const updateChild = (childId: string, childData: any) => 
    execute(() => apiClient.updateChild(childId, childData))

  return {
    loading,
    error,
    createFocusSession,
    startFocusSession,
    completeFocusSession,
    logMedication,
    createMedication,
    claimReward,
    checkAchievements,
    createSchedule,
    completeScheduleItem,
    skipScheduleItem,
    createChild,
    updateChild
  }
}