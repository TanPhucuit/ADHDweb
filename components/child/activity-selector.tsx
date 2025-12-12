"use client"

import type { ScheduleItem } from "@/lib/types"
import { Clock } from "@/components/ui/icons"

interface ActivitySelectorProps {
  scheduleActivities: ScheduleItem[]
  onActivitySelect: (activity: ScheduleItem) => void
}

// Map subjects to emojis only (colors will be determined by status)
const subjectEmojis: Record<string, string> = {
  "Toán": "📘",
  "Toán học": "📘",
  "Ngữ văn": "📚",
  "Văn": "📚",
  "Văn học": "📚",
  "Tiếng Anh": "🌍",
  "Anh Văn": "🌍",
  "Mỹ thuật": "🎨",
  "Vẽ": "🎨",
  "Âm nhạc": "🎵",
  "Nhạc": "🎵",
  "Thể dục": "⚽",
  "Chơi": "🎮",
  "Khoa học": "🔬",
  "Lịch sử": "📘",
  "Địa lý": "📘",
  "Tiếng Việt": "📘",
  "default": "📖"
}

// Mảng màu ngẫu nhiên cho các môn học chưa hoàn thành
const pendingColors = [
  "bg-blue-400",
  "bg-green-400", 
  "bg-purple-400",
  "bg-pink-400",
  "bg-yellow-400",
  "bg-orange-400",
  "bg-indigo-400",
  "bg-teal-400",
  "bg-rose-400",
  "bg-cyan-400"
]

// Hàm lấy màu ngẫu nhiên dựa trên id để consistent
const getRandomColor = (id: string): string => {
  // Sử dụng hash đơn giản từ id để chọn màu (consistent cho cùng id)
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i)
    hash = hash & hash
  }
  return pendingColors[Math.abs(hash) % pendingColors.length]
}

export function ActivitySelector({ scheduleActivities, onActivitySelect }: ActivitySelectorProps) {
  // Debug log để kiểm tra status  
  console.log('🎯 ActivitySelector - Rendering', scheduleActivities.length, 'activities')
  console.table(scheduleActivities.map(a => ({
    subject: a.subject,
    time: `${a.startTime}-${a.endTime}`,
    status: a.status,
    isCompleted: a.status === 'completed'
  })))
  
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Con muốn học gì?</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {scheduleActivities.map((activity) => {
          const emoji = subjectEmojis[activity.subject] || subjectEmojis["default"]
          // startTime và endTime đã là string format "HH:MM" 
          const startTime = activity.startTime
          const endTime = activity.endTime
          
          // Xác định màu nền dựa trên status
          // - completed: màu xám và không cho click
          // - pending/other: màu ngẫu nhiên và cho phép click
          const isCompleted = activity.status === 'completed'
          console.log(`📌 Activity ${activity.subject}: status="${activity.status}", isCompleted=${isCompleted}`)
          
          // QUAN TRỌNG: Chỉ xám ĐẬM khi completed, ngược lại dùng màu SÁNG ngẫu nhiên
          // Dùng bg-slate-600 để phân biệt rõ ràng với các màu khác
          const bgColor = isCompleted ? 'bg-slate-600' : getRandomColor(activity.id)
          
          return (
            <button
              key={activity.id}
              onClick={(e) => {
                if (isCompleted) {
                  e.preventDefault()
                  e.stopPropagation()
                  console.warn('⛔ BLOCKED: Cannot click completed activity:', activity.subject)
                  return false
                }
                console.log('✅ Clicked on pending activity:', activity.subject)
                onActivitySelect(activity)
              }}
              disabled={isCompleted}
              className={`${bgColor} ${
                isCompleted 
                  ? 'cursor-not-allowed opacity-60 pointer-events-none' 
                  : 'hover:scale-105 cursor-pointer active:scale-95'
              } transform transition-all duration-200 rounded-2xl p-4 text-white shadow-lg relative`}
            >
              <div className="text-3xl mb-2">{emoji}</div>
              <p className="font-bold text-base mb-1">{activity.subject}</p>
              <div className="flex items-center justify-center text-xs opacity-90">
                <Clock className="w-3 h-3 mr-1" />
                <span>{startTime} - {endTime}</span>
              </div>
              {/* Chỉ hiển thị dấu tích xanh khi completed */}
              {isCompleted && (
                <div className="absolute top-2 right-2">
                  <span className="text-green-500 text-xl">✅</span>
                </div>
              )}
              {activity.status === 'in-progress' && (
                <div className="absolute top-2 right-2">
                  <span className="text-yellow-200">⏳</span>
                </div>
              )}
            </button>
          )
        })}
      </div>
      
      {scheduleActivities.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg">Hôm nay không có lịch học nào 📅</p>
          <p className="text-sm mt-2">Hãy nghỉ ngơi hoặc tự học nhé! 😊</p>
        </div>
      )}
    </div>
  )
}