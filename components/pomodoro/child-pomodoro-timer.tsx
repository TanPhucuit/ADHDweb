"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FocusSoundPlayer } from "@/components/focus/focus-sound-player"
import { dataStore } from "@/lib/data-store"

interface ChildPomodoroTimerProps {
  childId: string
  onSessionComplete?: (duration: number, focusScore: number) => void
}

export function ChildPomodoroTimer({ childId, onSessionComplete }: ChildPomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<"focus" | "break">("focus")
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [selectedDuration, setSelectedDuration] = useState("25")
  const [showSoundPlayer, setShowSoundPlayer] = useState(false)
  const [currentActivity, setCurrentActivity] = useState("Học bài")

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  const durations = [
    { value: "15", label: "15 phút", seconds: 15 * 60 },
    { value: "25", label: "25 phút", seconds: 25 * 60 },
    { value: "30", label: "30 phút", seconds: 30 * 60 },
    { value: "45", label: "45 phút", seconds: 45 * 60 },
  ]

  const activities = [
    "Học bài",
    "Làm bài tập",
    "Đọc sách",
    "Ôn tập",
    "Thực hành",
    "Viết bài",
    "Học từ vựng",
    "Giải toán",
  ]

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            handlePhaseComplete()
            return 0
          }
          return time - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, timeLeft])

  const handlePhaseComplete = () => {
    setIsActive(false)

    if (currentPhase === "focus") {
      const duration = Number.parseInt(selectedDuration) * 60
      const focusScore = Math.floor(Math.random() * 30) + 70

      if (startTimeRef.current) {
        dataStore.startFocusSession(childId, currentActivity)
      }

      dataStore.awardPoints(childId, 5, "Hoàn thành phiên Pomodoro", "focus_improvement")
      setSessionsCompleted((prev) => prev + 1)
      onSessionComplete?.(duration, focusScore)

      setCurrentPhase("break")
      setTimeLeft(5 * 60)
      setIsActive(true)
    } else {
      setCurrentPhase("focus")
      const selectedDur = durations.find((d) => d.value === selectedDuration)
      setTimeLeft(selectedDur?.seconds || 25 * 60)
    }
  }

  const handleStart = () => {
    if (!isActive) {
      startTimeRef.current = new Date()
    }
    setIsActive(true)
  }

  const handlePause = () => {
    setIsActive(false)
  }

  const handleReset = () => {
    setIsActive(false)
    setCurrentPhase("focus")
    const selectedDur = durations.find((d) => d.value === selectedDuration)
    setTimeLeft(selectedDur?.seconds || 25 * 60)
    startTimeRef.current = null
  }

  const handleDurationChange = (value: string) => {
    if (!isActive) {
      setSelectedDuration(value)
      const selectedDur = durations.find((d) => d.value === value)
      setTimeLeft(selectedDur?.seconds || 25 * 60)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    const totalTime =
      currentPhase === "focus" ? durations.find((d) => d.value === selectedDuration)?.seconds || 25 * 60 : 5 * 60
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 space-y-8">
          {/* Child-friendly Timer Display */}
          <div className="text-center">
            <div
              className="text-8xl font-bold mb-4"
              style={{
                color: currentPhase === "focus" ? "#10b981" : "#f59e0b",
                textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {formatTime(timeLeft)}
            </div>
            <Progress
              value={getProgress()}
              className="h-4 mb-6"
              style={{
                background:
                  currentPhase === "focus"
                    ? "linear-gradient(90deg, #10b981, #34d399)"
                    : "linear-gradient(90deg, #f59e0b, #fbbf24)",
              }}
            />
            <div className="text-2xl font-semibold text-gray-700 mb-2">
              {currentPhase === "focus" ? "🎯 Đang tập trung" : "😌 Thời gian nghỉ"}
            </div>
            <p className="text-lg text-gray-600">
              {currentPhase === "focus" ? currentActivity : "Hãy thư giãn một chút nhé!"}
            </p>
          </div>

          {/* Large, colorful controls */}
          <div className="flex justify-center gap-6">
            <Button
              onClick={isActive ? handlePause : handleStart}
              size="lg"
              className="h-16 w-16 rounded-full text-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
            >
              {isActive ? "⏸️" : "▶️"}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="h-16 w-16 rounded-full text-2xl border-2 border-gray-300 hover:border-gray-400 shadow-lg bg-transparent"
            >
              🔄
            </Button>
          </div>

          {/* Simple settings for child */}
          {!isActive && currentPhase === "focus" && (
            <div className="space-y-4">
              <div className="text-center">
                <label className="text-lg font-medium mb-3 block">⏰ Chọn thời gian học:</label>
                <div className="grid grid-cols-2 gap-3">
                  {durations.map((duration) => (
                    <Button
                      key={duration.value}
                      onClick={() => handleDurationChange(duration.value)}
                      variant={selectedDuration === duration.value ? "default" : "outline"}
                      className="h-12 text-lg"
                    >
                      {duration.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <label className="text-lg font-medium mb-3 block">📚 Hôm nay học gì?</label>
                <Select value={currentActivity} onValueChange={setCurrentActivity}>
                  <SelectTrigger className="text-lg h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activities.map((activity) => (
                      <SelectItem key={activity} value={activity} className="text-lg">
                        {activity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Fun stats display */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t-2 border-gray-200">
            <div className="text-center bg-green-50 rounded-xl p-4">
              <div className="text-4xl font-bold text-green-600 mb-1">{sessionsCompleted}</div>
              <p className="text-sm font-medium text-green-700">🏆 Phiên hoàn thành</p>
            </div>
            <div className="text-center bg-blue-50 rounded-xl p-4">
              <div className="text-4xl font-bold text-blue-600 mb-1">
                {sessionsCompleted * Number.parseInt(selectedDuration)}
              </div>
              <p className="text-sm font-medium text-blue-700">⏱️ Phút tập trung</p>
            </div>
          </div>

          {/* Sound player toggle */}
          <div className="text-center">
            <Button
              onClick={() => setShowSoundPlayer(!showSoundPlayer)}
              variant="outline"
              className="h-12 text-lg px-8"
            >
              🎵 {showSoundPlayer ? "Tắt" : "Bật"} nhạc tập trung
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sound Player */}
      {showSoundPlayer && <FocusSoundPlayer autoStartWithPomodoro={isActive && currentPhase === "focus"} />}
    </div>
  )
}
