// API service for schedule activities and medications

interface ScheduleActivity {
  id?: string
  childId: string
  subject: string
  title: string
  description?: string
  startTime: string
  endTime: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  completedAt?: string
  createdAt?: string
  updatedAt?: string
}

interface MedicationLog {
  id?: string
  childId: string
  medicationName: string
  dosage: string
  scheduledTime: string
  status: 'pending' | 'taken' | 'missed' | 'skipped'
  takenTime?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

interface RewardData {
  childId: string
  totalStars: number
  breakdown: {
    scheduleActivities: number
    scheduleStars: number
    medicationLogs: number
    medicationStars: number
  }
}

class ApiService {
  private baseUrl = '/api'

  // Schedule Activities
  async getScheduleActivities(childId?: string): Promise<ScheduleActivity[]> {
    try {
      const url = childId 
        ? `${this.baseUrl}/schedule?childId=${childId}`
        : `${this.baseUrl}/schedule`
      
      const response = await fetch(url)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch schedule activities')
      }
      
      return result.data || []
    } catch (error) {
      console.error('Error fetching schedule activities:', error)
      throw error
    }
  }

  async updateScheduleActivity(activity: ScheduleActivity): Promise<ScheduleActivity> {
    try {
      const response = await fetch(`${this.baseUrl}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activity),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update schedule activity')
      }
      
      return result.data
    } catch (error) {
      console.error('Error updating schedule activity:', error)
      throw error
    }
  }

  async completeScheduleActivity(activityId: string): Promise<ScheduleActivity> {
    try {
      const response = await fetch(`${this.baseUrl}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: activityId,
          status: 'completed',
          completedAt: new Date().toISOString(),
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete schedule activity')
      }
      
      return result.data
    } catch (error) {
      console.error('Error completing schedule activity:', error)
      throw error
    }
  }

  // Medication Logs
  async getMedicationLogs(childId?: string): Promise<MedicationLog[]> {
    try {
      const url = childId 
        ? `${this.baseUrl}/medication?childId=${childId}`
        : `${this.baseUrl}/medication`
      
      const response = await fetch(url)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch medication logs')
      }
      
      return result.data || []
    } catch (error) {
      console.error('Error fetching medication logs:', error)
      throw error
    }
  }

  async updateMedicationLog(medication: MedicationLog): Promise<MedicationLog> {
    try {
      const response = await fetch(`${this.baseUrl}/medication`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medication),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update medication log')
      }
      
      return result.data
    } catch (error) {
      console.error('Error updating medication log:', error)
      throw error
    }
  }

  async takeMedication(medicationId: string, notes?: string): Promise<MedicationLog> {
    try {
      const response = await fetch(`${this.baseUrl}/medication`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: medicationId,
          status: 'taken',
          takenTime: new Date().toISOString(),
          notes,
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update medication status')
      }
      
      return result.data
    } catch (error) {
      console.error('Error taking medication:', error)
      throw error
    }
  }

  // Rewards
  async getRewardPoints(childId: string): Promise<RewardData> {
    try {
      const response = await fetch(`${this.baseUrl}/rewards?childId=${childId}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch reward points')
      }
      
      return result.data
    } catch (error) {
      console.error('Error fetching reward points:', error)
      throw error
    }
  }

  // Parent - Children Management
  async getParentChildren(parentId: string): Promise<any[]> {
    try {
      console.log('📡 API: Fetching children for parent:', parentId)
      const response = await fetch(`${this.baseUrl}/parent/children?parentId=${parentId}`)
      const result = await response.json()
      
      console.log('📦 API response:', response.ok, result)
      
      if (!response.ok) {
        console.error('❌ API error:', result.error)
        throw new Error(result.error || 'Failed to fetch parent children')
      }
      
      const children = result.data || []
      console.log('👶 Children found:', children.length)
      return children
    } catch (error) {
      console.error('💥 Error fetching parent children:', error)
      throw error
    }
  }
}

export const apiService = new ApiService()
export type { ScheduleActivity, MedicationLog, RewardData }