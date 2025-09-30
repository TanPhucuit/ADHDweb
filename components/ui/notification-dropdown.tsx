"use client"

import { useState, useEffect } from "react"
import { BellIcon, CheckIcon, XIcon, ClockIcon } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { dataStore } from "@/lib/data-store"
import { useAuth } from "@/lib/auth"
import type { Notification } from "@/lib/types"

interface NotificationDropdownProps {
  className?: string
}

export function NotificationDropdown({ className = "" }: NotificationDropdownProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notificationList, setNotificationList] = useState<Notification[]>([])

  // Load notifications from dataStore
  useEffect(() => {
    if (user) {
      const loadNotifications = async () => {
        const userNotifications = await dataStore.getNotifications(user.id)
        setNotificationList(userNotifications.slice(0, 10)) // Show latest 10 notifications
      }
      loadNotifications()
    }
  }, [user])

  // Auto-refresh notifications every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user) {
        const userNotifications = await dataStore.getNotifications(user.id)
        setNotificationList(userNotifications.slice(0, 10))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [user])

  const unreadCount = notificationList.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotificationList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "schedule_completed":
        return "text-green-600"
      case "break_taken":
        return "text-orange-600"
      case "medicine_taken":
        return "text-red-600"
      case "child_login":
        return "text-green-600"
      case "child_logout":
        return "text-red-600"
      case "focus_alert":
        return "text-yellow-600"
      case "achievement":
        return "text-purple-600"
      default:
        return "text-blue-600"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "schedule_completed":
      case "achievement":
        return <CheckIcon className="w-4 h-4" />
      case "break_taken":
      case "focus_alert":
        return <ClockIcon className="w-4 h-4" />
      case "medicine_taken":
      case "child_logout":
        return <XIcon className="w-4 h-4" />
      case "child_login":
        return <CheckIcon className="w-4 h-4" />
      default:
        return <BellIcon className="w-4 h-4" />
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Button className="relative bg-transparent hover:bg-gray-100 p-2 rounded-full" onClick={() => setIsOpen(!isOpen)}>
        <BellIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs animate-pulse">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-in slide-in-from-top-2">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-heading font-semibold text-sm">Thông báo</h3>
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 bg-transparent border-none"
                >
                  Đánh dấu đã đọc
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <ScrollArea className="max-h-96">
              {notificationList.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  <BellIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Không có thông báo mới</p>
                </div>
              ) : (
                <div className="py-2">
                  {notificationList.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer border-l-4 ${
                        notification.read ? "border-l-transparent opacity-60" : "border-l-primary"
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 ${getTypeColor(notification.type)}`}>
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {new Date(notification.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        {!notification.read && <div className="w-2 h-2 bg-primary rounded-full mt-2" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            {notificationList.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-100">
                <Button className="w-full text-xs text-blue-600 hover:text-blue-800 bg-transparent border-none">
                  Xem tất cả thông báo
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
