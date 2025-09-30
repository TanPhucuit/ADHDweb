"use client"

import { useState, useEffect } from "react"
import { Bell, Clock } from "lucide-react"

interface ParentAction {
  id: number
  message: string
  timestamp: string
  type: string
  action_label: string
}

interface ParentActionsNotificationsProps {
  childId: string
  isOpen: boolean
  onClose: () => void
}

export function ParentActionsNotifications({ childId, isOpen, onClose }: ParentActionsNotificationsProps) {
  const [notifications, setNotifications] = useState<ParentAction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && childId) {
      fetchParentActions()
    }
  }, [isOpen, childId])

  const fetchParentActions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/child/parent-actions?childId=${childId}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      } else {
        console.error('Failed to fetch parent actions')
      }
    } catch (error) {
      console.error('Error fetching parent actions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getActionColor = (actionLabel: string) => {
    const colors = {
      'nhac-tap-trung': 'bg-blue-100 text-blue-800',
      'dong-vien': 'bg-pink-100 text-pink-800',
      'nghi-ngoi': 'bg-orange-100 text-orange-800',
      'khen-ngoi': 'bg-green-100 text-green-800',
      'kiem-tra-thoi-gian': 'bg-purple-100 text-purple-800'
    }
    return colors[actionLabel] || 'bg-gray-100 text-gray-800'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Thông báo từ ba mẹ</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Chưa có thông báo nào hôm nay</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className={`p-2 rounded-full ${getActionColor(notification.action_label)}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}