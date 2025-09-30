"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  Pause,
  Trophy,
  Send,
  Calendar,
  Timer,
  Award,
  Pill,
  Brain,
  TrendingUp,
  Music,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export function QuickActionsPanel() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const handleAction = async (action: string, message: string) => {
    setIsLoading(action)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Thành công!",
      description: message,
    })

    setIsLoading(null)
  }

  const quickActions = [
    {
      id: "reminder",
      label: "Gửi nhắc nhở",
      icon: MessageSquare,
      color: "bg-primary hover:bg-primary/90",
      message: "Đã gửi nhắc nhở đến đồng hồ của con",
    },
    {
      id: "break",
      label: "Cho nghỉ 5 phút",
      icon: Pause,
      color: "bg-secondary hover:bg-secondary/90",
      message: "Đã cho phép con nghỉ 5 phút",
    },
    {
      id: "praise",
      label: "Gửi lời khen",
      icon: Trophy,
      color: "bg-yellow-500 hover:bg-yellow-600",
      message: "Đã gửi lời khen ngợi đến con",
    },
  ]

  const featureLinks = [
    {
      href: "/parent/schedule",
      label: "Quản lý lịch trình",
      icon: Calendar,
      color: "bg-blue-500 hover:bg-blue-600",
      description: "Tạo và theo dõi lịch học tập",
    },
    {
      href: "/parent/pomodoro",
      label: "Timer Pomodoro",
      icon: Timer,
      color: "bg-green-500 hover:bg-green-600",
      description: "Kỹ thuật tập trung hiệu quả",
    },
    {
      href: "/parent/rewards",
      label: "Hệ thống thưởng",
      icon: Award,
      color: "bg-purple-500 hover:bg-purple-600",
      description: "Động lực và điểm thưởng",
    },
    {
      href: "/parent/assessment",
      label: "Đánh giá tuần",
      icon: TrendingUp,
      color: "bg-orange-500 hover:bg-orange-600",
      description: "Theo dõi tiến độ ADHD",
    },
    {
      href: "/parent/medication",
      label: "Nhắc nhở thuốc",
      icon: Pill,
      color: "bg-red-500 hover:bg-red-600",
      description: "Quản lý lịch uống thuốc",
    },
    {
      href: "/parent/focus-sounds",
      label: "Âm thanh tập trung",
      icon: Music,
      color: "bg-indigo-500 hover:bg-indigo-600",
      description: "Nhạc và âm thanh hỗ trợ",
    },
    {
      href: "/parent/ai-chat",
      label: "Dr. AI Tư vấn",
      icon: Brain,
      color: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
      description: "Chuyên gia AI 24/7",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Hành động nhanh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                onClick={() => handleAction(action.id, action.message)}
                disabled={isLoading !== null}
                className={`h-16 flex flex-col gap-2 ${action.color} text-white transition-all duration-200 transform hover:scale-[1.02]`}
              >
                {isLoading === action.id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <action.icon className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Navigation */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Công cụ hỗ trợ ADHD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featureLinks.map((feature) => (
              <Link key={feature.href} href={feature.href}>
                <Card className="cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] h-full">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-3 rounded-lg ${feature.color} text-white`}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{feature.label}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
