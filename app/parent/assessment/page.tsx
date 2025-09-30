"use client"

import { useAuth } from "@/lib/auth"
import { useEffect, useState } from "react"
import { dataStore } from "@/lib/data-store"
import type { Child } from "@/lib/types"
import { DashboardHeader } from "@/components/parent/dashboard-header"
import { ChildSelector } from "@/components/parent/child-selector"
import { WeeklyAssessmentDashboard } from "@/components/assessment/weekly-assessment-dashboard"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function ParentAssessmentPage() {
  const { user, loading } = useAuth()
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [children, setChildren] = useState<Child[]>([])

  useEffect(() => {
    if (user) {
      const userChildren = dataStore.getChildrenByParent(user.id)
      setChildren(userChildren)

      if (userChildren.length > 0 && !selectedChild) {
        setSelectedChild(userChildren[0])
      }
    }
  }, [user, selectedChild])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <ChildSelector children={children} selectedChild={selectedChild} onChildSelect={setSelectedChild} />

        {selectedChild && <WeeklyAssessmentDashboard child={selectedChild} isParentView={true} />}

        {children.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👶</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Chưa có con nào được thêm</h2>
            <p className="text-gray-500 mb-6">Hãy thêm thông tin con của bạn để bắt đầu theo dõi</p>
          </div>
        )}
      </main>
    </div>
  )
}
