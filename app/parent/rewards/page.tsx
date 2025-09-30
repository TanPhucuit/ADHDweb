"use client"

import { useEffect, useState } from "react"
import { apiService } from "@/lib/api-service"
import type { Child, User } from "@/lib/types"
import { DashboardHeader } from "@/components/parent/dashboard-header"
import { ChildSelector } from "@/components/parent/child-selector"
import { ParentRewardDashboard } from "@/components/rewards/parent-reward-dashboard"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Real auth hook that gets user from localStorage (after API login)
function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get user from localStorage (set by API login)
    const storedUser = localStorage.getItem('adhd-dashboard-user')
    console.log('🔍 Rewards page - Raw localStorage data:', storedUser)
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        console.log('🔍 Rewards page - Parsed user data:', userData)
        
        // Validate that this is actually from API (has the right structure)
        if (userData.id && userData.role && userData.email) {
          console.log('✅ Rewards page - Valid user data, setting user:', userData)
          setUser(userData)
        } else {
          console.warn('❌ Rewards page - Invalid user data in localStorage, clearing...', userData)
          localStorage.removeItem('adhd-dashboard-user')
        }
      } catch (e) {
        console.error('❌ Rewards page - Error parsing stored user:', e)
        localStorage.removeItem('adhd-dashboard-user')
      }
    } else {
      console.log('⚠️ Rewards page - No stored user found in localStorage')
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

export default function ParentRewardsPage() {
  const { user, loading } = useAuth()
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [loadingChildren, setLoadingChildren] = useState(true)

  useEffect(() => {
    if (user) {
      console.log('🏆 Parent rewards page - loading for user:', user)
      loadChildren(user.id)
    }
  }, [user])

  const loadChildren = async (parentId: string) => {
    try {
      setLoadingChildren(true)
      console.log('📋 Fetching children for parent rewards page:', parentId)
      
      // Use same API call as parent dashboard
      const response = await fetch(`/api/parent/children?parentId=${parentId}`)
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Parent rewards - children API response:', result)
        
        // API returns { data: children[] }
        const childrenData = result.data || []
        setChildren(childrenData)
        
        if (childrenData.length > 0 && !selectedChild) {
          setSelectedChild(childrenData[0])
          console.log('🎯 Selected first child for rewards:', childrenData[0])
        }
      } else {
        console.error('❌ Failed to fetch children for rewards:', response.status, response.statusText)
        setChildren([])
      }
    } catch (error) {
      console.error('❌ Error loading children for rewards:', error)
      setChildren([])
    } finally {
      setLoadingChildren(false)
    }
  }

  if (loading || loadingChildren) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user || user.role !== 'parent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-bold mb-2 text-gray-800">Chưa có quyền truy cập</h2>
          <p className="text-sm text-gray-600">Trang này chỉ dành cho phụ huynh</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <ChildSelector children={children} selectedChild={selectedChild} onChildSelect={setSelectedChild} />

        {selectedChild && <ParentRewardDashboard child={selectedChild} />}

        {!loadingChildren && children.length === 0 && (
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
