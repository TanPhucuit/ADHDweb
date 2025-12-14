"use client"

import { useEffect, useState } from "react"
import { AIChat } from "@/components/ai-chat"
import { GoBackButton } from "@/components/ui/go-back-button"
import type { User } from "@/lib/types"

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

export default function ChildAIChatPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user || user.role !== 'child') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2 drop-shadow-lg">Chưa đăng nhập</h2>
          <p className="font-medium drop-shadow">Vui lòng đăng nhập với tài khoản con</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-1 sm:p-2">
      <div className="container mx-auto max-w-full">
        <div className="mb-2 sm:mb-3">
          <GoBackButton className="text-white hover:bg-white/20" />
        </div>

        <div className="mb-2 sm:mb-4 text-center px-1">
          <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">🤖 Trò chuyện với Dr. AI</h1>
          <p className="text-white/80 text-xs sm:text-base">Bạn nhỏ {user.name} - Trợ lý AI luôn sẵn sàng giúp đỡ!</p>
        </div>

        <div className="h-[calc(100vh-100px)] sm:h-[calc(100vh-160px)] bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-2xl shadow-xl flex flex-col overflow-hidden">
          <AIChat
            childId={String(user.id)}
            context="Tôi đang trò chuyện với một em nhỏ ADHD. Hãy sử dụng ngôn ngữ thân thiện, dễ hiểu và khuyến khích."
          />
        </div>
      </div>
    </div>
  )
}
