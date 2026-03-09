"use client"

import { useEffect, useState } from "react"
import type { Child } from "@/lib/types"
import { ChildHeader } from "@/components/child/child-header"
import { ChildRewardDashboard } from "@/components/rewards/child-reward-dashboard"
import { GoBackButton } from "@/components/ui/go-back-button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function ChildRewardsPage() {
  const [child, setChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("adhd-dashboard-user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        if (user.id && user.role === "child") {
          setChild({
            id: user.id,
            parentId: user.parentId || "22",
            name: user.name,
            age: user.age || 11,
            grade: user.class || "Lớp 5",
            avatar: "/child-avatar.png",
            deviceId: `device-${user.id}`,
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
      } catch (e) {
        console.error("Error parsing stored user:", e)
      }
    }
    setLoading(false)
  }, [])

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
          <h2 className="text-2xl font-bold mb-2">Chưa đăng nhập</h2>
          <p>Vui lòng đăng nhập với tài khoản con</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sky-400">
      <ChildHeader child={child} />
      <main className="container mx-auto px-4 py-6 space-y-4">
        <GoBackButton className="text-white hover:bg-white/20" />
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Điểm thưởng</h1>
          <p className="text-white/80 text-sm">Tích sao và đổi quà yêu thích nhé!</p>
        </div>
        <ChildRewardDashboard child={child} />
      </main>
    </div>
  )
}
