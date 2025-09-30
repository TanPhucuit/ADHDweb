"use client"

import { useState, useEffect } from "react"
import { realTimeService } from "@/lib/real-time-service"

type RealTimeData = {
  focusScore: number
  heartRate: number
  fidgetLevel: number
  activity: string
  status: string
  emoji: string
  timestamp: Date
}

export function useRealTimeData(childId: string | null) {
  const [data, setData] = useState<RealTimeData | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!childId) return

    setIsConnected(true)

    const unsubscribe = realTimeService.subscribe(childId, (newData) => {
      setData(newData)
    })

    return () => {
      unsubscribe()
      setIsConnected(false)
    }
  }, [childId])

  return { data, isConnected }
}

export function useRealTimeNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!userId) return

    const unsubscribe = realTimeService.subscribeToNotifications(userId, (notification) => {
      setNotifications((prev) => [notification, ...prev.slice(0, 9)]) // Keep last 10
    })

    return unsubscribe
  }, [userId])

  return notifications
}
