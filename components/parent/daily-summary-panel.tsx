"use client"

import { useEffect, useState, useCallback } from "react"
import { BookOpen, Pill, Clock, RotateCcw, RefreshCw, TrendingUp } from "lucide-react"

interface Summary {
  date: string
  activities: { total: number; completed: number }
  studyMinutes: number
  medications: { total: number; taken: number }
}

interface DailySummaryPanelProps {
  childId: string
  childName?: string
  refreshKey?: number
}

export function DailySummaryPanel({ childId, childName, refreshKey }: DailySummaryPanelProps) {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [resettingSchedule, setResettingSchedule] = useState(false)
  const [resettingMeds, setResettingMeds] = useState(false)
  const [resetMsg, setResetMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/daily-summary?childId=${childId}`)
      if (res.ok) setSummary(await res.json())
    } catch {}
    finally { setLoading(false) }
  }, [childId])

  useEffect(() => { load() }, [load, refreshKey])

  const showMsg = (msg: string) => {
    setResetMsg(msg)
    setTimeout(() => setResetMsg(null), 3000)
  }

  const handleResetSchedule = async () => {
    setResettingSchedule(true)
    try {
      await fetch('/api/schedule/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId }),
      })
      await load()
      showMsg('Đã đặt lại lịch học cho ngày mới!')
    } catch {}
    finally { setResettingSchedule(false) }
  }

  const handleResetMeds = async () => {
    setResettingMeds(true)
    try {
      await fetch('/api/medication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, action: 'reset_all' }),
      })
      await load()
      showMsg('Đã đặt lại thuốc cho ngày mới!')
    } catch {}
    finally { setResettingMeds(false) }
  }

  const todayLabel = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <div>
            <p className="font-bold text-gray-800 text-sm">Tổng kết hôm nay</p>
            <p className="text-xs text-gray-500">{childName ? `${childName} — ` : ''}{todayLabel}</p>
          </div>
        </div>
        <button onClick={load} disabled={loading} className="p-1.5 rounded-lg hover:bg-white/60 text-gray-400 hover:text-gray-600 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-400 border-t-transparent" />
        </div>
      ) : !summary ? (
        <div className="py-6 text-center text-sm text-gray-400">Không tải được dữ liệu</div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Activities */}
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <BookOpen className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <div className="text-2xl font-black text-blue-600">
                {summary.activities.completed}<span className="text-sm font-semibold text-blue-400">/{summary.activities.total}</span>
              </div>
              <p className="text-xs text-blue-500 font-medium mt-0.5">Bài học</p>
              {summary.activities.total > 0 && (
                <div className="w-full bg-blue-100 rounded-full h-1.5 mt-1.5">
                  <div
                    className="h-1.5 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${Math.round((summary.activities.completed / summary.activities.total) * 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Study time */}
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <div className="text-2xl font-black text-green-600">{summary.studyMinutes}</div>
              <p className="text-xs text-green-500 font-medium mt-0.5">Phút học</p>
              <p className="text-xs text-green-400 mt-0.5">
                {summary.studyMinutes >= 60
                  ? `${Math.floor(summary.studyMinutes / 60)}g${summary.studyMinutes % 60}p`
                  : 'hôm nay'}
              </p>
            </div>

            {/* Medications */}
            <div className="bg-pink-50 rounded-xl p-3 text-center">
              <Pill className="w-5 h-5 text-pink-500 mx-auto mb-1" />
              <div className="text-2xl font-black text-pink-600">
                {summary.medications.taken}<span className="text-sm font-semibold text-pink-400">/{summary.medications.total}</span>
              </div>
              <p className="text-xs text-pink-500 font-medium mt-0.5">Thuốc</p>
              {summary.medications.total > 0 && (
                <div className="w-full bg-pink-100 rounded-full h-1.5 mt-1.5">
                  <div
                    className="h-1.5 rounded-full bg-pink-500 transition-all"
                    style={{ width: `${Math.round((summary.medications.taken / summary.medications.total) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Reset message */}
          {resetMsg && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-700 font-medium text-center">
              {resetMsg}
            </div>
          )}

          {/* Reset for new day */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-500 mb-2 font-medium">Bắt đầu ngày mới</p>
            <div className="flex gap-2">
              <button
                onClick={handleResetSchedule}
                disabled={resettingSchedule}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resettingSchedule ? 'animate-spin' : ''}`} />
                Reset lịch học
              </button>
              <button
                onClick={handleResetMeds}
                disabled={resettingMeds}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-colors disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resettingMeds ? 'animate-spin' : ''}`} />
                Reset thuốc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
