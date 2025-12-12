import { createClient } from '@supabase/supabase-js'

export interface InstantNotification {
  id: string
  childId: string
  type: 'parent_action' | 'encouragement' | 'warning' | 'reward'
  title: string
  message: string
  actionType?: string
  timestamp: string
}

class InstantNotificationService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  private listeners = new Map<string, ((notification: InstantNotification) => void)[]>()

  /**
   * Subscribe to instant notifications for a specific child
   * Returns unsubscribe function
   */
  subscribeToChildNotifications(
    childId: string,
    callback: (notification: InstantNotification) => void
  ): () => void {
    console.log('🔔 Subscribing to instant notifications for child:', childId)

    // Add callback to listeners
    if (!this.listeners.has(childId)) {
      this.listeners.set(childId, [])
    }
    this.listeners.get(childId)!.push(callback)

    // Subscribe to Supabase Realtime channel for this child
    const channel = this.supabase
      .channel(`child-notifications-${childId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'action',
          filter: `childid=eq.${childId}`
        },
        (payload) => {
          console.log('📨 Received instant notification from Supabase:', payload)
          
          const action = payload.new as any
          const notification: InstantNotification = {
            id: action.actionid?.toString() || Date.now().toString(),
            childId: childId,
            type: 'parent_action',
            title: '📢 Thông báo từ ba mẹ',
            message: action.actiontype || 'Ba mẹ vừa gửi thông báo cho con',
            actionType: action.actiontype,
            timestamp: new Date().toISOString()
          }

          // Notify all listeners for this child
          const callbacks = this.listeners.get(childId) || []
          callbacks.forEach(cb => {
            try {
              cb(notification)
            } catch (error) {
              console.error('❌ Error in notification callback:', error)
            }
          })
        }
      )
      .subscribe((status) => {
        console.log('🔌 Supabase channel status:', status)
      })

    // Return unsubscribe function
    return () => {
      console.log('🔕 Unsubscribing from instant notifications for child:', childId)
      
      // Remove callback from listeners
      const callbacks = this.listeners.get(childId)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
        if (callbacks.length === 0) {
          this.listeners.delete(childId)
        }
      }

      // Unsubscribe from Supabase channel
      this.supabase.removeChannel(channel)
    }
  }

  /**
   * Send an instant notification to a child
   * This is called by parent when they perform an action
   */
  async sendInstantNotification(
    childId: string,
    actionType: string,
    message?: string
  ): Promise<boolean> {
    try {
      console.log('📤 Sending instant notification to child:', childId, 'Action:', actionType)

      // Insert into action table will trigger Supabase Realtime
      const { data, error } = await this.supabase
        .from('action')
        .insert({
          childid: parseInt(childId),
          actiontype: actionType,
          timestamp: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error sending instant notification:', error)
        return false
      }

      console.log('✅ Instant notification sent successfully:', data)
      return true
    } catch (error) {
      console.error('❌ Error in sendInstantNotification:', error)
      return false
    }
  }
}

export const instantNotificationService = new InstantNotificationService()
