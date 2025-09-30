"use client"

import type { Child } from "@/lib/types"
import { Star, Heart, LogOut, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useParentActionsNotifications } from "@/hooks/use-parent-actions-notifications"
import { ParentActionsNotifications } from "@/components/child/parent-actions-notifications"
import { useState } from "react"

interface ChildHeaderProps {
  child: Child
  onLogout?: () => void
}

export function ChildHeader({ child, onLogout }: ChildHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const { notifications, unreadCount, markAsRead } = useParentActionsNotifications(child.id)

  // Get today's stats
  const today = new Date().toISOString().split("T")[0]
  const stars = 5 // Default stars value for now

  const handleNotificationClick = () => {
    setShowNotifications(true)
    markAsRead()
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      // Fallback logout logic
      localStorage.removeItem('adhd-dashboard-user')
      window.location.href = '/'
    }
  }

  return (
    <>
      <header className="bg-white/20 backdrop-blur-sm border-b border-white/30">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Greeting */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/30 rounded-full flex items-center justify-center">
                <span className="text-lg sm:text-xl">👋</span>
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-heading font-bold text-white drop-shadow-lg">{child.name}!</h1>
                <p className="text-white/90 text-xs sm:text-sm font-medium drop-shadow hidden sm:block">Hôm nay con</p>
              </div>
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Stars earned today */}
              <div className="flex items-center space-x-1 bg-white/30 rounded-full px-2 py-1 shadow-lg">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300 fill-current" />
                <span className="text-white font-bold text-xs sm:text-sm drop-shadow">{stars}</span>
              </div>

              {/* Hearts (health/mood) */}
              <div className="flex items-center space-x-1 bg-white/30 rounded-full px-2 py-1 shadow-lg">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-300 fill-current" />
                <span className="text-white font-bold text-xs sm:text-sm drop-shadow">5</span>
              </div>

              {/* Level */}
              <div className="flex items-center space-x-1 bg-white/30 rounded-full px-2 py-1 shadow-lg">
                <span className="text-white font-bold text-xs sm:text-sm drop-shadow">Lv.3</span>
              </div>

              {/* Notification Bell */}
              <button
                onClick={handleNotificationClick}
                className="relative bg-white/30 rounded-full p-2 shadow-lg hover:bg-white/40 transition-colors"
              >
                <Bell className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                className="bg-red-500/80 hover:bg-red-600/90 text-white border-0 rounded-full px-2 sm:px-3 py-1 shadow-lg font-bold min-h-[32px] sm:min-h-[36px]"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="ml-1 text-xs sm:text-sm drop-shadow">Thoát</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Modal */}
      <ParentActionsNotifications
        childId={child.id}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  )
}
