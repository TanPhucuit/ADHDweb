"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import type { ScheduleItem } from "@/lib/types"

interface TaskProgressProps {
  schedule: ScheduleItem[]
}

export function TaskProgress({ schedule }: TaskProgressProps) {
  const totalTasks = schedule.length
  const completedTasks = schedule.filter((task) => task.status === "completed").length
  const inProgressTasks = schedule.filter((task) => task.status === "in-progress").length
  const overdueTasks = schedule.filter((task) => task.status === "overdue").length

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  // Calculate total planned time vs completed time
  const totalPlannedMinutes = schedule.reduce((total, task) => {
    const [startHour, startMinute] = task.startTime.split(":").map(Number)
    const [endHour, endMinute] = task.endTime.split(":").map(Number)
    const duration = endHour * 60 + endMinute - (startHour * 60 + startMinute)
    return total + duration
  }, 0)

  const completedMinutes = schedule
    .filter((task) => task.status === "completed")
    .reduce((total, task) => {
      const [startHour, startMinute] = task.startTime.split(":").map(Number)
      const [endHour, endMinute] = task.endTime.split(":").map(Number)
      const duration = endHour * 60 + endMinute - (startHour * 60 + startMinute)
      return total + duration
    }, 0)

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins > 0 ? `${mins}m` : ""}`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Tiến độ tổng quan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Hoàn thành</span>
              <span className="font-medium">
                {completedTasks}/{totalTasks} nhiệm vụ
              </span>
            </div>
            <Progress value={completionRate} className="h-3" />
            <p className="text-xs text-gray-500">{completionRate.toFixed(0)}% hoàn thành</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm font-medium">{completedTasks}</p>
              <p className="text-xs text-gray-500">Hoàn thành</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium">{inProgressTasks}</p>
              <p className="text-xs text-gray-500">Đang làm</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full mx-auto mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-sm font-medium">{overdueTasks}</p>
              <p className="text-xs text-gray-500">Quá hạn</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Thời gian học tập
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Thời gian hoàn thành</span>
              <span className="font-medium">
                {formatTime(completedMinutes)} / {formatTime(totalPlannedMinutes)}
              </span>
            </div>
            <Progress
              value={totalPlannedMinutes > 0 ? (completedMinutes / totalPlannedMinutes) * 100 : 0}
              className="h-3"
            />
            <p className="text-xs text-gray-500">
              {totalPlannedMinutes > 0
                ? `${((completedMinutes / totalPlannedMinutes) * 100).toFixed(0)}% thời gian đã hoàn thành`
                : "Chưa có lịch trình"}
            </p>
          </div>

          {/* Subject Breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Môn học hôm nay:</h4>
            <div className="flex flex-wrap gap-1">
              {Array.from(new Set(schedule.map((task) => task.subject))).map((subject) => {
                const subjectTasks = schedule.filter((task) => task.subject === subject)
                const subjectCompleted = subjectTasks.filter((task) => task.status === "completed").length
                return (
                  <Badge key={subject} variant="outline" className="text-xs">
                    {subject} ({subjectCompleted}/{subjectTasks.length})
                  </Badge>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
