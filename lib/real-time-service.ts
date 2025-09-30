import { dataStore } from "./data-store"
import type { FocusSession } from "./types"

type RealTimeData = {
  focusScore: number
  heartRate: number
  fidgetLevel: number
  activity: string
  status: string
  emoji: string
  timestamp: Date
}

type DataSubscriber = (data: RealTimeData) => void
type NotificationSubscriber = (notification: any) => void

class RealTimeService {
  private subscribers: Map<string, DataSubscriber[]> = new Map()
  private notificationSubscribers: Map<string, NotificationSubscriber[]> = new Map()
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private currentSessions: Map<string, FocusSession> = new Map()

  // Subscribe to real-time data updates for a child
  subscribe(childId: string, callback: DataSubscriber): () => void {
    if (!this.subscribers.has(childId)) {
      this.subscribers.set(childId, [])
      this.startDataStream(childId)
    }

    const callbacks = this.subscribers.get(childId)!
    callbacks.push(callback)

    // Return unsubscribe function
    return () => {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }

      if (callbacks.length === 0) {
        this.stopDataStream(childId)
        this.subscribers.delete(childId)
      }
    }
  }

  // Subscribe to notifications
  subscribeToNotifications(userId: string, callback: NotificationSubscriber): () => void {
    if (!this.notificationSubscribers.has(userId)) {
      this.notificationSubscribers.set(userId, [])
    }

    const callbacks = this.notificationSubscribers.get(userId)!
    callbacks.push(callback)

    return () => {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private startDataStream(childId: string) {
    // Generate initial session if child is "active"
    this.createActiveSession(childId)

    // Update data every 5 seconds
    const interval = setInterval(() => {
      const data = this.generateRealTimeData(childId)
      this.updateCurrentSession(childId, data)
      this.notifySubscribers(childId, data)
      this.checkForAlerts(childId, data)
    }, 5000)

    this.intervals.set(childId, interval)
  }

  private stopDataStream(childId: string) {
    const interval = this.intervals.get(childId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(childId)
    }
  }

  private generateRealTimeData(childId: string): RealTimeData {
    const now = new Date()
    const timeOfDay = now.getHours() + now.getMinutes() / 60

    // Simulate realistic patterns based on time of day
    let baseFocusScore = 70
    if (timeOfDay < 9)
      baseFocusScore = 60 // Morning startup
    else if (timeOfDay > 11 && timeOfDay < 13)
      baseFocusScore = 50 // Pre-lunch dip
    else if (timeOfDay > 15) baseFocusScore = 55 // Afternoon fatigue

    // Add some randomness and trends
    const trend = Math.sin(now.getTime() / 300000) * 15 // 5-minute cycles
    const noise = (Math.random() - 0.5) * 20
    const focusScore = Math.max(20, Math.min(100, Math.round(baseFocusScore + trend + noise)))

    // Heart rate correlates with focus and activity
    const baseHeartRate = 75
    const activityBonus = focusScore > 60 ? 10 : 0
    const heartRate = Math.round(baseHeartRate + activityBonus + (Math.random() - 0.5) * 8)

    // Fidget level inversely correlates with focus
    const fidgetLevel = Math.round(Math.max(10, 80 - focusScore + (Math.random() - 0.5) * 15))

    const activities = ["Làm bài tập Toán", "Đọc sách Văn", "Học Tiếng Anh", "Vẽ tranh", "Nghe nhạc", "Nghỉ giải lao"]

    const activity = activities[Math.floor(Math.random() * activities.length)]

    let status = "Tập trung tốt"
    let emoji = "😊"

    if (focusScore < 40) {
      status = "Cần hỗ trợ"
      emoji = "😔"
    } else if (focusScore < 60) {
      status = "Tập trung trung bình"
      emoji = "😐"
    } else if (focusScore > 80) {
      status = "Tập trung xuất sắc"
      emoji = "🤩"
    }

    return {
      focusScore,
      heartRate,
      fidgetLevel,
      activity,
      status,
      emoji,
      timestamp: now,
    }
  }

  private createActiveSession(childId: string) {
    const sessionId = `session-${Date.now()}`
    const session: FocusSession = {
      id: sessionId,
      childId,
      deviceId: "device-1",
      startTime: new Date(),
      endTime: null,
      focusScore: 70,
      heartRate: 75,
      fidgetLevel: 30,
      activity: "Làm bài tập",
      subject: "Toán",
      interventions: [],
      status: "active",
    }

    this.currentSessions.set(childId, session)
  }

  private updateCurrentSession(childId: string, data: RealTimeData) {
    const session = this.currentSessions.get(childId)
    if (session) {
      session.focusScore = data.focusScore
      session.heartRate = data.heartRate
      session.fidgetLevel = data.fidgetLevel
      session.activity = data.activity
      this.currentSessions.set(childId, session)
    }
  }

  private notifySubscribers(childId: string, data: RealTimeData) {
    const callbacks = this.subscribers.get(childId)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data))
    }
  }

  private checkForAlerts(childId: string, data: RealTimeData) {
    // Generate alerts for low focus
    if (data.focusScore < 35) {
      this.generateAlert(childId, "focus_low", {
        title: "Mức tập trung thấp",
        message: `${data.activity} - Điểm tập trung: ${data.focusScore}%`,
        focusScore: data.focusScore,
      })
    }

    // Generate alerts for high fidget level
    if (data.fidgetLevel > 70) {
      this.generateAlert(childId, "fidget_high", {
        title: "Mức độ bồn chồn cao",
        message: `Trẻ đang có biểu hiện bồn chồn (${data.fidgetLevel}%)`,
        fidgetLevel: data.fidgetLevel,
      })
    }
  }

  private generateAlert(childId: string, type: string, alertData: any) {
    // Find parent of this child
    const parentCallbacks = this.notificationSubscribers.get("parent-1")
    if (parentCallbacks) {
      const notification = {
        id: `alert-${Date.now()}`,
        type,
        timestamp: new Date(),
        childId,
        ...alertData,
      }

      parentCallbacks.forEach((callback) => callback(notification))
    }
  }

  // Get current session data
  getCurrentSession(childId: string): FocusSession | null {
    return this.currentSessions.get(childId) || null
  }

  // Start a new focus session
  startSession(childId: string, activity: string, subject?: string): FocusSession {
    const sessionId = `session-${Date.now()}`
    const session: FocusSession = {
      id: sessionId,
      childId,
      deviceId: "device-1",
      startTime: new Date(),
      endTime: null,
      focusScore: 70,
      heartRate: 75,
      fidgetLevel: 30,
      activity,
      subject: subject || "Chung",
      interventions: [],
      status: "active",
    }

    this.currentSessions.set(childId, session)
    return session
  }

  // End current session
  endSession(childId: string): FocusSession | null {
    const session = this.currentSessions.get(childId)
    if (session) {
      session.endTime = new Date()
      session.status = "completed"
      this.currentSessions.delete(childId)
      return session
    }
    return null
  }

  // Send intervention
  sendIntervention(childId: string, message: string, type: "reminder" | "praise" | "break") {
    const session = this.currentSessions.get(childId)
    if (session) {
      const intervention = {
        id: `intervention-${Date.now()}`,
        sessionId: session.id,
        type,
        message,
        timestamp: new Date(),
        effectiveness: Math.floor(Math.random() * 30) + 60, // 60-90% effectiveness
      }

      session.interventions.push(intervention)
      this.currentSessions.set(childId, session)

      // Notify child interface
      const childCallbacks = this.notificationSubscribers.get(childId)
      if (childCallbacks) {
        childCallbacks.forEach((callback) =>
          callback({
            type: "intervention",
            intervention,
            timestamp: new Date(),
          }),
        )
      }
    }
  }

  // Simulate device status updates
  updateDeviceStatus(childId: string) {
    const device = dataStore.getDevice(childId)
    if (device) {
      // Simulate battery drain
      const newBatteryLevel = Math.max(10, device.batteryLevel - Math.random() * 2)
      dataStore.updateDeviceStatus(device.id, "connected", Math.round(newBatteryLevel))
    }
  }
}

export const realTimeService = new RealTimeService()
