"use client"

import type { ScheduleItem } from "@/lib/types"
import { CheckCircle2, Circle, PlayCircle, Clock, Target, Coffee } from "lucide-react"

interface ActivitySelectorProps {
  scheduleActivities: ScheduleItem[]
  onActivitySelect: (activity: ScheduleItem) => void
  dailyTarget?: number     // số bài cần hoàn thành hôm nay
  breakInterval?: number   // nghỉ giải lao mỗi X phút
}

const subjectEmojis: Record<string, string> = {
  "Toán": "📘", "Toán học": "📘",
  "Ngữ văn": "📚", "Văn": "📚", "Văn học": "📚",
  "Tiếng Anh": "🌍", "Anh Văn": "🌍",
  "Mỹ thuật": "🎨", "Vẽ": "🎨",
  "Âm nhạc": "🎵", "Nhạc": "🎵",
  "Thể dục": "⚽",
  "Chơi": "🎮",
  "Khoa học": "🔬",
  "Lịch sử": "🏛️",
  "Địa lý": "🗺️",
  "Tiếng Việt": "📝",
  "default": "📖"
}

const subjectColors: Record<string, string> = {
  "Toán": "bg-blue-500", "Toán học": "bg-blue-500",
  "Ngữ văn": "bg-purple-500", "Văn": "bg-purple-500", "Văn học": "bg-purple-500",
  "Tiếng Anh": "bg-green-500", "Anh Văn": "bg-green-500",
  "Mỹ thuật": "bg-pink-500", "Vẽ": "bg-pink-500",
  "Âm nhạc": "bg-yellow-500", "Nhạc": "bg-yellow-500",
  "Thể dục": "bg-orange-500",
  "Khoa học": "bg-teal-500",
  "Lịch sử": "bg-amber-600",
  "Địa lý": "bg-cyan-500",
  "Tiếng Việt": "bg-indigo-500",
  "default": "bg-sky-500"
}

// Tính thời lượng (phút) từ startTime và endTime (HH:MM)
function getDurationMinutes(startTime: string, endTime: string): number {
  try {
    const [sh, sm] = startTime.split(":").map(Number)
    const [eh, em] = endTime.split(":").map(Number)
    const startMins = sh * 60 + sm
    const endMins = eh * 60 + em
    const diff = endMins - startMins
    return diff > 0 ? diff : 0
  } catch {
    return 0
  }
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "—"
  if (minutes < 60) return `${minutes} phút`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}g ${m}p` : `${h} giờ`
}

export function ActivitySelector({ scheduleActivities, onActivitySelect, dailyTarget, breakInterval = 25 }: ActivitySelectorProps) {
  const pending = scheduleActivities.filter(a => a.status !== "completed")
  const completed = scheduleActivities.filter(a => a.status === "completed")
  const total = scheduleActivities.length
  const completedCount = completed.length
  const target = dailyTarget ?? total
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
      {/* Header + Progress */}
      <div className="bg-sky-500 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">📋 Lịch học hôm nay</h2>
          <span className="text-white/90 text-sm font-semibold">
            {completedCount}/{total} bài
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/30 rounded-full h-3 mb-3">
          <div
            className="bg-yellow-300 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-white/85 text-xs">
          <div className="flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            <span>Mục tiêu: {target} bài</span>
          </div>
          <div className="flex items-center gap-1">
            <Coffee className="w-3.5 h-3.5" />
            <span>Nghỉ mỗi {breakInterval} phút</span>
          </div>
          {completedCount >= target && (
            <span className="ml-auto text-yellow-300 font-bold">🎉 Xong rồi!</span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Cần làm */}
        {pending.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
              Cần làm — {pending.length} bài
            </p>
            <div className="space-y-2">
              {pending.map((activity) => {
                const emoji = subjectEmojis[activity.subject] || subjectEmojis["default"]
                const color = subjectColors[activity.subject] || subjectColors["default"]
                const duration = getDurationMinutes(activity.startTime, activity.endTime)
                const isInProgress = activity.status === "in-progress"

                return (
                  <button
                    key={activity.id}
                    onClick={() => onActivitySelect(activity)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 hover:bg-sky-50 border border-gray-200 hover:border-sky-300 transition-all duration-200 active:scale-[0.98] text-left group"
                  >
                    {/* Color dot + emoji */}
                    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className="text-lg">{emoji}</span>
                    </div>

                    {/* Subject info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{activity.subject}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {duration > 0 ? formatDuration(duration) : "Tự học"}
                        </span>
                        {isInProgress && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-medium">
                            ⏳ Đang học
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center gap-1 text-sky-500 group-hover:text-sky-600">
                      <PlayCircle className="w-6 h-6" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Đã hoàn thành */}
        {completed.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
              Đã hoàn thành — {completed.length} bài ✅
            </p>
            <div className="space-y-2">
              {completed.map((activity) => {
                const emoji = subjectEmojis[activity.subject] || subjectEmojis["default"]
                const duration = getDurationMinutes(activity.startTime, activity.endTime)

                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-green-50 border border-green-200 opacity-80"
                  >
                    <div className="w-10 h-10 bg-green-400 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-600 text-sm line-through">{activity.subject}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{formatDuration(duration)}</span>
                      </div>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {scheduleActivities.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-3">📅</div>
            <p className="font-medium">Hôm nay không có lịch học</p>
            <p className="text-sm mt-1">Nghỉ ngơi hoặc tự học nhé! 😊</p>
          </div>
        )}
      </div>
    </div>
  )
}
