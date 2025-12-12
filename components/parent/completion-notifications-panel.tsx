"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  RefreshCw,
  Clock,
  User,
  BookOpen
} from 'lucide-react'

interface CompletionNotification {
  id: string
  type: string
  title: string
  message: string
  childName: string
  childId: string
  subject: string
  activityId: string
  completedAt: string
  startTime?: string | null
  endTime?: string | null
  metadata: {
    activityTitle: string
    subject: string
    completedAt: string
    childName: string
  }
  created_at: string
  is_read: boolean
}

interface CompletionNotificationsPanelProps {
  parentId: string
  autoRefresh?: boolean
}

export function CompletionNotificationsPanel({ 
  parentId, 
  autoRefresh = true 
}: CompletionNotificationsPanelProps) {
  const [notifications, setNotifications] = useState<CompletionNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchCompletionNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Fetching completion notifications for parent:', parentId)
      
      const response = await fetch(`/api/parent/completion-notifications?parentId=${parentId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.notifications || [])
        setLastRefresh(new Date())
        console.log(`✅ Loaded ${data.notifications?.length || 0} completion notifications`)
      } else {
        throw new Error(data.error || 'Failed to fetch notifications')
      }
      
    } catch (err) {
      console.error('❌ Error fetching completion notifications:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Fetch on component mount and when parentId changes
  useEffect(() => {
    if (parentId) {
      fetchCompletionNotifications()
    }
  }, [parentId])

  // Auto refresh every 2 minutes if enabled
  useEffect(() => {
    if (!autoRefresh || !parentId) return

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing completion notifications...')
      fetchCompletionNotifications()
    }, 120000) // 2 minutes

    return () => clearInterval(interval)
  }, [autoRefresh, parentId])

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('vi-VN')
    } catch {
      return dateString
    }
  }

  const getSubjectIcon = (subject: string) => {
    const subjectLower = subject.toLowerCase()
    if (subjectLower.includes('toán')) return '🔢'
    if (subjectLower.includes('văn') || subjectLower.includes('ngữ')) return '📚'
    if (subjectLower.includes('anh')) return '🇬🇧'
    if (subjectLower.includes('khoa học')) return '🔬'
    if (subjectLower.includes('lịch sử')) return '📜'
    if (subjectLower.includes('địa lý')) return '🌍'
    return '📖'
  }

  if (loading && notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Đang tải thông báo hoàn thành...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Bài học đã hoàn thành ({notifications.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastRefresh && (
              <span className="text-xs text-gray-500">
                Cập nhật: {lastRefresh.toLocaleTimeString('vi-VN')}
              </span>
            )}
            <Button 
              onClick={fetchCompletionNotifications} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
        </div>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            ❌ Lỗi: {error}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Chưa có bài học nào được hoàn thành</p>
            <p className="text-xs text-gray-400 mt-1">
              Các bài học đã hoàn thành sẽ hiển thị ở đây
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.type === 'medication_taken' 
                        ? 'bg-purple-100' 
                        : 'bg-yellow-100'
                    }`}>
                      {notification.type === 'medication_taken' ? (
                        <span className="text-lg">💊</span>
                      ) : (
                        <Trophy className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {notification.title}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        Mới hoàn thành
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-2">
                      {notification.type === 'medication_taken' ? (
                        <>
                          <span className="font-medium">{notification.childName}</span> đã uống thuốc{' '}
                          <span className="font-medium text-purple-600">
                            💊 {notification.metadata?.medicineName || 'thuốc'}
                          </span>{' '}
                          vào lúc{' '}
                          <span className="font-medium text-gray-600">
                            {notification.completedAt}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium">{notification.childName}</span> đã hoàn thành bài tập môn{' '}
                          <span className="font-medium text-blue-600">
                            {getSubjectIcon(notification.subject)} {notification.subject}
                          </span>
                        </>
                      )}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {notification.childName}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {notification.subject}
                      </div>
                      
                      {notification.startTime && notification.endTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {notification.startTime} - {notification.endTime}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}