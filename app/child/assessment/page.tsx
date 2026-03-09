"use client"

import { useEffect, useState } from "react"
import type { Child } from "@/lib/types"
import { ChildHeader } from "@/components/child/child-header"
import { WeeklyAssessmentDashboard } from "@/components/assessment/weekly-assessment-dashboard"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { GoBackButton } from "@/components/ui/go-back-button"

export default function ChildAssessmentPage() {
  const [child, setChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <ChildHeader child={child} />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <GoBackButton className="text-gray-600 hover:bg-gray-100" />
        </div>

        <WeeklyAssessmentDashboard child={child} />
      </main>
    </div>
  )
}
