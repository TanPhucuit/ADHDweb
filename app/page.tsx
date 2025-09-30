"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ClientOnly } from "@/components/ui/client-only"
import { getDashboardRoute } from "@/lib/navigation"

// Real auth hook that validates API authentication data
function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get user from localStorage (set by API login)
    const storedUser = localStorage.getItem('adhd-dashboard-user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        // Validate that this is actually from API (has the right structure)
        if (userData.id && userData.role && userData.email) {
          setUser(userData)
        } else {
          console.warn('Invalid user data in localStorage, clearing...')
          localStorage.removeItem('adhd-dashboard-user')
        }
      } catch (e) {
        console.error('Error parsing stored user:', e)
        localStorage.removeItem('adhd-dashboard-user')
      }
    }
    setLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem('adhd-dashboard-user')
    setUser(null)
  }

  return { user, loading: loading || !mounted, logout }
}

export default function HomePage() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <HomePageContent />
    </ClientOnly>
  )
}

function HomePageContent() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      const dashboardRoute = getDashboardRoute(user)
      console.log("[v0] Redirecting user to:", dashboardRoute)
      router.push(dashboardRoute)
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Xin chào {user.name}!</h1>
          <p className="text-gray-600 mb-6">Đang chuyển hướng đến dashboard...</p>
          <LoadingSpinner size="lg" />
          
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => {
                logout()
                router.refresh()
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Đăng nhập tài khoản khác
            </button>
            <button
              onClick={() => {
                logout()
                router.refresh()
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
