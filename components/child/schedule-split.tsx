"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ClockIcon, PlusIcon, EditIcon, LockIcon } from "@/components/ui/icons"

interface ScheduleItem {
  id: string
  title: string
  time: string
  duration: string
  type: "parent" | "child"
  completed?: boolean
  description?: string
  emoji?: string
  color?: string
}

export function ScheduleSplit() {
  const [parentSchedule] = useState<ScheduleItem[]>([
    {
      id: "1",
      title: "Làm bài tập Toán",
      time: "14:00",
      duration: "45 phút",
      type: "parent",
      completed: false,
      description: "Hoàn thành bài tập chương 3 về phép nhân",
      emoji: "📚",
      color: "bg-gradient-to-r from-orange-100 to-orange-50",
    },
    {
      id: "2",
      title: "Đọc sách",
      time: "15:30",
      duration: "30 phút",
      type: "parent",
      completed: false,
      description: "Đọc truyện cổ tích Việt Nam",
      emoji: "📖",
      color: "bg-gradient-to-r from-green-100 to-green-50",
    },
    {
      id: "3",
      title: "Luyện tập piano",
      time: "16:30",
      duration: "30 phút",
      type: "parent",
      completed: false,
      description: "Luyện bài 'Twinkle Twinkle Little Star'",
      emoji: "🎹",
      color: "bg-gradient-to-r from-purple-100 to-purple-50",
    },
  ])

  const [childSchedule, setChildSchedule] = useState<ScheduleItem[]>([
    {
      id: "4",
      title: "Chơi game giáo dục",
      time: "17:00",
      duration: "20 phút",
      type: "child",
      completed: false,
      description: "Chơi game học từ vựng tiếng Anh",
      emoji: "🎮",
      color: "bg-gradient-to-r from-blue-100 to-blue-50",
    },
    {
      id: "5",
      title: "Vẽ tranh",
      time: "19:00",
      duration: "25 phút",
      type: "child",
      completed: false,
      description: "Vẽ tranh về gia đình",
      emoji: "🎨",
      color: "bg-gradient-to-r from-pink-100 to-pink-50",
    },
  ])

  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const addChildScheduleItem = () => {
    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      title: "Hoạt động mới",
      time: "20:00",
      duration: "15 phút",
      type: "child",
      completed: false,
      description: "Mô tả hoạt động",
      emoji: "⭐",
      color: "bg-gradient-to-r from-yellow-100 to-yellow-50",
    }
    setChildSchedule([...childSchedule, newItem])
  }

  const toggleComplete = (id: string, type: "parent" | "child") => {
    if (type === "child") {
      setChildSchedule((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
    }
  }

  const handleEditItem = (item: ScheduleItem) => {
    setEditingItem(item)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingItem) {
      setChildSchedule((prev) => prev.map((item) => (item.id === editingItem.id ? editingItem : item)))
      setIsEditDialogOpen(false)
      setEditingItem(null)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <Tabs defaultValue="parent" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card rounded-xl p-1 shadow-sm">
          <TabsTrigger
            value="parent"
            className="rounded-lg font-heading text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
          >
            📋 Lịch trình từ Ba Mẹ
          </TabsTrigger>
          <TabsTrigger
            value="child"
            className="rounded-lg font-heading text-sm font-medium data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground transition-all duration-200"
          >
            ✨ Lịch trình của Con
          </TabsTrigger>
        </TabsList>

        <TabsContent value="parent" className="space-y-4 mt-6">
          <Card className="border-primary/20 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-primary font-heading text-lg">
                <div className="p-2 bg-primary/10 rounded-full">
                  <LockIcon className="h-5 w-5 text-primary" />
                </div>
                🔒 Lịch trình do Ba Mẹ đặt
              </CardTitle>
              <CardDescription className="text-primary/80 font-medium">
                Những hoạt động này được ba mẹ lên lịch và không thể chỉnh sửa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {parentSchedule.map((item) => (
                <div
                  key={item.id}
                  className={`${item.color} border border-white/50 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 ${
                    item.completed ? "opacity-75" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">{item.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full shadow-sm">
                            <ClockIcon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-bold text-primary">{item.time}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs px-2 py-1 bg-white/60">
                            {item.duration}
                          </Badge>
                        </div>
                        <h4
                          className={`font-heading font-bold text-base mb-1 ${
                            item.completed ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant={item.completed ? "default" : "secondary"}
                        size="sm"
                        className="font-medium text-xs px-3 py-1.5 rounded-full shadow-sm"
                        disabled
                      >
                        {item.completed ? "✅ Hoàn thành" : "⏳ Chưa làm"}
                      </Button>
                      <LockIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="child" className="space-y-4 mt-6">
          <Card className="border-secondary/20 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-secondary font-heading text-lg">
                    <div className="p-2 bg-secondary/10 rounded-full">
                      <EditIcon className="h-5 w-5 text-secondary" />
                    </div>
                    ✨ Lịch trình của Con
                  </CardTitle>
                  <CardDescription className="text-secondary/80 font-medium">
                    Con có thể tự tạo và quản lý những hoạt động này
                  </CardDescription>
                </div>
                <Button
                  onClick={addChildScheduleItem}
                  size="sm"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />➕ Thêm hoạt động
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {childSchedule.map((item) => (
                <div
                  key={item.id}
                  className={`${item.color} border border-white/50 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 ${
                    item.completed ? "opacity-75" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">{item.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full shadow-sm">
                            <ClockIcon className="h-4 w-4 text-secondary" />
                            <span className="text-sm font-bold text-secondary">{item.time}</span>
                          </div>
                          <Badge variant="outline" className="text-xs px-2 py-1 bg-white/60">
                            {item.duration}
                          </Badge>
                        </div>
                        <h4
                          className={`font-heading font-bold text-base mb-1 ${
                            item.completed ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant={item.completed ? "default" : "secondary"}
                        size="sm"
                        onClick={() => toggleComplete(item.id, "child")}
                        className="font-medium text-xs px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        {item.completed ? "✅ Hoàn thành" : "⭐ Đánh dấu xong"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditItem(item)}
                        className="h-8 w-8 p-0 hover:bg-white/50 rounded-full"
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-blue-800">✏️ Chỉnh sửa hoạt động</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-bold">
                  Tên hoạt động
                </Label>
                <Input
                  id="title"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="text-base"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-bold">
                    Thời gian
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={editingItem.time}
                    onChange={(e) => setEditingItem({ ...editingItem, time: e.target.value })}
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-bold">
                    Thời lượng
                  </Label>
                  <Input
                    id="duration"
                    value={editingItem.duration}
                    onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })}
                    placeholder="VD: 30 phút"
                    className="text-base"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold">
                  Mô tả
                </Label>
                <Input
                  id="description"
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Mô tả chi tiết hoạt động..."
                  className="text-base"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSaveEdit} className="bg-blue-500 hover:bg-blue-600 text-white font-bold">
                  💾 Lưu thay đổi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
