"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, CheckCircle, Circle, AlertCircle, Edit3, Save, X } from "lucide-react"
import type { Child, ScheduleItem } from "@/lib/types"

interface ScheduleViewProps {
  schedule: ScheduleItem[]
  child: Child
  onTaskUpdate: (taskId: string, updates: Partial<ScheduleItem>) => void
}

export function ScheduleView({ schedule, child, onTaskUpdate }: ScheduleViewProps) {
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState("")

  const getStatusColor = (status: ScheduleItem["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-blue-500"
      case "overdue":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  const getStatusIcon = (status: ScheduleItem["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "in-progress":
        return <Clock className="w-5 h-5 text-blue-600" />
      case "overdue":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const handleStartEdit = (task: ScheduleItem) => {
    setEditingTask(task.id)
    setEditNotes(task.notes || "")
  }

  const handleSaveEdit = (taskId: string) => {
    onTaskUpdate(taskId, { notes: editNotes })
    setEditingTask(null)
    setEditNotes("")
  }

  const handleCancelEdit = () => {
    setEditingTask(null)
    setEditNotes("")
  }

  const handleToggleComplete = (task: ScheduleItem) => {
    const newStatus = task.status === "completed" ? "pending" : "completed"
    const updates: Partial<ScheduleItem> = {
      status: newStatus,
      completedAt: newStatus === "completed" ? new Date() : undefined,
    }
    onTaskUpdate(task.id, updates)
  }

  const currentTime = new Date()
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Lịch trình hôm nay - {child.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedule.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Chưa có lịch trình nào cho hôm nay</p>
          </div>
        ) : (
          schedule.map((task) => {
            const [startHour, startMinute] = task.startTime.split(":").map(Number)
            const [endHour, endMinute] = task.endTime.split(":").map(Number)
            const isCurrentTask =
              currentHour >= startHour &&
              currentHour <= endHour &&
              (currentHour < endHour || currentMinute <= endMinute)

            return (
              <div
                key={task.id}
                className={`border rounded-lg p-4 transition-all ${
                  isCurrentTask ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleToggleComplete(task)} className="flex-shrink-0">
                      {getStatusIcon(task.status)}
                    </button>
                    <div>
                      <h3
                        className={`font-semibold ${task.status === "completed" ? "line-through text-gray-500" : ""}`}
                      >
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600">{task.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.startTime} - {task.endTime}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {task.subject}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status === "completed" && "Hoàn thành"}
                      {task.status === "in-progress" && "Đang làm"}
                      {task.status === "overdue" && "Quá hạn"}
                      {task.status === "pending" && "Chờ làm"}
                    </Badge>
                    {isCurrentTask && <Badge className="bg-yellow-500 animate-pulse">Hiện tại</Badge>}
                  </div>
                </div>

                {/* Progress Bar */}
                {task.progress !== undefined && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tiến độ</span>
                      <span>{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                  </div>
                )}

                {/* Notes Section */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Ghi chú:</span>
                    {editingTask !== task.id && (
                      <Button variant="ghost" size="sm" onClick={() => handleStartEdit(task)} className="h-6 px-2">
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  {editingTask === task.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Thêm ghi chú về tiến độ, khó khăn, hoặc điều chỉnh..."
                        className="min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveEdit(task.id)}>
                          <Save className="w-3 h-3 mr-1" />
                          Lưu
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                          <X className="w-3 h-3 mr-1" />
                          Hủy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      {task.notes || (
                        <span className="text-gray-400 italic">
                          Chưa có ghi chú nào. Nhấn nút chỉnh sửa để thêm ghi chú.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
