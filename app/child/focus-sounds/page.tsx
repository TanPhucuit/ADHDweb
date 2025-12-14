"use client"

import { useEffect, useState } from "react"
import type { Child, User } from "@/lib/types"
import { ChildHeader } from "@/components/child/child-header"
import { FocusSoundPlayer } from "@/components/focus/focus-sound-player"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { GoBackButton } from "@/components/ui/go-back-button"

// Real auth hook
function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('adhd-dashboard-user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        if (userData.id && userData.role && userData.email) {
          setUser(userData)
        }
      } catch (e) {
        console.error('Error parsing user:', e)
      }
    }
    setLoading(false)
  }, [])

  return { user, loading }
}

export default function ChildFocusSoundsPage() {
  const { user, loading } = useAuth()
  const [child, setChild] = useState<Child | null>(null)

  useEffect(() => {
    if (user && user.role === 'child') {
      // Create child object from user data
      setChild({
        id: user.id,
        name: user.name,
        parentId: user.parentId || '',
        age: user.age || 0,
      } as Child)
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user || user.role !== 'child') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-heading font-bold mb-2 drop-shadow-lg">Chưa đăng nhập</h2>
          <p className="font-medium drop-shadow">Vui lòng đăng nhập với tài khoản con</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <ChildHeader child={child} />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <GoBackButton className="text-gray-600 hover:bg-gray-100 font-bold" />
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-800 mb-2 drop-shadow-sm">🎵 Âm thanh tập trung</h1>
          <p className="text-gray-700 font-medium">Chọn âm thanh yêu thích để giúp con tập trung học bài tốt hơn</p>
        </div>

        <FocusSoundPlayer />
      </main>
    </div>
  )
}
