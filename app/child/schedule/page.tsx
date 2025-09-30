"use client"

import { useEffect, useState } from "react"
import { dataStore } from "@/lib/data-store"
import type { Child, User } from "@/lib/types"

// Mock auth hook - same as main child page
function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setUser({
        id: 'child-1',
        email: 'child@example.com',
        firstName: 'Con',
        lastName: 'yêu',
        name: 'Con yêu',
        role: 'child',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      setLoading(false)
    }, 100)
  }, [])

  return { user, loading }
}
import { ChildHeader } from "@/components/child/child-header"
import { GoBackButton } from "@/components/ui/go-back-button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClockIcon, LockIcon } from "@/components/ui/icons"

export default function ChildSchedulePage() {
  const { user, loading } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [activeTab, setActiveTab] = useState<"parent" | "child">("parent")

  const parentSchedule = [
    {
      id: "1",
      title: "Làm bài tập Toán",
      time: "14:00",
      duration: "45 phút",
      description: "Hoàn thành bài tập chương 3 về phép nhân",
      emoji: "📚",
      status: "pending",
      color: "bg-orange-50",
    },
    {
      id: "2",
      title: "Đọc sách",
      time: "15:30",
      duration: "30 phút",
      description: "Đọc truyện cổ tích Việt Nam",
      emoji: "📖",
      status: "pending",
      color: "bg-green-50",
    },
    {
      id: "3",
      title: "Luyện tập piano",
      time: "16:30",
      duration: "30 phút",
      description: "Luyện bài 'Twinkle Twinkle Little Star'",
      emoji: "🎹",
      status: "pending",
      color: "bg-purple-50",
    },
  ]

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
    <div className="min-h-screen bg-gray-50">
      <ChildHeader child={child} />

      <main className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex items-center gap-4 mb-6">
          <GoBackButton />
          <div>
            <h1 className="text-xl font-bold text-gray-800">Lịch học hôm nay</h1>
            <p className="text-sm text-gray-600">Quản lý thời gian học tập của con</p>
          </div>
        </div>

        <div className="flex bg-white rounded-lg p-1 mb-6 shadow-sm">
          <button
            onClick={() => setActiveTab("parent")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "parent" ? "bg-orange-500 text-white" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            📋 Lịch trình từ Ba Mẹ
          </button>
          <button
            onClick={() => setActiveTab("child")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "child" ? "bg-orange-500 text-white" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            ✨ Lịch trình của Con
          </button>
        </div>

        {activeTab === "parent" && (
          <div className="space-y-4">
            {/* Lock notice */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <LockIcon className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-800">🔒 Lịch trình do Ba Mẹ đặt</span>
              </div>
              <p className="text-sm text-orange-700">Những hoạt động này được ba mẹ lên lịch và không thể chỉnh sửa</p>
            </div>

            {/* Schedule items */}
            {parentSchedule.map((item) => (
              <div key={item.id} className={`${item.color} border rounded-xl p-4 shadow-sm`}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{item.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-sm">
                        <ClockIcon className="w-3 h-3 text-orange-600" />
                        <span className="font-medium text-orange-600">{item.time}</span>
                      </div>
                      <span className="text-sm text-gray-600">{item.duration}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-orange-100 text-orange-700 text-xs">
                      Chưa làm
                    </Badge>
                    <LockIcon className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "child" && (
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">✨</div>
              <p className="text-lg font-medium mb-2">Lịch trình của con</p>
              <p className="text-sm">Con có thể tự tạo và quản lý hoạt động ở đây</p>
              <Button className="mt-4 bg-blue-500 hover:bg-blue-600">➕ Thêm hoạt động mới</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
