"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Clock, TrendingUp, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Goals {
  dailyFocusTime: number // in minutes
  dailyFocusScore: number // percentage
  weeklyFocusTime: number // in minutes
  interventionLimit: number // max interventions per day
}

export function GoalSettings() {
  const [goals, setGoals] = useState<Goals>({
    dailyFocusTime: 240, // 4 hours
    dailyFocusScore: 70,
    weeklyFocusTime: 1200, // 20 hours
    interventionLimit: 10,
  })

  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Current progress (mock data)
  const currentProgress = {
    todayFocusTime: 180, // 3 hours
    todayFocusScore: 75,
    weekFocusTime: 850,
    todayInterventions: 8,
  }

  const updateGoal = (key: keyof Goals, value: number) => {
    setGoals((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Đã lưu mục tiêu!",
      description: "Các mục tiêu mới đã được thiết lập.",
    })

    setIsLoading(false)
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins > 0 ? `${mins}m` : ""}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Mục tiêu hàng ngày
        </CardTitle>
        <CardDescription>Thiết lập các mục tiêu để theo dõi tiến độ của con</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Focus Time Goal */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-semibold">Thời gian tập trung hàng ngày</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Label htmlFor="dailyFocusTime" className="min-w-0 flex-1">
                Mục tiêu (phút)
              </Label>
              <Input
                id="dailyFocusTime"
                type="number"
                min="30"
                max="480"
                step="30"
                value={goals.dailyFocusTime}
                onChange={(e) => updateGoal("dailyFocusTime", Number.parseInt(e.target.value) || 0)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground min-w-0">({formatTime(goals.dailyFocusTime)})</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tiến độ hôm nay</span>
                <span className="font-medium">
                  {formatTime(currentProgress.todayFocusTime)} / {formatTime(goals.dailyFocusTime)}
                </span>
              </div>
              <Progress value={(currentProgress.todayFocusTime / goals.dailyFocusTime) * 100} className="h-2" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {Math.round((currentProgress.todayFocusTime / goals.dailyFocusTime) * 100)}% hoàn thành
                </span>
                {currentProgress.todayFocusTime >= goals.dailyFocusTime && (
                  <Badge className="bg-green-500 text-white">
                    <Award className="w-3 h-3 mr-1" />
                    Đạt mục tiêu!
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Focus Score Goal */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-semibold">Điểm tập trung trung bình</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Label htmlFor="dailyFocusScore" className="min-w-0 flex-1">
                Mục tiêu (%)
              </Label>
              <Input
                id="dailyFocusScore"
                type="number"
                min="50"
                max="100"
                step="5"
                value={goals.dailyFocusScore}
                onChange={(e) => updateGoal("dailyFocusScore", Number.parseInt(e.target.value) || 0)}
                className="w-24"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Điểm hiện tại</span>
                <span className="font-medium">
                  {currentProgress.todayFocusScore}% / {goals.dailyFocusScore}%
                </span>
              </div>
              <Progress value={(currentProgress.todayFocusScore / goals.dailyFocusScore) * 100} className="h-2" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {currentProgress.todayFocusScore >= goals.dailyFocusScore ? "Vượt mục tiêu" : "Cần cải thiện"}
                </span>
                {currentProgress.todayFocusScore >= goals.dailyFocusScore && (
                  <Badge className="bg-green-500 text-white">
                    <Award className="w-3 h-3 mr-1" />
                    Xuất sắc!
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Focus Time Goal */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-semibold">Mục tiêu tuần</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Label htmlFor="weeklyFocusTime" className="min-w-0 flex-1">
                Thời gian tập trung (phút)
              </Label>
              <Input
                id="weeklyFocusTime"
                type="number"
                min="300"
                max="2400"
                step="60"
                value={goals.weeklyFocusTime}
                onChange={(e) => updateGoal("weeklyFocusTime", Number.parseInt(e.target.value) || 0)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground min-w-0">({formatTime(goals.weeklyFocusTime)})</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tiến độ tuần này</span>
                <span className="font-medium">
                  {formatTime(currentProgress.weekFocusTime)} / {formatTime(goals.weeklyFocusTime)}
                </span>
              </div>
              <Progress value={(currentProgress.weekFocusTime / goals.weeklyFocusTime) * 100} className="h-2" />
            </div>
          </div>
        </div>

        {/* Intervention Limit */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-semibold">Giới hạn can thiệp</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Label htmlFor="interventionLimit" className="min-w-0 flex-1">
                Tối đa mỗi ngày
              </Label>
              <Input
                id="interventionLimit"
                type="number"
                min="5"
                max="20"
                value={goals.interventionLimit}
                onChange={(e) => updateGoal("interventionLimit", Number.parseInt(e.target.value) || 0)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">lần</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Đã sử dụng hôm nay</span>
              <span
                className={`font-medium ${
                  currentProgress.todayInterventions >= goals.interventionLimit
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {currentProgress.todayInterventions} / {goals.interventionLimit}
              </span>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? "Đang lưu..." : "Lưu mục tiêu"}
        </Button>
      </CardContent>
    </Card>
  )
}
