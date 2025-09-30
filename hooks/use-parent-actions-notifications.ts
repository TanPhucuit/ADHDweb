"use client"

import { useState, useEffect, useCallback } from "react"

interface ParentAction {
  id: number
  message: string
  timestamp: string
  type: string
  action_label: string
}

export function useParentActionsNotifications(childId: string) {
  const [notifications, setNotifications] = useState<ParentAction[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date>(new Date())

  const fetchNotifications = useCallback(async () => {
    if (!childId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/child/parent-actions?childId=${childId}`)
      if (response.ok) {
        const data = await response.json()
        const newNotifications = data.notifications || []
        
        // Calculate unread count based on lastChecked time
        const unread = newNotifications.filter((n: ParentAction) => 
          new Date(n.timestamp) > lastChecked
        ).length
        
        setNotifications(newNotifications)
        setUnreadCount(unread)
      } else {
        console.error('Failed to fetch parent actions')
      }
    } catch (error) {
      console.error('Error fetching parent actions:', error)
    } finally {
      setLoading(false)
    }
  }, [childId, lastChecked])

  const markAsRead = useCallback(() => {
    setLastChecked(new Date())
    setUnreadCount(0)
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!childId) return

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [fetchNotifications, childId])

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead
  }
}