"use client"

import { useEffect, useState, useCallback } from "react"
import type { Child } from "@/lib/types"
import { ChildHeader } from "@/components/child/child-header"
import { GoBackButton } from "@/components/ui/go-back-button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { Clock, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

interface Activity {
  id: string | number
  subject: string
  title: string
  startTime: string
  endTime: string
  status: "pending" | "completed" | "missed"
}

function buildChild(u: any): Child {
  return {
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
  } as Child
}

export default function ChildSchedulePage() {
  const [child, setChild] = useState<Child | null>(null)
  const [childId, setChildId] = useState<string | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("adhd-dashboard-user")
    if (stored) {
      try {
        const u = JSON.parse(stored)
        if (u.id && u.role === "child") {
          setChild(buildChild(u))
          setChildId(String(u.id))
        }
      } catch {}
    }
    setLoading(false)
  }, [])

  const loadActivities = useCallback(async () => {
    if (!childId) return
    setFetching(true)
    setError(null)
    try {
      const res = await fetch(`/api/schedule?childId=${childId}`)
      if (!res.ok) throw new Error("Không tải được lịch học")
      const json = await res.json()
      setActivities(json.data ?? [])
    } catch {
      setError("Không thể tải lịch học. Kiểm tra kết nối và thử lại.")
    } finally {
      setFetching(false)
    }
  }, [childId])

  useEffect(() => {
    if (childId) loadActivities()
  }, [childId, loadActivities])

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

  const pending = activities.filter(a => a.status === "pending")
  const completed = activities.filter(a => a.status === "completed")

  return (
    <div className="min-h-screen bg-sky-400">
      <ChildHeader child={child} />

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <GoBackButton className="text-white hover:bg-white/20" />
          <button
            onClick={loadActivities}
            disabled={fetching}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${fetching ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">Lịch học hôm nay</h1>
          <p className="text-white/80 text-sm">
            {completed.length}/{activities.length} hoạt động hoàn thành
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {fetching && activities.length === 0 && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent" />
          </div>
        )}

        {!fetching && !error && activities.length === 0 && (
          <div className="bg-white/95 rounded-2xl shadow-lg p-10 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="font-bold text-gray-700 text-lg">Chưa có lịch học nào</p>
            <p className="text-gray-400 text-sm mt-1">Ba mẹ chưa thiết lập lịch học cho hôm nay.</p>
          </div>
        )}

        {activities.length > 0 && (
          <div className="space-y-3">
            {activities.map((act) => {
              const isDone = act.status === "completed"
              return (
                <div
                  key={act.id}
                  className={`bg-white/95 rounded-2xl shadow-sm border-2 p-4 transition-all ${
                    isDone ? "border-green-300 opacity-80" : "border-white/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isDone ? "bg-green-100" : "bg-sky-100"
                    }`}>
                      {isDone
                        ? <CheckCircle className="w-6 h-6 text-green-500" />
                        : <span className="text-2xl">📚</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{act.subject || act.title}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">{act.startTime} – {act.endTime}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {isDone ? (
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs">Hoàn thành</Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">Chưa làm</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
