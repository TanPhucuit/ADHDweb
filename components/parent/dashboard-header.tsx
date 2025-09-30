"use client"

import type { User } from "@/lib/types"
import { useAuth } from "@/lib/auth"
import { SettingsIcon, LogOutIcon, MenuIcon, XIcon, Brain, Sparkles, PaletteIcon } from "@/components/ui/icons"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { NotificationFeed } from "@/components/parent/notification-feed"
import { AvatarCustomizationModal } from "@/components/child/avatar-customization-modal"

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { logout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const pathname = usePathname()

  const navItems = [
    { href: "/parent", label: "Dashboard", icon: "🏠" },
    { href: "/parent/reports", label: "Báo cáo", icon: "📊" },
    { href: "/parent/rewards", label: "Phần thưởng", icon: "🎁" },
    { href: "/parent/devices", label: "Thiết bị", icon: "⌚" }, // Added device management tab
    { href: "/parent/chat", label: "Tư vấn AI", icon: "🤖" },
    { href: "/parent/settings", label: "Cài đặt", icon: "⚙️" },
  ]

  const isActive = (href: string) => {
    if (href === "/parent") {
      return pathname === "/parent" || pathname === "/parent/"
    }
    return pathname.startsWith(href)
  }

  const renderAvatar = () => {
    if (userAvatar) {
      return (
        <img src={userAvatar || "/placeholder.svg"} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
      )
    }

    return (
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
        {user.name.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 relative">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo and Title - Enhanced with ADHD theme */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary via-secondary to-accent rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-bounce" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center animate-spin">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ADHD Assistant
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Theo dõi phụ huynh</p>
            </div>
          </div>

          {/* Desktop Navigation - Enhanced design */}
          <nav className="hidden md:flex items-center">
            <div className="flex items-center bg-muted/50 rounded-full p-1 space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground shadow-md transform scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/80 hover:shadow-sm"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* User Menu - Integrated avatar and menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notifications */}
            <NotificationFeed parentId={user.id} />

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
                aria-label="User menu"
              >
                {renderAvatar()}
              </button>

              {/* Unified Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-[9999] animate-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-heading font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">Phụ huynh</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowMenu(false)
                      setShowAvatarModal(true)
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <PaletteIcon className="w-4 h-4 mr-3" />
                    Tùy chỉnh Avatar
                  </button>

                  <Link
                    href="/parent/settings"
                    className="flex items-center px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <SettingsIcon className="w-4 h-4 mr-3" />
                    Cài đặt
                  </Link>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      logout()
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    <LogOutIcon className="w-4 h-4 mr-3" />
                    Đăng xuất
                  </button>
                </div>
              )}

              {showMenu && <div className="fixed inset-0 z-[9998]" onClick={() => setShowMenu(false)} />}
            </div>

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMobileNav(!showMobileNav)}>
              {showMobileNav ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Enhanced design */}
      {showMobileNav && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-50 animate-in slide-in-from-top-2">
          <nav className="container mx-auto px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-foreground hover:bg-muted/50"
                }`}
                onClick={() => setShowMobileNav(false)}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {showAvatarModal && (
        <AvatarCustomizationModal
          isOpen={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          childName={user.name}
          currentAvatar={userAvatar}
          onAvatarUpdate={(avatarUrl) => {
            console.log("[v0] Avatar updated:", avatarUrl)
            setUserAvatar(avatarUrl)
          }}
        />
      )}
    </header>
  )
}
