"use client"

import type { Child, FocusSession } from "@/lib/types"
import { Activity, Clock, Target, Wifi, WifiOff } from "lucide-react"
import { useRealTimeData } from "@/hooks/use-real-time-data"
import { realTimeService } from "@/lib/real-time-service"

interface RealTimeStatusProps {
  child: Child
  currentSession: FocusSession | null
}

export function RealTimeStatus({ child, currentSession }: RealTimeStatusProps) {
  const { data: realTimeData, isConnected } = useRealTimeData(child.id)

  const focusScore = realTimeData?.focusScore || currentSession?.focusScore || 0
  const heartRate = realTimeData?.heartRate || currentSession?.heartRate || 0
  const fidgetLevel = realTimeData?.fidgetLevel || currentSession?.fidgetLevel || 0
  const currentActivity = realTimeData?.activity || currentSession?.activity || "Không hoạt động"
  const status = realTimeData?.status || "Không có dữ liệu"
  const emoji = realTimeData?.emoji || "😐"

  const getStatusColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-blue-600"
    if (score >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const handleSendReminder = () => {
    realTimeService.sendIntervention(child.id, "Hãy tập trung vào bài học nhé! 📚", "reminder")
  }

  const handleSendPraise = () => {
    realTimeService.sendIntervention(child.id, "Con làm rất tốt! Tiếp tục nhé! 🌟", "praise")
  }

  const handleSuggestBreak = () => {
    realTimeService.sendIntervention(child.id, "Con có muốn nghỉ giải lao không? ☕", "break")
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      {/* Connection Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Đang kết nối</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600 font-medium">Mất kết nối</span>
            </>
          )}
        </div>
        {realTimeData && (
          <span className="text-xs text-gray-500">Cập nhật: {realTimeData.timestamp.toLocaleTimeString()}</span>
        )}
      </div>

      <div className="text-center mb-6">
        <div className="text-6xl mb-3">{emoji}</div>
        <h2 className={`text-2xl font-bold mb-2 ${getStatusColor(focusScore)}`}>{status}</h2>
        <p className="text-gray-600">
          {child.name} đang {currentActivity.toLowerCase()}
        </p>
      </div>

      {/* Focus Score Dial */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={
              focusScore >= 80 ? "#10b981" : focusScore >= 60 ? "#3b82f6" : focusScore >= 40 ? "#f59e0b" : "#ef4444"
            }
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(focusScore / 100) * 314} 314`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{focusScore}%</span>
        </div>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mx-auto mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-500">Thời gian</p>
          <p className="font-semibold text-gray-900">
            {currentSession ? `${Math.floor((Date.now() - currentSession.startTime.getTime()) / 60000)}p` : "0p"}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mx-auto mb-2">
            <Activity className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-500">Nhịp tim</p>
          <p className="font-semibold text-gray-900">{heartRate} BPM</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mx-auto mb-2">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-sm text-gray-500">Bồn chồn</p>
          <p className="font-semibold text-gray-900">{fidgetLevel}%</p>
        </div>
      </div>

      {/* Quick Intervention Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleSendReminder}
          className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
        >
          Nhắc nhở
        </button>
        <button
          onClick={handleSendPraise}
          className="bg-green-500 hover:bg-green-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
        >
          Khen ngợi
        </button>
        <button
          onClick={handleSuggestBreak}
          className="bg-orange-500 hover:bg-orange-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
        >
          Nghỉ giải lao
        </button>
      </div>
    </div>
  )
}
