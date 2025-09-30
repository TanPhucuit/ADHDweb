"use client"

import { useState, useEffect, useRef } from 'react'

interface NotificationStreamData {
  type: 'connected' | 'heartbeat' | 'notifications'
  parentId?: string
  timestamp?: number
  data?: any[]
}

export function useRealTimeNotifications(parentId: string) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = () => {
    if (!parentId) return

    try {
      console.log('🔌 Connecting to notification stream for parent:', parentId)
      
      const eventSource = new EventSource(`/api/notifications/stream?parentId=${parentId}`)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('✅ Connected to notification stream')
        setIsConnected(true)
        setError(null)
      }

      eventSource.onmessage = (event) => {
        try {
          const data: NotificationStreamData = JSON.parse(event.data)
          
          switch (data.type) {
            case 'connected':
              console.log('📡 Stream connected for parent:', data.parentId)
              break
              
            case 'heartbeat':
              console.log('💓 Stream heartbeat')
              break
              
            case 'notifications':
              console.log('🔔 New notifications received:', data.data)
              if (data.data && Array.isArray(data.data)) {
                setNotifications(prev => {
                  // Add new notifications and remove duplicates
                  const combined = [...data.data, ...prev]
                  const unique = combined.filter((notification, index, self) => 
                    index === self.findIndex(n => n.id === notification.id)
                  )
                  return unique.slice(0, 50) // Keep only latest 50
                })
              }
              break
          }
        } catch (parseError) {
          console.error('❌ Error parsing notification stream data:', parseError)
        }
      }

      eventSource.onerror = (error) => {
        console.error('❌ Notification stream error:', error)
        setIsConnected(false)
        setError('Connection error')
        
        // Attempt to reconnect after 5 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect to notification stream...')
          connect()
        }, 5000)
      }

    } catch (connectionError) {
      console.error('❌ Failed to connect to notification stream:', connectionError)
      setError('Failed to connect')
    }
  }

  const disconnect = () => {
    if (eventSourceRef.current) {
      console.log('🔌 Disconnecting from notification stream')
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    setIsConnected(false)
  }

  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [parentId])

  // Fetch initial notifications
  useEffect(() => {
    const fetchInitialNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications?userId=${parentId}`)
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications || [])
        }
      } catch (error) {
        console.error('❌ Error fetching initial notifications:', error)
      }
    }

    if (parentId) {
      fetchInitialNotifications()
    }
  }, [parentId])

  return {
    notifications,
    isConnected,
    error,
    reconnect: connect
  }
}