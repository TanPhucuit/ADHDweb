"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Child, FocusSession, DailyReport } from "@/lib/types"
import { DashboardHeader } from "@/components/parent/dashboard-header"
import { MetricsGrid } from "@/components/parent/metrics-grid"
import { NotificationsPanel } from "@/components/parent/notifications-panel"
import { CompletionNotificationsPanel } from "@/components/parent/completion-notifications-panel"
import { QuickActions } from "@/components/parent/quick-actions"
import { RealTimeStatus } from "@/components/parent/real-time-status"
import { CameraPreview } from "@/components/parent/camera-preview"
import { FocusTrendChart } from "@/components/parent/focus-trend-chart"
import { ChildSelector } from "@/components/parent/child-selector"

// Real auth hook that gets user from localStorage (after API login)
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

export default function ParentDashboard() {
  const { user, loading } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null)
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  // Load children data
  useEffect(() => {
    if (user && user.role === 'parent') {
      loadParentData()
    }
  }, [user])

  const loadParentData = async () => {
    try {
      setDataLoading(true)
      console.log('🔍 Loading data for parent:', user?.id)
      
      // Fetch children for this parent
      const response = await fetch(`/api/parent/children?parentId=${user?.id}`)
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Parent children API response:', result)
        
        // API returns { data: children[] }
        const childrenData = result.data || []
        setChildren(childrenData)
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0])
        }
      } else {
        console.error('❌ Failed to fetch children:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('❌ Error loading parent data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'parent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-bold mb-2 text-gray-800">Chưa có quyền truy cập</h2>
          <p className="text-sm text-gray-600">Trang này chỉ dành cho phụ huynh</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Component */}
      <DashboardHeader user={user} />

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {children.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👶</div>
            <h2 className="text-xl font-bold mb-2 text-gray-800">Chưa có trẻ em nào</h2>
            <p className="text-gray-600">Hãy thêm trẻ em để bắt đầu theo dõi</p>
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            {selectedChild && (
              <MetricsGrid 
                child={selectedChild}
                todayReport={dailyReport}
                currentSession={currentSession}
                parentId={user.id.toString()}
              />
            )}

            {/* Main Dashboard Layout - Vertical Structure */}
            <div className="space-y-6">
              {/* Camera Preview */}
              {selectedChild && (
                <CameraPreview childName={selectedChild.name} childId={selectedChild?.id ? String(selectedChild.id) : ''} />
              )}

              {/* Completion Notifications - Shows completed activities */}
              <CompletionNotificationsPanel parentId={user.id} autoRefresh={true} />

              {/* Regular Notifications Panel with link to detailed view */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Thông báo khác</h2>
                  <Link href="/parent/notifications" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Xem chi tiết →
                  </Link>
                </div>
                <NotificationsPanel parentId={user.id} />
              </div>

              {/* Focus Trend Chart */}
              {selectedChild && (
                <FocusTrendChart 
                  child={selectedChild} 
                  sessions={[]} 
                />
              )}

              {/* Quick Actions */}
              {selectedChild && (
                <QuickActions 
                  selectedChildId={selectedChild.id}
                  parentId={user.id.toString()}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}