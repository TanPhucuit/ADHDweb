"use client"

import { useEffect, useState, useCallback, useRef } from "react"
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
import { DailySummaryPanel } from "@/components/parent/daily-summary-panel"
import { Coffee, Check, X, Pill } from "lucide-react"

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
  // Break request popup
  const [pendingBreakRequest, setPendingBreakRequest] = useState<{ requestId: string | number; childId: string; childName: string } | null>(null)
  const respondedIds = useRef<Set<string>>(new Set())
  // Reward request badge count (shown on quick-link to rewards page)
  const [pendingRewardCount, setPendingRewardCount] = useState(0)
  // Trigger DailySummaryPanel refresh after schedule creation
  const [summaryRefreshKey, setSummaryRefreshKey] = useState(0)

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

  // Poll for pending break requests from children
  useEffect(() => {
    if (!user || user.role !== 'parent') return

    const poll = async () => {
      try {
        const res = await fetch(`/api/break-requests?parentId=${user.id}`)
        if (!res.ok) return
        const data = await res.json()
        const requests: any[] = data.requests || []
        if (requests.length === 0) return

        const latest = requests[0]
        const id = String(latest.actionid ?? latest.id ?? '')
        if (!id || respondedIds.current.has(id)) return

        // Find child name
        const childId = String(latest.childid)
        const childObj = children.find((c: any) => String(c.id) === childId)
        const childName = childObj?.name ?? `Con #${childId}`

        setPendingBreakRequest({ requestId: id, childId, childName })
      } catch {
        // ignore polling errors
      }
    }

    poll()
    const interval = setInterval(poll, 5000)
    return () => clearInterval(interval)
  }, [user, children])

  // Poll for pending reward requests (for selected child)
  useEffect(() => {
    if (!user || user.role !== 'parent' || !selectedChild) return
    const childId = (selectedChild as any).id ?? (selectedChild as any).childid
    if (!childId) return
    const poll = async () => {
      try {
        const res = await fetch(`/api/rewards/redeem?childId=${childId}`)
        if (!res.ok) return
        const data = await res.json()
        setPendingRewardCount((data.requests ?? []).length)
      } catch { /* ignore */ }
    }
    poll()
    const interval = setInterval(poll, 10000)
    return () => clearInterval(interval)
  }, [user, selectedChild])

  const handleBreakResponse = useCallback(async (approved: boolean) => {
    if (!pendingBreakRequest) return
    const { requestId, childId } = pendingBreakRequest

    respondedIds.current.add(String(requestId))
    setPendingBreakRequest(null)

    try {
      await fetch('/api/break-requests/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, approved }),
      })
    } catch (error) {
      console.error('Failed to send break response:', error)
    }
  }, [pendingBreakRequest])

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
      {/* Break request popup */}
      {pendingBreakRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">☕</div>
              <h2 className="text-xl font-bold text-gray-800">Xin nghỉ giải lao</h2>
              <p className="text-gray-500 text-sm mt-1">
                <b>{pendingBreakRequest.childName}</b> muốn nghỉ giải lao 5 phút
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5 text-center">
              <p className="text-amber-700 text-sm font-medium">Bạn có đồng ý cho con nghỉ không?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleBreakResponse(false)}
                className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 rounded-2xl transition-colors"
              >
                <X className="w-5 h-5" />
                Từ chối
              </button>
              <button
                onClick={() => handleBreakResponse(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-2xl transition-colors"
              >
                <Check className="w-5 h-5" />
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

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

              {/* Daily summary for selected child */}
              {selectedChild && (
                <DailySummaryPanel
                  childId={String((selectedChild as any).id ?? (selectedChild as any).childid)}
                  childName={selectedChild.name}
                  refreshKey={summaryRefreshKey}
                />
              )}

              {/* Medication management shortcut */}
              <Link href="/parent/medication" className="block">
                <div className="flex items-center gap-3 bg-pink-50 border-2 border-pink-200 rounded-2xl px-4 py-3 hover:bg-pink-100 transition-colors">
                  <Pill className="w-6 h-6 text-pink-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-pink-800 text-sm">Quản lý thuốc cho con</p>
                    <p className="text-xs text-pink-600">Thêm thuốc, xem lịch uống, đặt lại ngày mới</p>
                  </div>
                  <span className="text-pink-400 text-lg">→</span>
                </div>
              </Link>

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

              {/* Pending reward requests alert */}
              {pendingRewardCount > 0 && (
                <a href="/parent/rewards" className="block">
                  <div className="flex items-center gap-3 bg-yellow-50 border-2 border-yellow-300 rounded-2xl px-4 py-3 hover:bg-yellow-100 transition-colors">
                    <span className="text-2xl">🎁</span>
                    <div className="flex-1">
                      <p className="font-bold text-yellow-800 text-sm">
                        {selectedChild?.name} có {pendingRewardCount} yêu cầu đổi thưởng
                      </p>
                      <p className="text-xs text-yellow-600">Nhấn để xem và duyệt</p>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                      {pendingRewardCount}
                    </span>
                  </div>
                </a>
              )}

              {/* Quick Actions */}
              {selectedChild && (
                <QuickActions
                  selectedChildId={selectedChild.id}
                  parentId={user.id.toString()}
                  onScheduleCreated={() => setSummaryRefreshKey(k => k + 1)}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}