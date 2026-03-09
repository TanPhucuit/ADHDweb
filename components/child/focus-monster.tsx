"use client"

import type { Child, FocusSession, ScheduleItem } from "@/lib/types"
import { Clock, Zap, Coffee, CheckCircle2, Lock, Loader2, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useRealTimeData, useRealTimeNotifications } from "@/hooks/use-real-time-data"
import { getActiveSession, setActiveSession } from "@/lib/study-session-store"

interface FocusMonsterProps {
  child: Child
  currentSession: FocusSession | null
  currentActivity?: ScheduleItem | null
  onBreakRequest: () => void
  onActivityComplete?: () => void
  breakPending?: boolean
  breakDenied?: boolean
  onCancelBreakRequest?: () => void
}

export function FocusMonster({ child, currentSession, currentActivity, onBreakRequest, onActivityComplete, breakPending, breakDenied, onCancelBreakRequest }: FocusMonsterProps) {
  const { data: realTimeData } = useRealTimeData(child.id)
  const notifications = useRealTimeNotifications(child.id)
  const [sessionTime, setSessionTime] = useState(0)
  const [showNotification, setShowNotification] = useState<any>(null)

  const focusScore = realTimeData?.focusScore || currentSession?.focusScore || 0
  const emoji = realTimeData?.emoji || "📚"
  const status = currentActivity ? `Đang học ${currentActivity.subject}` : "Sẵn sàng học"

  // Planned duration in seconds (from session, fallback 25 min)
  const plannedSeconds = (currentSession?.plannedDuration ?? 25) * 60
  // Must study at least 2/3 of planned time before completing
  const minRequiredSeconds = Math.ceil(plannedSeconds * 2 / 3)

  useEffect(() => {
    if (currentSession && currentSession.startTime) {
      // Set immediately so UI shows correct time on restore
      setSessionTime(Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000))
      const interval = setInterval(() => {
        setSessionTime(Math.floor((Date.now() - currentSession.startTime!.getTime()) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setSessionTime(0)
    }
  }, [currentSession])

  // Save accumulated study seconds when tab is hidden so the timer can't be
  // gamed by closing and reopening the browser
  useEffect(() => {
    if (!currentSession) return
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const elapsed = Math.floor((Date.now() - currentSession.startTime!.getTime()) / 1000)
        const stored = getActiveSession()
        if (stored) {
          setActiveSession({ ...stored, accumulatedSeconds: elapsed })
        }
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [currentSession])

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0]
      if (latestNotification.type === "intervention") {
        setShowNotification(latestNotification.intervention)
        setTimeout(() => setShowNotification(null), 5000)
      }
    }
  }, [notifications])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const canComplete = sessionTime >= minRequiredSeconds
  const progressPct = Math.min(100, Math.round((sessionTime / minRequiredSeconds) * 100))
  const remainingToComplete = Math.max(0, minRequiredSeconds - sessionTime)

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
      <div className="text-center mb-4">
        <div className="text-7xl mb-3 animate-bounce">{emoji}</div>
        <div className="bg-white/70 rounded-2xl px-4 py-2">
          <p className="text-base font-medium text-gray-800">{status}</p>
        </div>
      </div>

      {currentActivity && currentSession ? (
        <>
          {/* Time + focus score */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-100 rounded-2xl p-3 text-center">
              <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-blue-600 font-medium">Thời gian</p>
              <p className="text-lg font-bold text-blue-800">{formatTime(sessionTime)}</p>
            </div>
            <div className="bg-green-100 rounded-2xl p-3 text-center">
              <Zap className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-green-600 font-medium">Tập trung</p>
              <p className="text-lg font-bold text-green-800">{focusScore}%</p>
            </div>
          </div>

          {/* Subject info */}
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 mb-4 text-center">
            <p className="text-xs text-purple-500 font-medium mb-0.5">Đang học</p>
            <p className="text-base font-bold text-purple-800">{currentActivity.subject}</p>
            {currentActivity.notes && (
              <p className="text-xs text-purple-600 mt-1">{currentActivity.notes}</p>
            )}
            <p className="text-xs text-purple-400 mt-1">Thời lượng: {currentSession.plannedDuration} phút</p>
          </div>

          {/* 2/3 time progress */}
          <div className="mb-4 bg-gray-50 rounded-2xl p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-600">Tiến độ hoàn thành</span>
              <span className={`text-xs font-bold ${canComplete ? "text-green-600" : "text-orange-500"}`}>
                {canComplete ? "Đủ điều kiện! ✅" : `Còn ${formatTime(remainingToComplete)}`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${canComplete ? "bg-green-500" : "bg-orange-400"}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-center">
              Cần học ít nhất {formatTime(minRequiredSeconds)} để hoàn thành
            </p>
          </div>

          {/* Break denied flash */}
          {breakDenied && (
            <div className="mb-3 bg-red-100 border border-red-300 rounded-2xl px-4 py-3 text-center">
              <p className="text-red-700 font-bold text-sm">Ba mẹ chưa cho nghỉ — cố lên nhé! 💪</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            {breakPending ? (
              /* Waiting for parent approval */
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-amber-700">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-bold text-sm">Đang chờ ba mẹ xác nhận...</span>
                </div>
                <p className="text-xs text-amber-600">Ba mẹ sẽ duyệt yêu cầu nghỉ giải lao của bạn</p>
                <button
                  onClick={onCancelBreakRequest}
                  className="flex items-center gap-1.5 mx-auto text-xs text-amber-500 hover:text-amber-700 underline"
                >
                  <X className="w-3 h-3" />
                  Hủy yêu cầu
                </button>
              </div>
            ) : (
              <>
                {onActivityComplete && (
                  <button
                    onClick={canComplete ? onActivityComplete : undefined}
                    disabled={!canComplete}
                    className={`w-full font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 ${
                      canComplete
                        ? "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {canComplete ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Hoàn thành</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Hoàn thành (còn {formatTime(remainingToComplete)})</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={onBreakRequest}
                  className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  <Coffee className="w-5 h-5" />
                  <span>Xin nghỉ giải lao</span>
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500">Chọn môn học để bắt đầu nhé!</p>
        </div>
      )}
    </div>
  )
}
