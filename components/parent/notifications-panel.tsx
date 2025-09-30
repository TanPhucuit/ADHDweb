"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, LogIn, LogOut, Star, Coffee, Pill } from "lucide-react"

interface Notification {
  id: string
  from_user_id: string
  to_user_id: string
  type: 'child_login' | 'child_logout' | 'activity_completed' | 'break_taken' | 'medicine_taken'
  title: string
  message: string
  metadata?: {
    childName?: string
    activityTitle?: string
    activityId?: string
    medicationId?: string
  }
  is_read: boolean
  created_at: string
}

interface NotificationsPanelProps {
  parentId: string
}

export function NotificationsPanel({ parentId }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${parentId}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.is_read)
    
    for (const notif of unreadNotifications) {
      try {
        await fetch(`/api/notifications/${notif.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_read: true })
        })
      } catch (error) {
        console.error('❌ Failed to mark notification as read:', error)
      }
    }
    
    // Update local state
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000)
    
    return () => clearInterval(interval)
  }, [parentId])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'child_login': return <LogIn className="h-4 w-4 text-green-600" />
      case 'child_logout': return <LogOut className="h-4 w-4 text-gray-600" />
      case 'activity_completed': return <Star className="h-4 w-4 text-yellow-600" />
      case 'break_taken': return <Coffee className="h-4 w-4 text-blue-600" />
      case 'medicine_taken': return <Pill className="h-4 w-4 text-purple-600" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'child_login': return 'bg-green-50 border-green-200'
      case 'child_logout': return 'bg-gray-50 border-gray-200'
      case 'activity_completed': return 'bg-yellow-50 border-yellow-200'
      case 'break_taken': return 'bg-blue-50 border-blue-200'
      case 'medicine_taken': return 'bg-purple-50 border-purple-200'
      default: return 'bg-white border-gray-200'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} giờ trước`
    
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <Card className="bg-amber-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Thông báo</CardTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Đánh dấu đã đọc
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Đang tải thông báo...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Chưa có thông báo nào
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${getNotificationColor(notification.type)} ${
                    !notification.is_read ? 'ring-2 ring-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {notifications.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Xem tất cả thông báo
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}