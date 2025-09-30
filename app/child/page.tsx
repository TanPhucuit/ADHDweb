"use client"

import { useEffect, useState, useCallback } from "react"
import { apiService } from "@/lib/api-service"
import { notificationService } from "@/lib/notification-service"
import type { Child, FocusSession, ScheduleItem, MedicationLog, User } from "@/lib/types"
import { ChildHeader } from "@/components/child/child-header"
import { FocusMonster } from "@/components/child/focus-monster"
import { ActivitySelector } from "@/components/child/activity-selector"
import { BreakTimer } from "@/components/child/break-timer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, TimerIcon, AwardIcon, MusicIcon, BrainIcon, PillIcon, Star, Trophy, Gift } from "lucide-react"
import Link from "next/link"

// Real auth hook that validates API authentication data
function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get user from localStorage (set by API login)
    const storedUser = localStorage.getItem('adhd-dashboard-user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        // Validate that this is actually from API (has the right structure)
        if (userData.id && userData.role && userData.email) {
          setUser(userData)
        } else {
          console.warn('Invalid user data in localStorage, clearing...')
          localStorage.removeItem('adhd-dashboard-user')
        }
      } catch (e) {
        console.error('Error parsing stored user:', e)
        localStorage.removeItem('adhd-dashboard-user')
      }
    }
    setLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem('adhd-dashboard-user')
    setUser(null)
    window.location.href = '/'
  }

  return { user, loading: loading || !mounted, logout }
}

export default function ChildDashboard() {
  // Use real auth instead of mock auth
  const { user, loading: authLoading, logout } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [parentId, setParentId] = useState<string | null>(null)
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null)
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [breakTimeLeft, setBreakTimeLeft] = useState(0)
  const [scheduleActivities, setScheduleActivities] = useState<ScheduleItem[]>([])
  const [medicineNotifications, setMedicineNotifications] = useState<MedicationLog[]>([])
  const [selectedActivity, setSelectedActivity] = useState<ScheduleItem | null>(null)
  const [rewardPoints, setRewardPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showRewardAnimation, setShowRewardAnimation] = useState(false)
  const [lastRewardGain, setLastRewardGain] = useState(0)

  // Load data from API
  const loadData = useCallback(async (childId: string) => {
    try {
      setLoading(true)
      console.log('📄 Loading data from API for child:', childId)
      
      // First fetch parent ID
      try {
        const parentResponse = await fetch(`/api/child-parent?childId=${childId}`)
        if (parentResponse.ok) {
          const parentData = await parentResponse.json()
          setParentId(parentData.parentId)
          console.log('✅ Found parent ID:', parentData.parentId, 'for child:', childId)
        } else {
          console.error('❌ Failed to fetch parent ID for child:', childId)
          // Fallback to default parent ID
          setParentId('1')
        }
      } catch (error) {
        console.error('❌ Error fetching parent ID:', error)
        setParentId('1') // Fallback
      }
      
      const [activities, medications, rewards] = await Promise.all([
        apiService.getScheduleActivities(childId),
        apiService.getMedicationLogs(childId),
        // Sử dụng API mới để tính toán điểm sao với đúng parent ID
        fetch(`/api/rewards/calculate?childId=${childId}&parentId=${parentId}`)
          .then(res => res.json())
          .catch(() => ({ totalStars: 0, breakdown: {} }))
      ])
      
      console.log('🏆 API Data loaded:', { activities, medications, rewards })
      
      // Convert and set data
      setScheduleActivities(activities.map((activity: any) => ({
        ...activity,
        date: new Date().toISOString().split('T')[0],
        priority: 'medium' as const,
        completedAt: activity.completedAt ? new Date(activity.completedAt) : undefined,
        createdAt: new Date(activity.createdAt || Date.now()),
        updatedAt: new Date(activity.updatedAt || Date.now())
      })))
      
      setMedicineNotifications(medications.map((med: any) => ({
        ...med,
        reminderId: `reminder-${med.id}`,
        scheduledTime: new Date(med.scheduledTime),
        takenTime: med.takenTime ? new Date(med.takenTime) : undefined,
        reportedBy: 'child' as const,
        createdAt: new Date(med.createdAt || Date.now())
      })))
      
      setRewardPoints(rewards.totalStars)
      
    } catch (error) {
      console.error('❌ Error loading data from API:', error)
      setScheduleActivities([])
      setMedicineNotifications([])
      setRewardPoints(0)
    } finally {
      setLoading(false)
    }
  }, [])

  // Function để reload điểm sao từ database
  const reloadRewardPoints = useCallback(async () => {
    if (!child?.parentId) return
    
    try {
      console.log('🔄 Reloading reward points for child:', child.id, 'parent:', child.parentId)
      const response = await fetch(`/api/rewards/calculate?childId=${child.id}&parentId=${child.parentId}`)
      if (response.ok) {
        const data = await response.json()
        setRewardPoints(data.totalStars)
        console.log('✅ Reward points reloaded:', data.totalStars)
      }
    } catch (error) {
      console.error('❌ Failed to reload reward points:', error)
    }
  }, [child])

  // Auto-reload reward points khi component mount và khi reload page
  useEffect(() => {
    if (child?.parentId) {
      reloadRewardPoints()
    }
  }, [child?.parentId, reloadRewardPoints])

  useEffect(() => {
    if (user && user.role === "child") {
      console.log('👶 Loading child data for authenticated user:', user)
      loadData(user.id)
    }
  }, [user, loadData])

  // Create child object when we have user and preferably parentId
  useEffect(() => {
    if (user && user.role === "child") {
      // Use parentId if available, otherwise use fallback
      const effectiveParentId = parentId || '22' // Default to parent 22 (Phạm Thị Mai)
      
      const childData: Child = {
        id: user.id, // Use real user ID from database
        parentId: effectiveParentId, // Use real parent ID from database or fallback
        name: user.name || `${user.firstName} ${user.lastName}`.trim(),
        age: 11,
        grade: "Lớp 5", 
        avatar: "/child-avatar.png",
        deviceId: `device-${user.id}`,
        settings: {
          focusGoalMinutes: 90,
          breakReminderInterval: 25,
          lowFocusThreshold: 35,
          subjects: ["Toán học", "Tiếng Việt", "Tiếng Anh", "Khoa học"],
          schoolHours: {
            start: "07:45",
            end: "16:15",
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      console.log('👶 Created child data with parent ID:', effectiveParentId, childData)
      setChild(childData)
      
      // Send login notification to parent
      notificationService.notifyChildLogin(
        effectiveParentId, 
        childData.id, 
        childData.name
      ).then(() => {
        console.log('📢 Login notification sent to parent')
      }).catch(error => {
        console.error('❌ Failed to send login notification:', error)
      })
    }
  }, [user, parentId, loadData])

  // Handle logout notification when component unmounts or page unloads
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (child) {
        // Send logout notification
        notificationService.notifyChildLogout(
          child.parentId,
          child.id, 
          child.name
        ).catch(error => {
          console.error('❌ Failed to send logout notification:', error)
        })
      }
    }

    // Add event listener for page unload
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup function for component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      
      // Also send logout notification on component unmount
      if (child) {
        notificationService.notifyChildLogout(
          child.parentId,
          child.id,
          child.name
        ).catch(error => {
          console.error('❌ Failed to send logout notification:', error)
        })
      }
    }
  }, [child])

  // Show reward animation
  const showRewardGain = useCallback((points: number) => {
    setLastRewardGain(points)
    setShowRewardAnimation(true)
    setTimeout(() => setShowRewardAnimation(false), 2000)
  }, [])

  // Handle activity completion with optimistic updates
  const handleActivityCompleteAPI = useCallback(async (activityId: string) => {
    try {
      console.log(' Completing activity:', activityId)
      
      // Find the activity to get its details for notification
      const activity = scheduleActivities.find(act => act.id === activityId)
      
      // Optimistic update - cập nhật UI ngay lập tức
      setScheduleActivities(prev => prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, status: 'completed' as const, completedAt: new Date() }
          : activity
      ))
      
      // Cộng điểm thưởng ngay lập tức với animation
      setRewardPoints(prev => prev + 5)
      showRewardGain(5)
      
      // Gọi API trong background
      await apiService.completeScheduleActivity(activityId)
      
      // Send notification to parent about activity completion
      if (child && activity) {
        await notificationService.notifyActivityCompleted(
          child.parentId,
          child.id,
          child.name,
          activity.title || activity.subject,
          activityId
        )
        console.log('📢 Activity completion notification sent to parent:', {
          child: child.name,
          activity: activity.title || activity.subject,
          time: new Date().toLocaleTimeString('vi-VN')
        })
      }
      
      // Đồng bộ lại reward points từ server với API mới
      await reloadRewardPoints()
    } catch (error) {
      console.error(' Error completing activity:', error)
      // Rollback optimistic update nếu có lỗi
      setScheduleActivities(prev => prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, status: 'pending' as const, completedAt: undefined }
          : activity
      ))
      setRewardPoints(prev => prev - 5)
    }
  }, [child, showRewardGain, scheduleActivities, reloadRewardPoints])

  // Handle medication taken with optimistic updates
  const handleMedicineTakenAPI = useCallback(async (medicationId: string) => {
    try {
      console.log(' Taking medication:', medicationId)
      
      // Optimistic update
      setMedicineNotifications(prev => prev.map(med => 
        med.id === medicationId 
          ? { ...med, status: 'taken' as const, takenTime: new Date() }
          : med
      ))
      
      // Cộng điểm thưởng ngay lập tức với animation
      setRewardPoints(prev => prev + 10)
      showRewardGain(10)
      
      // Gọi API trong background
      await apiService.takeMedication(medicationId)
      
      // Send notification to parent about medication taken
      if (child) {
        await notificationService.notifyMedicineTaken(
          child.parentId,
          child.id,
          child.name,
          medicationId
        )
        console.log('📢 Medication notification sent to parent:', {
          child: child.name,
          medication: medicationId,
          time: new Date().toLocaleTimeString('vi-VN')
        })
      }
      
      // Đồng bộ lại reward points từ server với API mới
      await reloadRewardPoints()
    } catch (error) {
      console.error(' Error taking medication:', error)
      // Rollback optimistic update nếu có lỗi
      setMedicineNotifications(prev => prev.map(med => 
        med.id === medicationId 
          ? { ...med, status: 'pending' as const, takenTime: undefined }
          : med
      ))
      setRewardPoints(prev => prev - 10)
    }
  }, [child, showRewardGain, reloadRewardPoints])

  // Test notification function
  const handleTestNotification = useCallback(async () => {
    if (!child || !parentId) {
      console.log('❌ Missing child or parent ID for test notification')
      return
    }

    try {
      console.log('🧪 Testing notification for child:', child.id, 'parent:', parentId)
      
      const success = await notificationService.notifyChildLogin(
        parentId,
        child.id,
        child.name
      )
      
      if (success) {
        console.log('✅ Test notification sent successfully')
        alert(`✅ Test notification đã gửi thành công!\n\nChild: ${child.name}\nParent ID: ${parentId}`)
      } else {
        console.log('❌ Failed to send test notification')
        alert('❌ Gửi test notification thất bại')
      }
    } catch (error) {
      console.error('❌ Error sending test notification:', error)
      alert(`❌ Lỗi gửi test notification: ${error}`)
    }
  }, [child, parentId])

  // Activity and focus session handlers
  const handleScheduleActivityStart = useCallback((activity: ScheduleItem) => {
    console.log("Starting schedule activity:", activity)
    setSelectedActivity(activity)
    setCurrentSession({
      id: `session-${activity.id}`,
      userId: activity.childId,
      subject: activity.subject || activity.title,
      activityType: "schedule",
      startTime: new Date(),
      endTime: null,
      plannedDuration: 25,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }, [])

  const handleActivitySelectorStart = useCallback((activity: ScheduleItem) => {
    console.log("Starting activity from selector:", activity)
    handleScheduleActivityStart(activity)
  }, [handleScheduleActivityStart])

  const handleActivityComplete = useCallback(() => {
    if (selectedActivity) {
      console.log("Completing activity:", selectedActivity.id)
      handleActivityCompleteAPI(selectedActivity.id)
    }
    
    setSelectedActivity(null)
    setCurrentSession(null)
  }, [selectedActivity, handleActivityCompleteAPI])

  const handleMedicineTaken = useCallback((medicineId: string) => {
    console.log("Taking medicine:", medicineId)
    handleMedicineTakenAPI(medicineId)
  }, [handleMedicineTakenAPI])

  const handleBreakRequest = useCallback(async () => {
    // Lấy timestamp hiện tại của hệ thống
    const currentTimestamp = new Date()
    console.log("🕐 Break requested at:", currentTimestamp.toISOString())
    
    setIsOnBreak(true)
    setBreakTimeLeft(5 * 60) // 5 minutes break
    
    // Send break notification to parent with duration
    if (child) {
      try {
        await notificationService.notifyBreakTaken(
          child.parentId,
          child.id,
          child.name,
          5 // 5 minutes
        )
        console.log('📢 Break notification sent to parent:', {
          child: child.name,
          duration: '5 phút',
          timestamp: currentTimestamp.toISOString(),
          time: currentTimestamp.toLocaleTimeString('vi-VN')
        })
      } catch (error) {
        console.error('❌ Failed to send break notification:', error)
      }
    }
    
    // Auto end break after time
    setTimeout(() => {
      setIsOnBreak(false)
      setBreakTimeLeft(0)
      console.log('✅ Break time ended automatically at:', new Date().toISOString())
    }, 5 * 60 * 1000)
  }, [child])

  const childFeatures = [
    {
      href: "/child/schedule",
      label: "Lịch học hôm nay",
      icon: CalendarIcon,
      color: "bg-blue-500",
      emoji: "📅",
    },
    {
      href: "/child/pomodoro",
      label: "Timer học tập",
      icon: TimerIcon,
      color: "bg-green-500",
      emoji: "⏰",
    },
    {
      href: "/child/rewards",
      label: "Điểm thưởng",
      icon: AwardIcon,
      color: "bg-yellow-500",
      emoji: "🏆",
    },
    {
      href: "/child/focus-sounds",
      label: "Nhạc tập trung",
      icon: MusicIcon,
      color: "bg-purple-500",
      emoji: "🎵",
    },
    {
      href: "/child/medication",
      label: "Nhắc nhở uống thuốc",
      icon: PillIcon,
      color: "bg-red-500",
      emoji: "💊",
    },
    {
      href: "/child/ai-chat",
      label: "Trò chuyện với AI",
      icon: BrainIcon,
      color: "bg-indigo-500",
      emoji: "🤖",
    },
  ]

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user || user.role !== "child") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 px-4">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-bold mb-2">Chưa có quyền truy cập</h2>
          <p className="text-sm">Trang này chỉ dành cho tài khoản trẻ em</p>
        </div>
      </div>
    )
  }

  // Show loading while child data is being prepared
  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Đang tải dữ liệu trẻ em...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 relative">
      <ChildHeader child={child} onLogout={logout} />

      {/* Reward Animation */}
      {showRewardAnimation && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-yellow-400 text-white rounded-full px-6 py-3 text-2xl font-bold animate-bounce shadow-2xl">
            +{lastRewardGain} ⭐
          </div>
        </div>
      )}

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {isOnBreak ? (
          <BreakTimer
            timeLeft={breakTimeLeft}
            onBreakEnd={async () => {
              setIsOnBreak(false)
              setBreakTimeLeft(0)
              
              // Send notification that break has ended
              if (child) {
                try {
                  await notificationService.notifyActivityCompleted(
                    child.parentId,
                    child.id,
                    child.name,
                    "Đã hoàn thành nghỉ giải lao",
                    "break-end"
                  )
                  console.log('📢 Break end notification sent to parent')
                } catch (error) {
                  console.error('❌ Failed to send break end notification:', error)
                }
              }
            }}
          />
        ) : (
          <>
            {/* Focus Monster - Main character */}
            <FocusMonster 
              child={child} 
              currentSession={currentSession} 
              currentActivity={selectedActivity}
              onBreakRequest={handleBreakRequest} 
              onActivityComplete={handleActivityComplete} 
            />

            {/* Activity Selector */}
            {!currentSession && <ActivitySelector scheduleActivities={scheduleActivities} onActivitySelect={handleActivitySelectorStart} />}

            {/* Test Notification Button */}
            <Card className="bg-gradient-to-r from-blue-100 to-purple-100 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <button
                  onClick={handleTestNotification}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  disabled={!child || !parentId}
                >
                  🧪 Test Notification
                </button>
                <p className="text-xs text-gray-600 mt-2">
                  Child: {child?.name || 'N/A'} | Parent ID: {parentId || 'N/A'}
                </p>
              </CardContent>
            </Card>

            {/* Enhanced Reward Points Display */}
            <Card className="bg-gradient-to-r from-yellow-100 via-orange-100 to-yellow-200 backdrop-blur-sm border-0 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-300/20 rounded-full -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-300/20 rounded-full -ml-8 -mb-8"></div>
              <CardContent className="p-4 sm:p-6 relative">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Trophy className="w-8 h-8 text-yellow-600 mr-2" />
                    <h2 className="text-lg sm:text-xl font-bold text-yellow-800">
                      Kho báu của {child?.name}
                    </h2>
                  </div>
                  
                  <div className="text-5xl sm:text-6xl font-bold text-yellow-600 mb-4 transition-all duration-500 transform hover:scale-110">
                    <Star className="w-12 h-12 inline mr-2 text-yellow-500" />
                    {rewardPoints}
                    <span className="text-2xl ml-2">sao</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-green-600 font-bold text-xl mb-1">+5 ⭐</div>
                      <div className="text-gray-700 text-sm">Hoàn thành bài học</div>
                      <div className="text-xs text-gray-500 mt-1">Mỗi hoạt động</div>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-red-600 font-bold text-xl mb-1">+10 ⭐</div>
                      <div className="text-gray-700 text-sm">Uống thuốc đúng giờ</div>
                      <div className="text-xs text-gray-500 mt-1">Mỗi liều thuốc</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-3 bg-white/60 rounded-lg">
                    <p className="text-sm text-gray-600 flex items-center justify-center">
                      <Gift className="w-4 h-4 mr-1" />
                      Dành dụm sao để đổi quà nhé!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Activities */}
            {scheduleActivities.length > 0 && (
              <Card className="bg-blue-50/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-3 sm:p-6">
                  <h2 className="text-base sm:text-xl font-bold text-center mb-3 sm:mb-4 text-blue-800">
                     Lịch học hôm nay ({scheduleActivities.length} hoạt động)
                  </h2>
                  <div className="space-y-2 sm:space-y-3">
                    {scheduleActivities.map((activity) => (
                      <div key={activity.id} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-800">{activity.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {activity.startTime} - {activity.endTime}
                            </p>
                            {activity.description && (
                              <p className="text-xs sm:text-sm text-gray-500 mt-1">{activity.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-3">
                            {activity.status === 'pending' && !selectedActivity && (
                              <Button
                                onClick={() => handleScheduleActivityStart(activity)}
                                className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 transition-colors"
                              >
                                Bắt đầu
                              </Button>
                            )}
                            {selectedActivity?.id === activity.id && (
                              <>
                                <Button
                                  onClick={handleBreakRequest}
                                  className="text-xs px-2 py-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                                >
                                  Xin nghỉ
                                </Button>
                                <Button
                                  onClick={handleActivityComplete}
                                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 transition-colors"
                                >
                                  Hoàn thành
                                </Button>
                              </>
                            )}
                            {activity.status === 'completed' && (
                              <span className="text-xs text-green-600 font-semibold px-2 py-1 bg-green-100 rounded">
                                 Hoàn thành
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medicine Notifications */}
            {medicineNotifications.length > 0 && (
              <Card className="bg-red-50/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-3 sm:p-6">
                  <h2 className="text-base sm:text-xl font-bold text-center mb-3 sm:mb-4 text-red-800">
                     Nhắc nhở uống thuốc ({medicineNotifications.length} thuốc)
                  </h2>
                  <div className="space-y-2 sm:space-y-3">
                    {medicineNotifications.map((medicine) => (
                      <div key={medicine.id} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-red-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-800">Thuốc #{medicine.reminderId || medicine.id}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Trạng thái: {medicine.status === 'taken' ? 'Đã uống' : 'Chưa uống'}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              Thời gian: {new Date(medicine.scheduledTime).toLocaleTimeString('vi-VN', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                            {medicine.notes && (
                              <p className="text-xs sm:text-sm text-gray-500 mt-1">{medicine.notes}</p>
                            )}
                          </div>
                          <div className="ml-3">
                            {medicine.status === 'pending' && (
                              <Button
                                onClick={() => handleMedicineTaken(medicine.id)}
                                className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 transition-colors"
                              >
                                Uống thuốc
                              </Button>
                            )}
                            {medicine.status === 'taken' && (
                              <span className="text-xs text-green-600 font-semibold px-2 py-1 bg-green-100 rounded">
                                 Đã uống
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Child-friendly Feature Navigation */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-3 sm:p-6">
                <h2 className="text-base sm:text-xl font-bold text-center mb-3 sm:mb-6 text-gray-800">
                   Công cụ học tập của {child?.name}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                  {childFeatures.map((feature) => (
                    <Link key={feature.href} href={feature.href}>
                      <Button
                        className="h-14 sm:h-20 w-full flex flex-col gap-1 sm:gap-2 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 transform hover:scale-105 active:scale-95"
                      >
                        <div className="text-lg sm:text-2xl">{feature.emoji}</div>
                        <span className="text-xs sm:text-xs font-medium text-gray-700 text-center leading-tight px-1">
                          {feature.label}
                        </span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
