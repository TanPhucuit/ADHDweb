"use client"

import type { ScheduleItem } from "@/lib/types"
import { Clock } from "@/components/ui/icons"

interface ActivitySelectorProps {
  scheduleActivities: ScheduleItem[]
  onActivitySelect: (activity: ScheduleItem) => void
}

// Map subjects to colors and emojis
const subjectMap: Record<string, { color: string, emoji: string }> = {
  "Toán": { color: "bg-blue-400", emoji: "🔢" },
  "Ngữ văn": { color: "bg-green-400", emoji: "📚" },
  "Văn": { color: "bg-green-400", emoji: "📚" },
  "Tiếng Anh": { color: "bg-purple-400", emoji: "🌍" },
  "Anh Văn": { color: "bg-purple-400", emoji: "🌍" },
  "Mỹ thuật": { color: "bg-pink-400", emoji: "🎨" },
  "Vẽ": { color: "bg-pink-400", emoji: "🎨" },
  "Âm nhạc": { color: "bg-yellow-400", emoji: "🎵" },
  "Nhạc": { color: "bg-yellow-400", emoji: "🎵" },
  "Thể dục": { color: "bg-orange-400", emoji: "⚽" },
  "Chơi": { color: "bg-orange-400", emoji: "🎮" },
  "Khoa học": { color: "bg-gray-400", emoji: "🔬" },
  // Default fallback
  "default": { color: "bg-gray-400", emoji: "📖" }
}

export function ActivitySelector({ scheduleActivities, onActivitySelect }: ActivitySelectorProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Con muốn học gì?</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {scheduleActivities.map((activity) => {
          const subjectInfo = subjectMap[activity.subject] || subjectMap["default"]
          // startTime và endTime đã là string format "HH:MM" 
          const startTime = activity.startTime
          const endTime = activity.endTime
          
          return (
            <button
              key={activity.id}
              onClick={() => onActivitySelect(activity)}
              className={`${subjectInfo.color} hover:scale-105 transform transition-all duration-200 rounded-2xl p-4 text-white shadow-lg relative`}
            >
              <div className="text-3xl mb-2">{subjectInfo.emoji}</div>
              <p className="font-bold text-base mb-1">{activity.subject}</p>
              <div className="flex items-center justify-center text-xs opacity-90">
                <Clock className="w-3 h-3 mr-1" />
                <span>{startTime} - {endTime}</span>
              </div>
              {activity.status && (
                <div className="absolute top-2 right-2">
                  {activity.status === 'completed' && <span className="text-green-200">✅</span>}
                  {activity.status === 'in-progress' && <span className="text-yellow-200">⏳</span>}
                  {activity.status === 'overdue' && <span className="text-red-200">❌</span>}
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