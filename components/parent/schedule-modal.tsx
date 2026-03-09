"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Clock, Coffee, Target, BookOpen } from "lucide-react"

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  childId: string
  onSuccess?: () => void
}

interface Activity {
  subject: string
  duration: number  // phút
  notes: string
}

// Tính start_time và end_time dựa trên thứ tự, startHour và breakInterval
function calculateTimes(
  activities: Activity[],
  startHour: string,    // "HH:MM"
  breakInterval: number // phút nghỉ giữa các môn
): Array<{ subject: string; start_time: string; end_time: string; notes: string }> {
  const [h, m] = startHour.split(":").map(Number)
  let cursor = h * 60 + m // phút từ 0:00

  return activities
    .filter(a => a.subject && a.duration > 0)
    .map((activity, idx) => {
      const start = cursor
      const end = cursor + activity.duration
      cursor = end + (idx < activities.length - 1 ? breakInterval : 0)

      const fmt = (mins: number) => {
        const hh = Math.floor(mins / 60) % 24
        const mm = mins % 60
        return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
      }

      return {
        subject: activity.subject,
        start_time: fmt(start),
        end_time: fmt(end),
        notes: activity.notes
      }
    })
}

const SUBJECTS = [
  "Toán học", "Tiếng Việt", "Tiếng Anh",
  "Khoa học", "Lịch sử", "Địa lý",
  "Thể dục", "Âm nhạc", "Mỹ thuật"
]

const SUBJECT_EMOJIS: Record<string, string> = {
  "Toán học": "📘", "Tiếng Việt": "📝", "Tiếng Anh": "🌍",
  "Khoa học": "🔬", "Lịch sử": "🏛️", "Địa lý": "🗺️",
  "Thể dục": "⚽", "Âm nhạc": "🎵", "Mỹ thuật": "🎨"
}

const DURATION_PRESETS = [20, 30, 45, 60, 90]

export function ScheduleModal({ isOpen, onClose, childId, onSuccess }: ScheduleModalProps) {
  // Cài đặt chung
  const [startTime, setStartTime] = useState("07:00")
  const [breakDuration, setBreakDuration] = useState(10)    // phút nghỉ giữa các môn
  const [dailyTarget, setDailyTarget] = useState(0)          // 0 = tất cả

  // Danh sách môn học
  const [activities, setActivities] = useState<Activity[]>([
    { subject: "", duration: 45, notes: "" }
  ])
  const [loading, setLoading] = useState(false)

  const addActivity = () => {
    setActivities([...activities, { subject: "", duration: 45, notes: "" }])
  }

  const removeActivity = (index: number) => {
    if (activities.length > 1) {
      setActivities(activities.filter((_, i) => i !== index))
    }
  }

  const updateActivity = (index: number, field: keyof Activity, value: string | number) => {
    setActivities(activities.map((a, i) => i === index ? { ...a, [field]: value } : a))
  }

  // Preview tổng thời gian
  const validActivities = activities.filter(a => a.subject && a.duration > 0)
  const totalStudyMins = validActivities.reduce((sum, a) => sum + a.duration, 0)
  const totalBreakMins = Math.max(0, validActivities.length - 1) * breakDuration
  const totalMins = totalStudyMins + totalBreakMins
  const endTimePreview = (() => {
    const [h, m] = startTime.split(":").map(Number)
    const total = h * 60 + m + totalMins
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
  })()

  const handleSubmit = async () => {
    const computed = calculateTimes(validActivities, startTime, breakDuration)
    if (computed.length === 0) {
      alert("Vui lòng thêm ít nhất một môn học hợp lệ")
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/parent/create-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, activities: computed })
      })

      if (response.ok) {
        alert(`Đã tạo lịch học với ${computed.length} môn thành công!`)
        onClose()
        onSuccess?.()
        setActivities([{ subject: "", duration: 45, notes: "" }])
      } else {
        alert("Có lỗi xảy ra khi tạo lịch học")
      }
    } catch (error) {
      alert("Có lỗi: " + error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 text-white rounded-t-2xl px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold">📅 Tạo lịch học cho con</h2>
            <p className="text-blue-100 text-sm mt-0.5">Thiết lập thời lượng và lịch học phù hợp</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <span className="text-white text-lg leading-none">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* ── CÀI ĐẶT CHUNG ──────────────────────────── */}
          <div className="bg-blue-50 rounded-2xl p-4 space-y-4 border border-blue-100">
            <h3 className="font-bold text-blue-800 flex items-center gap-2">
              <Target className="w-4 h-4" /> Cài đặt chung
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Giờ bắt đầu */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Giờ bắt đầu học
                </Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="bg-white"
                />
              </div>

              {/* Mục tiêu số bài */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  🎯 Số bài cần hoàn thành
                </Label>
                <Select
                  value={String(dailyTarget)}
                  onValueChange={v => setDailyTarget(Number(v))}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Tất cả môn trong lịch</SelectItem>
                    {[1,2,3,4,5,6,7,8].map(n => (
                      <SelectItem key={n} value={String(n)}>{n} môn</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Nghỉ giải lao */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Coffee className="w-3.5 h-3.5" /> Nghỉ giải lao giữa các môn
                </span>
                <span className="text-blue-700 font-bold">{breakDuration} phút</span>
              </Label>
              <Slider
                value={[breakDuration]}
                onValueChange={v => setBreakDuration(v[0])}
                min={5} max={30} step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5 phút</span><span>30 phút</span>
              </div>
            </div>

            {/* Preview tổng thời gian */}
            {validActivities.length > 0 && (
              <div className="bg-white rounded-xl p-3 border border-blue-200 text-sm">
                <div className="flex items-center justify-between text-gray-700">
                  <span>⏱ Tổng học: <b>{totalStudyMins} phút</b></span>
                  <span>☕ Nghỉ: <b>{totalBreakMins} phút</b></span>
                  <span>🕐 Kết thúc: <b>{endTimePreview}</b></span>
                </div>
              </div>
            )}
          </div>

          {/* ── DANH SÁCH MÔN HỌC ──────────────────────── */}
          <div>
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4" /> Môn học ({validActivities.length} môn)
            </h3>

            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-2xl p-4 bg-gray-50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-600">
                      {SUBJECT_EMOJIS[activity.subject] || "📖"} Môn {index + 1}
                    </span>
                    {activities.length > 1 && (
                      <button
                        onClick={() => removeActivity(index)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Môn học + Thời lượng */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1 block">Môn học</Label>
                      <Select
                        value={activity.subject}
                        onValueChange={v => updateActivity(index, "subject", v)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Chọn môn học" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECTS.map(s => (
                            <SelectItem key={s} value={s}>
                              {SUBJECT_EMOJIS[s]} {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1 block">
                        Thời lượng học: <b className="text-blue-600">{activity.duration} phút</b>
                      </Label>
                      <div className="flex gap-1.5 flex-wrap">
                        {DURATION_PRESETS.map(d => (
                          <button
                            key={d}
                            onClick={() => updateActivity(index, "duration", d)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              activity.duration === d
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-gray-300 text-gray-600 hover:border-blue-400"
                            }`}
                          >
                            {d}p
                          </button>
                        ))}
                        <Input
                          type="number"
                          min={5} max={180}
                          value={activity.duration}
                          onChange={e => updateActivity(index, "duration", Number(e.target.value))}
                          className="w-16 h-7 text-xs px-2 bg-white"
                          placeholder="phút"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ghi chú */}
                  <div>
                    <Label className="text-xs font-medium text-gray-600 mb-1 block">Ghi chú (tùy chọn)</Label>
                    <Input
                      value={activity.notes}
                      onChange={e => updateActivity(index, "notes", e.target.value)}
                      placeholder="VD: Làm bài tập trang 12..."
                      className="bg-white text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addActivity}
              className="mt-3 w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 font-semibold"
            >
              <Plus className="w-4 h-4" /> Thêm môn học
            </button>
          </div>

          {/* ── ACTIONS ─────────────────────────────────── */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || validActivities.length === 0}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-bold flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>📅 Tạo lịch học ({validActivities.length} môn)</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
