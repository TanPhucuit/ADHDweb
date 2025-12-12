// Notification service for sending real-time notifications to parents

interface NotificationData {
  userId: string
  childId: string
  type: 'child_login' | 'child_logout' | 'schedule_completed' | 'break_taken' | 'medicine_taken' | 'focus_alert' | 'achievement'
  title: string
  message: string
  activityId?: string
  metadata?: any
}

class NotificationService {
  private baseUrl = '/api'

  // Send notification to parent
  async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      console.log('📤 Sending notification:', data)

      const response = await fetch(`${this.baseUrl}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Notification sent successfully:', result)
      return true

    } catch (error) {
      console.error('❌ Error sending notification:', error)
      return false
    }
  }

  // Get notifications for user
  async getNotifications(userId: string, limit: number = 20) {
    try {
      const response = await fetch(`${this.baseUrl}/notifications?userId=${userId}&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`)
      }

      const result = await response.json()
      return result.notifications || []

    } catch (error) {
      console.error('❌ Error fetching notifications:', error)
      return []
    }
  }

  // Helper methods for specific notification types
  async notifyChildLogin(parentId: string, childId: string, childName: string) {
    return this.sendNotification({
      userId: parentId,
      childId,
      type: 'child_login',
      title: 'Con đã đăng nhập',
      message: `${childName} đang hoạt động trên ứng dụng`,
      metadata: {
        timestamp: new Date().toISOString()
      }
    })
  }

  async notifyChildLogout(parentId: string, childId: string, childName: string) {
    return this.sendNotification({
      userId: parentId,
      childId,
      type: 'child_logout', 
      title: 'Con đã đăng xuất',
      message: `${childName} đã dừng hoạt động trên ứng dụng`,
      metadata: {
        timestamp: new Date().toISOString()
      }
    })
  }

  async notifyActivityCompleted(parentId: string, childId: string, childName: string, activityTitle: string, activityId: string) {
    return this.sendNotification({
      userId: parentId,
      childId,
      type: 'schedule_completed',
      title: '🎉 Hoàn thành bài học',
      message: `${childName} vừa hoàn thành bài ${activityTitle} lúc ${new Date().toLocaleTimeString('vi-VN')}`,
      activityId,
      metadata: {
        activityTitle,
        activityId,
        completedAt: new Date().toISOString(),
        subject: activityTitle
      }
    })
  }

  async notifyBreakTaken(parentId: string, childId: string, childName: string, duration: number = 5) {
    // Lấy timestamp hiện tại của hệ thống một lần để tính nhất quán
    const currentTimestamp = new Date()
    const currentTime = currentTimestamp.toLocaleTimeString('vi-VN')
    const currentISOString = currentTimestamp.toISOString()
    
    // Also record break request in storage
    try {
      console.log('🕐 Recording break request at:', currentISOString)
      await fetch('/api/break-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          childName,
          parentId,
          duration,
          timestamp: currentISOString
        })
      })
    } catch (error) {
      console.error('❌ Failed to record break request:', error)
    }

    return this.sendNotification({
      userId: parentId,
      childId,
      type: 'break_taken',
      title: '☕ Nghỉ giải lao',
      message: `${childName} xin nghỉ giải lao ${duration} phút lúc ${currentTime}`,
      metadata: {
        breakStartTime: currentISOString,
        duration,
        childName
      }
    })
  }

  async notifyMedicineTaken(parentId: string, childId: string, childName: string, medicationId: string, medicineName?: string) {
    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const medicineDisplay = medicineName || 'thuốc'
    return this.sendNotification({
      userId: parentId,
      childId,
      type: 'medicine_taken',
      title: '💊 Đã uống thuốc',
      message: `${childName} đã uống thuốc ${medicineDisplay} vào lúc ${timestamp}`,
      activityId: medicationId,
      metadata: {
        medicationId,
        medicineName: medicineDisplay,
        takenAt: new Date().toISOString(),
        childName
      }
    })
  }
}

export const notificationService = new NotificationService()
export type { NotificationData }