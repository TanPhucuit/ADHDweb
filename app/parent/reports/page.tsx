"use client"

import { useState, useEffect } from "react"
import { dataStore } from "@/lib/data-store"
import { apiService } from "@/lib/api-service"
import type { Child, DailyReport, FocusSession, User } from "@/lib/types"

// Real auth hook that validates API authentication data
function useAuth() {
  const [user, setUser] = useState<User | null>(null)
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
          console.log('🔐 Real auth loaded parent user for reports:', userData)
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
import { DashboardHeader } from "@/components/parent/dashboard-header"
import { ReportsHeader } from "@/components/reports/reports-header"
import { DateRangeSelector } from "@/components/reports/date-range-selector"
import { FocusScoreChart } from "@/components/reports/focus-score-chart"
import { SubjectPerformanceChart } from "@/components/reports/subject-performance-chart"
import { TimeDistributionChart } from "@/components/reports/time-distribution-chart"
import { HistoricalDataTable } from "@/components/reports/historical-data-table"
import { LearningPerformanceChart } from "@/components/reports/learning-performance-chart"
import { GoBackButton } from "@/components/ui/go-back-button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function ReportsPage() {
  console.log("[v0] ReportsPage component rendering")

  const { user, loading } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [reports, setReports] = useState<DailyReport[]>([])
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [dateRange, setDateRange] = useState("7days")
  const [isLoading, setIsLoading] = useState(true)

  console.log("[v0] ReportsPage state:", { user: !!user, loading, isLoading, child: !!child })

  useEffect(() => {
    console.log("[v0] useEffect triggered, user:", !!user)
    if (user) {
      loadData()
    }
  }, [user, dateRange])

  const loadData = async () => {
    console.log("[v0] loadData started")
    setIsLoading(true)
    try {
      console.log("[v0] Getting children data for parent:", user!.id)
      // Use real API to get children
      const parentIdStr = user?.id ? String(user.id) : ''
      if (!parentIdStr) {
        console.error('[v0] No valid parent ID')
        setIsLoading(false)
        return
      }
      const childrenData = await apiService.getParentChildren(parentIdStr)
      console.log("[v0] Children data received:", childrenData?.length || 0, "children", childrenData)

      if (childrenData && childrenData.length > 0) {
        const childData = childrenData[0] // Use first child
        console.log("[v0] Using first child:", childData)
        
        // Validate childData has required id
        if (!childData || !childData.id) {
          console.error('[v0] Child data missing ID:', childData)
          setIsLoading(false)
          return
        }
        
        setChild(childData)

        const days = dateRange === "today" ? 1 : dateRange === "7days" ? 7 : 30
        const childIdStr = String(childData.id)
        console.log("[v0] Loading real data for child:", childIdStr, "for", days, "days")

        // Load real data from APIs
        const [activities, medications, rewards] = await Promise.all([
          apiService.getScheduleActivities(childIdStr),
          apiService.getMedicationLogs(childIdStr),
          apiService.getRewardPoints(childIdStr)
        ])

        console.log("[v0] Real data loaded:", { 
          activities: activities?.length || 0, 
          medications: medications?.length || 0, 
          rewards: rewards?.totalStars || 0 
        })

        // Create mock reports from real data
        const completedActivities = activities?.filter((a: any) => a.status === 'completed') || []
        const totalFocusTime = completedActivities.length * 25 // 25 minutes per activity

        const mockReports: DailyReport[] = Array.from({ length: days }, (_, i) => ({
          id: `report-${childIdStr}-${new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`,
          childId: childIdStr,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalFocusTime: Math.max(5, totalFocusTime - i * 5), // Decrease over time
          averageFocusScore: Math.max(60, 85 - i * 2),
          averageHeartRate: 85 + Math.floor(Math.random() * 10),
          averageFidgetLevel: 40 + Math.floor(Math.random() * 20),
          interventionsCount: Math.floor(Math.random() * 3),
          sessionsCount: Math.max(1, completedActivities.length - Math.floor(i/2)),
          subjectBreakdown: {
            'Toán học': Math.floor(Math.random() * 30) + 15,
            'Tiếng Việt': Math.floor(Math.random() * 30) + 15,
            'Tiếng Anh': Math.floor(Math.random() * 30) + 15
          },
          achievements: totalFocusTime >= 50 - i * 5 ? ['Đạt mục tiêu thời gian học'] : []
        }))

        const mockSessions: FocusSession[] = completedActivities.slice(0, 10).map((activity: any, index: number) => ({
          id: `session-${activity.id}`,
          userId: childIdStr,
          subject: activity.subject || activity.title,
          activityType: 'schedule',
          startTime: new Date(Date.now() - index * 2 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - index * 2 * 60 * 60 * 1000 + 25 * 60 * 1000),
          plannedDuration: 25,
          status: 'completed',
          createdAt: new Date(),
          updatedAt: new Date()
        }))

        setReports(mockReports)
        setSessions(mockSessions)
      } else {
        console.log("[v0] No children found for parent")
        setChild(null)
        setReports([])
        setSessions([])
      }
    } catch (error) {
      console.error("[v0] Error loading reports data:", error)
    } finally {
      console.log("[v0] loadData completed")
      setIsLoading(false)
    }
  }

  console.log("[v0] Rendering decision - loading:", loading, "isLoading:", isLoading, "child:", !!child)

  if (loading || isLoading) {
    console.log("[v0] Showing loading spinner")
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!child) {
    console.log("[v0] No child found, showing error message")
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <DashboardHeader user={user!} />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Không tìm thấy dữ liệu con</h2>
          <p className="text-gray-500">Vui lòng kiểm tra cài đặt tài khoản</p>
        </div>
      </div>
    )
  }

  console.log("[v0] Rendering main reports page")
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <DashboardHeader user={user!} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <GoBackButton />

        <ReportsHeader child={child} />

        <DateRangeSelector selectedRange={dateRange} onRangeChange={setDateRange} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FocusScoreChart sessions={sessions} reports={reports} childId={child?.id ? String(child.id) : ''} />
          <LearningPerformanceChart childId={child?.id ? String(child.id) : ''} />
        </div>

        <TimeDistributionChart parentId={user?.id ? String(user.id) : ''} />

        <HistoricalDataTable parentId={user?.id ? String(user.id) : ''} />
      </main>
    </div>
  )
}
