// API Client để kết nối với Django backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.detail || data.message || 'Request failed',
          status: response.status
        }
      }

      return {
        data,
        status: response.status
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0
      }
    }
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.request('/api/v1/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  async register(userData: {
    email: string
    password: string
    first_name: string
    last_name: string
    user_type: 'parent' | 'child'
  }) {
    return this.request('/api/v1/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async getProfile() {
    return this.request('/api/v1/auth/profile/')
  }

  async updateProfile(profileData: any) {
    return this.request('/api/v1/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  }

  // Users endpoints
  async getChildren() {
    return this.request('/api/v1/users/children/')
  }

  async createChild(childData: any) {
    return this.request('/api/v1/users/children/', {
      method: 'POST',
      body: JSON.stringify(childData)
    })
  }

  async updateChild(childId: string, childData: any) {
    return this.request(`/api/v1/users/children/${childId}/`, {
      method: 'PUT',
      body: JSON.stringify(childData)
    })
  }

  // Focus endpoints
  async getFocusDashboard() {
    return this.request('/api/v1/focus/dashboard/')
  }

  async getFocusSessions(params?: { date?: string; limit?: number }) {
    const query = new URLSearchParams(params as any).toString()
    return this.request(`/api/v1/focus/sessions/${query ? `?${query}` : ''}`)
  }

  async createFocusSession(sessionData: {
    planned_duration: number
    subject?: string
    activity_type?: string
  }) {
    return this.request('/api/v1/focus/sessions/', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    })
  }

  async updateFocusSession(sessionId: string, sessionData: any) {
    return this.request(`/api/v1/focus/sessions/${sessionId}/`, {
      method: 'PUT',
      body: JSON.stringify(sessionData)
    })
  }

  async startFocusSession(sessionId: string) {
    return this.request(`/api/v1/focus/sessions/${sessionId}/start/`, {
      method: 'POST'
    })
  }

  async completeFocusSession(sessionId: string, data: {
    actual_duration: number
    focus_score?: number
    notes?: string
  }) {
    return this.request(`/api/v1/focus/sessions/${sessionId}/complete/`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Medication endpoints
  async getMedicationDashboard() {
    return this.request('/api/v1/medication/dashboard/')
  }

  async getMedications() {
    return this.request('/api/v1/medication/medications/')
  }

  async createMedication(medicationData: {
    medication_id: string
    dosage: string
    frequency: string
    time_slots: string[]
    notes?: string
  }) {
    return this.request('/api/v1/medication/user-medications/', {
      method: 'POST',
      body: JSON.stringify(medicationData)
    })
  }

  async logMedication(data: {
    user_medication_id: string
    scheduled_time: string
    status: 'taken' | 'missed' | 'late'
    actual_time?: string
    notes?: string
  }) {
    return this.request('/api/v1/medication/log/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getMedicationStats(days: number = 30) {
    return this.request(`/api/v1/medication/statistics/?days=${days}`)
  }

  // Rewards endpoints
  async getRewardsDashboard() {
    return this.request('/api/v1/rewards/dashboard/')
  }

  async getUserPoints() {
    return this.request('/api/v1/rewards/points/')
  }

  async getRewards(categoryId?: string) {
    const query = categoryId ? `?category=${categoryId}` : ''
    return this.request(`/api/v1/rewards/rewards/${query}`)
  }

  async claimReward(rewardId: string) {
    return this.request('/api/v1/rewards/claim/', {
      method: 'POST',
      body: JSON.stringify({ reward_id: rewardId })
    })
  }

  async getAchievements() {
    return this.request('/api/v1/rewards/achievements/')
  }

  async checkAchievements(activityType: string, activityData: any) {
    return this.request('/api/v1/rewards/achievements/check/', {
      method: 'POST',
      body: JSON.stringify({ 
        activity_type: activityType, 
        activity_data: activityData 
      })
    })
  }

  // Schedule endpoints  
  async getScheduleDashboard() {
    return this.request('/api/v1/schedule/dashboard/')
  }

  async getSchedules(date?: string) {
    const query = date ? `?date=${date}` : ''
    return this.request(`/api/v1/schedule/schedules/${query}`)
  }

  async createSchedule(scheduleData: {
    title: string
    description?: string
    schedule_date: string
    template_id?: string
  }) {
    return this.request('/api/v1/schedule/schedules/', {
      method: 'POST',
      body: JSON.stringify(scheduleData)
    })
  }

  async getDailySchedule(date: string) {
    return this.request(`/api/v1/schedule/daily/?date=${date}`)
  }

  async getWeeklySchedule(date: string) {
    return this.request(`/api/v1/schedule/weekly/?date=${date}`)
  }

  async completeScheduleItem(itemId: string) {
    return this.request(`/api/v1/schedule/items/${itemId}/complete/`, {
      method: 'POST'
    })
  }

  async skipScheduleItem(itemId: string, reason?: string) {
    return this.request(`/api/v1/schedule/items/${itemId}/skip/`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  }

  // Dashboard endpoints
  async getDashboard() {
    return this.request('/api/v1/dashboard/')
  }

  async getDashboardStats() {
    return this.request('/api/v1/dashboard/stats/')
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient