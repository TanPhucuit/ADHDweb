"use client"

import { useEffect, useState } from "react"
import type { Child } from "@/lib/types"
import { ChildHeader } from "@/components/child/child-header"
import { PomodoroTimer } from "@/components/focus/pomodoro-timer"
import { GoBackButton } from "@/components/ui/go-back-button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BrainIcon, TargetIcon, TrendingUpIcon } from "@/components/ui/icons"

export default function ChildFocusPage() {
  const [child, setChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)
  const [todayStats, setTodayStats] = useState({
    completedSessions: 0,
    totalFocusTime: 0,
    averageFocusScore: 0,
  })

  useEffect(() => {
    const stored = localStorage.getItem("adhd-dashboard-user")
    if (stored) {
      try {
        const u = JSON.parse(stored)
        if (u.id && u.role === "child") {
          setChild({
            id: u.id,
            parentId: u.parentId || "22",
            name: u.name,
            age: u.age || 11,
            grade: u.class || "Lớp 5",
            avatar: "/child-avatar.png",
            deviceId: `device-${u.id}`,
            settings: {
              focusGoalMinutes: 90,
              breakReminderInterval: 25,
              lowFocusThreshold: 35,
              subjects: ["Toán học", "Tiếng Việt", "Tiếng Anh", "Khoa học"],
              schoolHours: { start: "07:45", end: "16:15" },
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Child)
        }
      } catch {}
    }
    setLoading(false)
  }, [])

  const handleSessionComplete = (type: "work" | "break", duration: number) => {
    if (type === "work") {
      setTodayStats((prev) => ({
        ...prev,
        completedSessions: prev.completedSessions + 1,
        totalFocusTime: prev.totalFocusTime + duration,
      }))
    }
  }

  const handleFocusAlert = () => {
    // Could trigger additional ADHD-specific interventions
    console.log("Focus alert triggered - time running out")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-400">
        <LoadingSpinner />
      </div>
    )
  }

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-400">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Chưa có quyền truy cập</h2>
          <p>Hãy nhờ bố mẹ thiết lập tài khoản cho con</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <ChildHeader child={child} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <GoBackButton />

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TargetIcon className="w-4 h-4 text-blue-500" />
                Phiên hoàn thành
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{todayStats.completedSessions}</div>
              <p className="text-xs text-muted-foreground">phiên hôm nay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BrainIcon className="w-4 h-4 text-green-500" />
                Thời gian tập trung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{todayStats.totalFocusTime}</div>
              <p className="text-xs text-muted-foreground">phút hôm nay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUpIcon className="w-4 h-4 text-purple-500" />
                Mục tiêu hàng ngày
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((todayStats.totalFocusTime / child.settings.focusGoalMinutes) * 100)}%
                </div>
                <Badge variant="outline" className="text-xs">
                  {child.settings.focusGoalMinutes}m
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">tiến độ mục tiêu</p>
            </CardContent>
          </Card>
        </div>

        {/* Pomodoro Timer */}
        <div className="flex justify-center">
          <PomodoroTimer onSessionComplete={handleSessionComplete} onFocusAlert={handleFocusAlert} />
        </div>

        {/* Tips for ADHD */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mẹo tập trung cho trẻ ADHD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">Trong thời gian tập trung:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Tắt tất cả thông báo và âm thanh gây xao nhãng</li>
                  <li>• Ngồi ở nơi yên tĩnh, ít kích thích thị giác</li>
                  <li>• Chuẩn bị đầy đủ dụng cụ học tập trước khi bắt đầu</li>
                  <li>• Đặt mục tiêu cụ thể cho từng phiên 25 phút</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">Trong thời gian nghỉ:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Đứng dậy và vận động nhẹ nhàng</li>
                  <li>• Uống nước và ăn nhẹ nếu cần</li>
                  <li>• Nhìn ra xa để thư giãn mắt</li>
                  <li>• Tránh sử dụng điện thoại hoặc thiết bị điện tử</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
