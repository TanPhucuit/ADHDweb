"use client"

import type { Child, FocusSession, ScheduleItem } from "@/lib/types"
import { Clock, Zap, Coffee, Heart } from "lucide-react"
import { useState, useEffect } from "react"
import { useRealTimeData, useRealTimeNotifications } from "@/hooks/use-real-time-data"

interface FocusMonsterProps {
  child: Child
  currentSession: FocusSession | null
  currentActivity?: ScheduleItem | null
  onBreakRequest: () => void
  onActivityComplete?: () => void
}

export function FocusMonster({ child, currentSession, currentActivity, onBreakRequest, onActivityComplete }: FocusMonsterProps) {
  const { data: realTimeData } = useRealTimeData(child.id)
  const notifications = useRealTimeNotifications(child.id)
  const [sessionTime, setSessionTime] = useState(0)
  const [showNotification, setShowNotification] = useState<any>(null)

  const focusScore = realTimeData?.focusScore || currentSession?.focusScore || 0
  const heartRate = realTimeData?.heartRate || 89
  const emoji = realTimeData?.emoji || ""
  const status = currentActivity ? `Đang học ${currentActivity.subject}` : "Sẵn sàng học"

  useEffect(() => {
    if (currentSession && currentSession.startTime) {
      const interval = setInterval(() => {
        setSessionTime(Math.floor((Date.now() - currentSession.startTime!.getTime()) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setSessionTime(0)
    }
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

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
      <div className="text-center mb-6">
        <div className="text-8xl mb-4 animate-bounce">{emoji}</div>
        <div className="bg-white/70 rounded-2xl p-4 mb-4">
          <p className="text-lg font-medium text-gray-800">{status}</p>
        </div>
      </div>

      {currentActivity && currentSession ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-100 rounded-2xl p-4 text-center">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-600 font-medium">Thời gian</p>
              <p className="text-xl font-bold text-blue-800">{formatTime(sessionTime)}</p>
            </div>
            <div className="bg-green-100 rounded-2xl p-4 text-center">
              <Zap className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-600 font-medium">Điểm tập trung</p>
              <p className="text-xl font-bold text-green-800">{focusScore}%</p>
            </div>
          </div>
          <div className="bg-purple-100 rounded-2xl p-4 mb-6 text-center">
            <p className="text-sm text-purple-600 font-medium mb-1">Đang học</p>
            <p className="text-lg font-bold text-purple-800">{currentActivity.subject}</p>
            <div className="mt-2 text-sm text-purple-700">
              <p className="font-medium">{currentActivity.title}</p>
              <p className="text-xs mt-1">{currentActivity.description}</p>
              <div className="flex items-center justify-center mt-2 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                <span>{currentActivity.startTime} - {currentActivity.endTime}</span>
              </div>
            </div>
          </div>
          <div className="bg-red-100 rounded-2xl p-4 mb-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Heart className="w-5 h-5 text-red-600 animate-pulse" />
              <span className="text-lg font-bold text-red-800">{heartRate} BPM</span>
            </div>
          </div>
          <div className="space-y-3">
            {onActivityComplete && (
              <button
                onClick={onActivityComplete}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center space-x-2"
              >
                <span></span>
                <span>Hoàn thành</span>
              </button>
            )}
            <button
              onClick={onBreakRequest}
              className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center space-x-2"
            >
              <Coffee className="w-5 h-5" />
              <span>Xin nghỉ giải lao</span>
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 mb-4">Chọn môn học để bắt đầu nhé!</p>
        </div>
      )}
    </div>
  )
}
