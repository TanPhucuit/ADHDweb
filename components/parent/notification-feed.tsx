import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, X, Clock, Star, Pill, Coffee, User, LogIn, LogOut } from 'lucide-react'

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

interface NotificationFeedProps {
  parentId: string
}

export function NotificationFeed({ parentId }: NotificationFeedProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

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

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId,
          isRead: true
        })
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        )
      }
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error)
    }
  }

  // Clear all notifications
  const clearAll = () => {
    notifications.forEach(notif => {
      if (!notif.is_read) {
        markAsRead(notif.id)
      }
    })
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
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsVisible(!isVisible)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isVisible && (
        <Card className="absolute right-0 top-12 w-96 max-h-96 z-50 shadow-lg border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Thông báo</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="text-xs"
                  >
                    Đánh dấu đã đọc
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsVisible(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
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
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        getNotificationColor(notification.type)
                      } ${notification.is_read ? 'opacity-60' : ''}`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(notification.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}