"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Coffee, 
  Pill, 
  LogIn, 
  LogOut, 
  Clock,
  CheckCircle,
  RefreshCw
} from 'lucide-react'

interface CompletedActivity {
  id: string
  childId: string
  subject: string
  title: string
  startTime: string
  endTime: string
  completedAt: string
  duration: string
}

interface BreakRequest {
  id: string
  childId: string
  childName: string
  requestTime: string
  duration: number
  status: 'active' | 'completed'
}

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
    duration?: number
    subject?: string
  }
  is_read: boolean
  created_at: string
}

interface DetailedNotificationsPanelProps {
  parentId: string
  childId?: string
}

export function DetailedNotificationsPanel({ parentId, childId }: DetailedNotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [completedActivities, setCompletedActivities] = useState<CompletedActivity[]>([])
  const [breakRequests, setBreakRequests] = useState<BreakRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch notifications
      const notificationsResponse = await fetch(`/api/notifications?userId=${parentId}`)
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        setNotifications(notificationsData.notifications || [])
      }

      // Fetch completed activities if childId is provided
      if (childId) {
        const activitiesResponse = await fetch(`/api/completed-activities?childId=${childId}`)
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json()
          setCompletedActivities(activitiesData.completedActivities || [])
        }
      }

      // Fetch break requests
      const breaksResponse = await fetch(`/api/break-requests?parentId=${parentId}`)
      if (breaksResponse.ok) {
        const breaksData = await breaksResponse.json()
        setBreakRequests(breaksData.breakRequests || [])
      }

    } catch (error) {
      console.error('❌ Error fetching detailed notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    
    return () => clearInterval(interval)
  }, [parentId, childId])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'child_login': return <LogIn className="h-4 w-4 text-green-600" />
      case 'child_logout': return <LogOut className="h-4 w-4 text-gray-600" />
      case 'activity_completed': return <Trophy className="h-4 w-4 text-yellow-600" />
      case 'break_taken': return <Coffee className="h-4 w-4 text-blue-600" />
      case 'medicine_taken': return <Pill className="h-4 w-4 text-purple-600" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN')
  }

  const formatTimeOnly = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Đang tải thông báo...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const activityNotifications = notifications.filter(n => n.type === 'activity_completed')
  const breakNotifications = notifications.filter(n => n.type === 'break_taken')
  const medicineNotifications = notifications.filter(n => n.type === 'medicine_taken')
  const loginNotifications = notifications.filter(n => n.type === 'child_login' || n.type === 'child_logout')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Thông báo chi tiết</h2>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Completed Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Bài học đã hoàn thành ({completedActivities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedActivities.length === 0 ? (
            <p className="text-gray-500">Chưa có bài học nào được hoàn thành</p>
          ) : (
            <div className="space-y-3">
              {completedActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">{activity.subject}</p>
                      <p className="text-sm text-gray-600">
                        Thời gian: {activity.startTime} - {activity.endTime} ({activity.duration})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">Hoàn thành</Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.completedAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Break Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-blue-600" />
            Lịch sử nghỉ giải lao ({breakRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {breakRequests.length === 0 ? (
            <p className="text-gray-500">Chưa có yêu cầu nghỉ giải lao nào</p>
          ) : (
            <div className="space-y-3">
              {breakRequests.map((breakReq) => (
                <div key={breakReq.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Coffee className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{breakReq.childName}</p>
                      <p className="text-sm text-gray-600">
                        Nghỉ {breakReq.duration} phút
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={breakReq.status === 'active' ? 'default' : 'secondary'}>
                      {breakReq.status === 'active' ? 'Đang nghỉ' : 'Đã xong'}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(breakReq.requestTime)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Thông báo gần đây ({notifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-gray-500">Chưa có thông báo nào</p>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 10).map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <Badge variant="destructive" className="text-xs">Mới</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}