"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Coffee, Trophy, Heart, Clock, MessageCircle, Calendar, X, Plus } from "lucide-react"
import { ScheduleModal } from "./schedule-modal"
import { useToast } from "@/hooks/use-toast" // Import useToast hook
import { showCustomToast } from "@/components/ui/custom-toast" // Import custom toast
import { instantNotificationService } from "@/lib/instant-notification-service" // Import instant notification service

interface QuickActionsProps {
  selectedChildId?: string
  parentId?: string
  onScheduleCreated?: () => void
}

export function QuickActions({ selectedChildId, parentId, onScheduleCreated }: QuickActionsProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast() // Initialize toast hook

  const handleScheduleClick = () => {
    if (!selectedChildId) {
      alert("Vui lòng chọn con trước khi xếp lịch")
      return
    }
    setShowScheduleModal(true)
  }

  const handleActionClick = async (actionLabel: string, actionName: string) => {
    console.log('🎯 handleActionClick called:', { parentId, actionLabel, actionName })
    
    if (!parentId) {
      console.error('❌ Missing parentId')
      alert("Không tìm thấy thông tin phụ huynh")
      return
    }

    setIsLoading(true)
    try {
      // Handle break — send notification directly to child
      if (actionLabel === 'nghi-ngoi') {
        if (selectedChildId) {
          await instantNotificationService.sendInstantNotification(
            selectedChildId,
            'nghi-giai-lao'
          )
        }
        showCustomToast("Đã cho con nghỉ giải lao!", "action-success")
        toast({ title: "Thành công", description: "Đã gửi thông báo nghỉ giải lao cho con!" })
        return
      }

      // Handle other actions normally
      console.log('📤 Sending action request:', {
        parentId,
        actionLabel,
        actionName,
        timestamp: new Date().toISOString()
      })
      
      const response = await fetch('/api/parent/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId,
          actionLabel,
          actionName,
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        try {
          const result = await response.json()
          console.log('✅ Action recorded:', result)
          showCustomToast("Hành động đã được ghi nhận thành công!", "action-success") // Custom popup
          toast({
            title: "Thành công",
            description: "Hành động đã được ghi nhận thành công!",
          }) // Show success toast

          // Send instant notification to child via Supabase Realtime
          if (selectedChildId) {
            await instantNotificationService.sendInstantNotification(
              selectedChildId,
              actionLabel
            )
          }
        } catch (jsonError) {
          console.error("❌ Error parsing JSON response:", jsonError)
          showCustomToast("Phản hồi từ server không hợp lệ.", "error")
          toast({
            title: "Lỗi",
            description: "Phản hồi từ server không hợp lệ.",
          }) // Show error toast for invalid JSON
        }
      } else {
        let errorMessage = "Có lỗi xảy ra khi ghi nhận hành động."
        try {
          const errorData = await response.json()
          console.error("❌ API Error:", response.status, errorData)
          errorMessage = errorData.error || errorData.details || errorMessage
        } catch {
          const text = await response.text()
          console.error("❌ Error response text:", text)
        }
        
        showCustomToast(errorMessage, "error")
        toast({
          title: "Lỗi",
          description: errorMessage,
        }) // Show error toast with details
      }
    } catch (error) {
      console.error("Error recording action:", error)
      showCustomToast("Có lỗi xảy ra khi ghi nhận hành động.", "error")
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi ghi nhận hành động.",
      }) // Show error toast
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <>
    <Card>
      <CardContent className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-center text-gray-800">
          Hành động nhanh
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div 
            className="bg-blue-500 text-white rounded-xl p-3 sm:p-4 text-center hover:bg-blue-600 transition-colors cursor-pointer"
            onClick={() => handleActionClick('nhac-tap-trung', 'Nhắc tập trung')}
          >
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">💭</div>
            <div className="font-medium text-xs sm:text-sm">Nhắc tập trung</div>
            <div className="text-xs opacity-90 hidden sm:block">Gửi nhắc nhở tập trung</div>
          </div>
          
          <button 
            className="bg-orange-500 hover:bg-orange-600 text-white p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center transition-colors"
            onClick={() => handleActionClick('nghi-ngoi', 'Nghỉ giải lao')}
            disabled={isLoading}
          >
            <Coffee className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
            <span className="text-xs sm:text-sm font-medium">Nghỉ giải lao</span>
            <span className="text-xs opacity-90 hidden sm:block">Đề xuất nghỉ ngơi</span>
          </button>
          
          <div 
            className="bg-green-500 text-white rounded-xl p-3 sm:p-4 text-center hover:bg-green-600 transition-colors cursor-pointer"
            onClick={() => handleActionClick('khen-ngoi', 'Khen ngợi')}
          >
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🏆</div>
            <div className="font-medium text-xs sm:text-sm">Khen ngợi</div>
            <div className="text-xs opacity-90 hidden sm:block">Gửi lời khen ngợi</div>
          </div>
          
          <button 
            className="bg-pink-500 hover:bg-pink-600 text-white p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center transition-colors"
            onClick={() => handleActionClick('dong-vien', 'Động viên')}
            disabled={isLoading}
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
            <span className="text-xs sm:text-sm font-medium">Động viên</span>
            <span className="text-xs opacity-90 hidden sm:block">Động viên tinh thần</span>
          </button>
          
          <button 
            className="bg-purple-500 hover:bg-purple-600 text-white p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center transition-colors"
            onClick={handleScheduleClick}
          >
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
            <span className="text-xs sm:text-sm font-medium">Xếp lịch cho con</span>
            <span className="text-xs opacity-90 hidden sm:block">Tạo lịch học mới</span>
          </button>
          
          <button 
            className="bg-indigo-500 hover:bg-indigo-600 text-white p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center transition-colors"
            onClick={() => handleActionClick('kiem-tra-thoi-gian', 'Kiểm tra thời gian')}
            disabled={isLoading}
          >
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
            <span className="text-xs sm:text-sm font-medium">Kiểm tra thời gian</span>
            <span className="text-xs opacity-90 hidden sm:block">Nhắc nhở thời gian</span>
          </button>
        </div>
      </CardContent>
    </Card>

    {selectedChildId && (
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        childId={selectedChildId}
        onSuccess={onScheduleCreated}
      />
    )}
  </>
)
}
