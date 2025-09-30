"use client"

import { useAuth } from "@/lib/auth"
import { useEffect, useState } from "react"
import { dataStore } from "@/lib/data-store"
import type { Child } from "@/lib/types"
import { ChildHeader } from "@/components/child/child-header"
import { WeeklyAssessmentDashboard } from "@/components/assessment/weekly-assessment-dashboard"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { GoBackButton } from "@/components/ui/go-back-button"

export default function ChildAssessmentPage() {
  const { user, loading } = useAuth()
  const [child, setChild] = useState<Child | null>(null)

  useEffect(() => {
    if (user) {
      const childData = dataStore.getChildById("child-1")
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
