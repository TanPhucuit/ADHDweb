"use client"

import { useEffect, useState } from "react"
import { apiService } from "@/lib/api-service"
import type { Child } from "@/lib/types"
import { ChildHeader } from "@/components/child/child-header"
import { ChildRewardDashboard } from "@/components/rewards/child-reward-dashboard"
import { GoBackButton } from "@/components/ui/go-back-button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Temporary auth hook until issue is resolved
function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('adhd-dashboard-user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch (e) {
        console.error('Error parsing stored user:', e)
      }
    }
    setLoading(false)
  }, [])

  return { user, loading }
}

export default function ChildRewardsPage() {
  const { user, loading } = useAuth()
  const [child, setChild] = useState<Child | null>(null)

  useEffect(() => {
    if (user && user.role === "child") {
      // Create child object from authenticated user data
      const childData: Child = {
        id: user.id,
        parentId: user.parentId || '22', // fallback
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
      }
      setChild(childData)
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
        <LoadingSpinner />
      </div>
    )
  }

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Chưa có quyền truy cập</h2>
          <p>Hãy nhờ bố mẹ thiết lập tài khoản cho con</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400">
      <ChildHeader child={child} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <GoBackButton />

        <ChildRewardDashboard child={child} />
      </main>
    </div>
  )
}
