"use client"

import { useState, useEffect } from 'react'
import { DetailedNotificationsPanel } from '@/components/parent/detailed-notifications-panel'
import { CompletionNotificationsPanel } from '@/components/parent/completion-notifications-panel'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Temporary auth hook for this page
function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  const logout = () => {
    localStorage.removeItem('adhd-dashboard-user')
    setUser(null)
    window.location.href = '/'
  }

  return { user, loading: loading || !mounted, logout }
}

export default function NotificationsPage() {
  const { user, loading } = useAuth()
  const [selectedChildId, setSelectedChildId] = useState<string>('')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'parent') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Không có quyền truy cập</h1>
          <p className="text-gray-600 mb-4">Chỉ phụ huynh mới có thể xem trang này.</p>
          <Link href="/">
            <Button>Về trang chủ</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/parent">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Về Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            Thông báo chi tiết - {user.name}
          </h1>
        </div>

        <div className="mb-6">
          <label htmlFor="childSelect" className="block text-sm font-medium text-gray-700 mb-2">
            Chọn con để xem chi tiết:
          </label>
          <select
            id="childSelect"
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả các con</option>
            <option value="30">Trần Bảo Nam</option>
            <option value="28">Phạm Minh Anh</option>
            <option value="29">Nguyễn Thảo My</option>
          </select>
        </div>

        <div className="space-y-6">
          {/* Completion Notifications - Always visible */}
          <CompletionNotificationsPanel 
            parentId={user.id.toString()} 
            autoRefresh={true}
          />

          {/* Other detailed notifications */}
          <DetailedNotificationsPanel 
            parentId={user.id.toString()} 
            childId={selectedChildId || undefined}
          />
        </div>
      </div>
    </div>
  )
}