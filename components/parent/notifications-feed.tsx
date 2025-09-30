"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, FileText, Heart } from "@/components/ui/icons"
import { dataStore } from "@/lib/data-store"
import { useAuth } from "@/lib/auth"
import type { Notification } from "@/lib/types"

interface NotificationsFeedProps {
  childName?: string
}

export function NotificationsFeed({ childName }: NotificationsFeedProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (user) {
      // Get notifications for current parent user via API
      const loadNotifications = async () => {
        try {
          const response = await fetch(`/api/notifications?userId=${user.id}`)
          if (response.ok) {
            const data = await response.json()
            setNotifications(data.notifications.slice(0, 10)) // Show latest 10 notifications
          } else {
            console.error('Failed to load notifications')
          }
        } catch (error) {
          console.error('Error loading notifications:', error)
        }
      }
      loadNotifications()
    }
  }, [user])

  // Auto-refresh notifications every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user) {
        try {
          const response = await fetch(`/api/notifications?userId=${user.id}`)
          if (response.ok) {
            const data = await response.json()
            setNotifications(data.notifications.slice(0, 10))
          }
        } catch (error) {
          console.error('Error refreshing notifications:', error)
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [user])

  const getIcon = (type: string) => {
    switch (type) {
      case "schedule_completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "break_taken":
        return <Clock className="w-5 h-5 text-orange-500" />
      case "medicine_taken":
        return <Heart className="w-5 h-5 text-red-500" />
      case "child_login":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "child_logout":
        return <Clock className="w-5 h-5 text-red-600" />
      case "focus_alert":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "daily_summary":
        return <FileText className="w-5 h-5 text-blue-500" />
      case "device_status":
        return <CheckCircle className="w-5 h-5 text-gray-500" />
      case "achievement":
        return <CheckCircle className="w-5 h-5 text-purple-500" />
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusDot = (type: string) => {
    switch (type) {
      case "schedule_completed":
        return <div className="w-2 h-2 bg-green-500 rounded-full" />
      case "break_taken":
        return <div className="w-2 h-2 bg-orange-500 rounded-full" />
      case "medicine_taken":
        return <div className="w-2 h-2 bg-red-500 rounded-full" />
      case "child_login":
        return <div className="w-2 h-2 bg-green-500 rounded-full" />
      case "child_logout":
        return <div className="w-2 h-2 bg-red-500 rounded-full" />
      case "focus_alert":
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />
      case "daily_summary":
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />
      case "device_status":
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />
      case "achievement":
        return <div className="w-2 h-2 bg-purple-500 rounded-full" />
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />
    }
  }

  return (
    <Card className="p-3 sm:p-4 w-full overflow-hidden">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">Thông báo</h3>
        <Badge className="bg-orange-100 text-orange-600 text-xs sm:text-sm flex-shrink-0 ml-2">
          Đánh dấu đã đọc
        </Badge>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>

            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate">{notification.title}</h4>
                {!notification.read && getStatusDot(notification.type)}
              </div>

              <p className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-2">{notification.message}</p>

              <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{new Date(notification.createdAt).toLocaleString('vi-VN')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 sm:mt-4 text-center">
        <Button className="text-orange-500 hover:text-orange-600 text-xs sm:text-sm w-full sm:w-auto bg-transparent border-none">
          Xem tất cả thông báo
        </Button>
      </div>
    </Card>
  )
}
