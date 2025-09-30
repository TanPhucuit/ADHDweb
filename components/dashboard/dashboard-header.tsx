"use client"

import { SettingsIcon, UserIcon, MessageSquareIcon, FileTextIcon, LogOutIcon } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { NotificationDropdown } from "@/components/ui/notification-dropdown"

export function DashboardHeader() {
  const { logout } = useAuth()

  const childNotifications = [
    {
      id: "1",
      title: "Bài tập mới",
      message: "Ba mẹ đã thêm bài tập Toán cho bạn",
      time: "10 phút trước",
      type: "info" as const,
      read: false,
    },
    {
      id: "2",
      title: "Chúc mừng!",
      message: "Bạn đã hoàn thành 5 bài tập hôm nay",
      time: "30 phút trước",
      type: "success" as const,
      read: false,
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Child Name */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">AS</span>
          </div>
          <div>
            <h1 className="font-heading font-semibold text-lg">Minh An</h1>
            <p className="text-xs text-muted-foreground">ADHD Smart Assistant</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Reports button */}
          <Link href="/reports">
            <Button variant="ghost" size="icon">
              <FileTextIcon className="w-5 h-5" />
            </Button>
          </Link>

          {/* AI Chat button */}
          <Link href="/chat">
            <Button variant="ghost" size="icon">
              <MessageSquareIcon className="w-5 h-5" />
            </Button>
          </Link>

          <NotificationDropdown notifications={childNotifications} />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/parent-avatar.png" alt="Parent" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <UserIcon className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Hồ sơ</span>
              </DropdownMenuItem>
              <Link href="/settings">
                <DropdownMenuItem>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Cài đặt</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
