"use client"

import { useEffect, useState } from "react"
import { Coffee, Play } from "lucide-react"

interface BreakTimerProps {
  timeLeft: number
  onBreakEnd: () => void
}

export function BreakTimer({ timeLeft: initialTime, onBreakEnd }: BreakTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime)

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      onBreakEnd()
    }
  }, [timeLeft, onBreakEnd])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl text-center">
      <div className="text-6xl mb-4">☕</div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Giờ nghỉ!</h2>
      <p className="text-gray-600 mb-6">Hãy thư giãn và uống nước nhé</p>

      {/* Timer Display */}
      <div className="bg-orange-100 rounded-2xl p-6 mb-6">
        <Coffee className="w-8 h-8 text-orange-600 mx-auto mb-2" />
        <p className="text-sm text-orange-600 font-medium mb-2">Thời gian nghỉ còn lại</p>
        <p className="text-4xl font-bold text-orange-800">{formatTime(timeLeft)}</p>
      </div>

      {/* Break Activities */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-100 rounded-xl p-4">
          <div className="text-2xl mb-2">💧</div>
          <p className="text-sm font-medium text-blue-800">Uống nước</p>
        </div>
        <div className="bg-green-100 rounded-xl p-4">
          <div className="text-2xl mb-2">🤸</div>
          <p className="text-sm font-medium text-green-800">Vận động</p>
        </div>
        <div className="bg-purple-100 rounded-xl p-4">
          <div className="text-2xl mb-2">👀</div>
          <p className="text-sm font-medium text-purple-800">Nhìn xa</p>
        </div>
        <div className="bg-pink-100 rounded-xl p-4">
          <div className="text-2xl mb-2">🧘</div>
          <p className="text-sm font-medium text-pink-800">Thở sâu</p>
        </div>
      </div>

      <button
        onClick={onBreakEnd}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-2xl transition-colors flex items-center justify-center space-x-2 mx-auto"
      >
        <Play className="w-5 h-5" />
        <span>Sẵn sàng học tiếp!</span>
      </button>
    </div>
  )
}
