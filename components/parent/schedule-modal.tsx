"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  childId: string
}

interface Activity {
  subject: string
  start_time: string
  end_time: string
  notes: string
}

export function ScheduleModal({ isOpen, onClose, childId }: ScheduleModalProps) {
  const [activities, setActivities] = useState<Activity[]>([
    { subject: "", start_time: "", end_time: "", notes: "" }
  ])
  const [loading, setLoading] = useState(false)

  const subjects = [
    "Toán học",
    "Tiếng Việt", 
    "Tiếng Anh",
    "Khoa học",
    "Lịch sử",
    "Địa lý",
    "Thể dục",
    "Âm nhạc",
    "Mỹ thuật"
  ]

  const addActivity = () => {
    setActivities([...activities, { subject: "", start_time: "", end_time: "", notes: "" }])
  }

  const removeActivity = (index: number) => {
    if (activities.length > 1) {
      setActivities(activities.filter((_, i) => i !== index))
    }
  }

  const updateActivity = (index: number, field: keyof Activity, value: string) => {
    const updated = activities.map((activity, i) => 
      i === index ? { ...activity, [field]: value } : activity
    )
    setActivities(updated)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      const response = await fetch("/api/parent/create-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          activities: activities.filter(a => a.subject && a.start_time && a.end_time)
        })
      })

      if (response.ok) {
        alert("Lịch học đã được tạo thành công!")
        onClose()
        setActivities([{ subject: "", start_time: "", end_time: "", notes: "" }])
      } else {
        alert("Có lỗi xảy ra khi tạo lịch học")
      }
    } catch (error) {
      alert("Có lỗi xảy ra: " + error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-center text-gray-800">Xếp lịch học cho con</h2>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {activities.map((activity, index) => (
              <div key={index} className="border border-gray-200 p-6 rounded-lg space-y-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-800 text-lg">Hoạt động {index + 1}</h4>
                  {activities.length > 1 && (
                    <button 
                      className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      onClick={() => removeActivity(index)}
                    >
                      Xóa
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="w-full">
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Môn học</Label>
                    <Select 
                      value={activity.subject} 
                      onValueChange={(value) => updateActivity(index, "subject", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn môn học" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">Giờ bắt đầu</Label>
                      <Input 
                        type="time"
                        className="w-full"
                        value={activity.start_time}
                        onChange={(e) => updateActivity(index, "start_time", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">Giờ kết thúc</Label>
                      <Input 
                        type="time"
                        className="w-full"
                        value={activity.end_time}
                        onChange={(e) => updateActivity(index, "end_time", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="w-full">
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</Label>
                    <Input 
                      className="w-full"
                      value={activity.notes}
                      onChange={(e) => updateActivity(index, "notes", e.target.value)}
                      placeholder="Ghi chú thêm (tùy chọn)"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              onClick={addActivity} 
              className="w-full py-4 px-6 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors font-semibold text-lg"
            >
              + Thêm hoạt động
            </button>
            
            <div className="flex gap-4 pt-8">
              <button 
                onClick={onClose} 
                className="flex-1 py-4 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg"
              >
                Hủy
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading || !activities.some(a => a.subject && a.start_time && a.end_time)}
                className="flex-1 py-4 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
              >
                {loading ? "Đang tạo..." : "Tạo lịch học"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}