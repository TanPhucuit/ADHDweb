"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RotateCcw, Timer, Music } from "lucide-react"
import { FocusSoundPlayer } from "@/components/focus/focus-sound-player"
import { dataStore } from "@/lib/data-store"

interface ParentPomodoroTimerProps {
  childId: string
  onSessionComplete?: (duration: number, focusScore: number) => void
}

export function ParentPomodoroTimer({ childId, onSessionComplete }: ParentPomodoroTimerProps) {
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            Pomodoro Timer
            <Badge variant={currentPhase === "focus" ? "default" : "secondary"}>
              {currentPhase === "focus" ? "Tập trung" : "Nghỉ ngơi"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-6xl font-bold text-primary mb-4">{formatTime(timeLeft)}</div>
            <Progress value={getProgress()} className="h-3 mb-4" />
            <p className="text-muted-foreground">
              {currentPhase === "focus" ? `Đang ${currentActivity.toLowerCase()}` : "Thời gian nghỉ ngơi"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button onClick={isActive ? handlePause : handleStart} size="lg" className="rounded-full">
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" className="rounded-full bg-transparent">
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          {/* Settings */}
          {!isActive && currentPhase === "focus" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Thời gian tập trung:</label>
                  <Select value={selectedDuration} onValueChange={handleDurationChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map((duration) => (
                        <SelectItem key={duration.value} value={duration.value}>
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Hoạt động:</label>
                  <Select value={currentActivity} onValueChange={setCurrentActivity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activities.map((activity) => (
                        <SelectItem key={activity} value={activity}>
                          {activity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{sessionsCompleted}</div>
              <p className="text-sm text-muted-foreground">Phiên hoàn thành</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {sessionsCompleted * Number.parseInt(selectedDuration)}
              </div>
              <p className="text-sm text-muted-foreground">Phút tập trung</p>
            </div>
          </div>

          {/* Sound Player Toggle */}
          <div className="pt-4 border-t">
            <Button onClick={() => setShowSoundPlayer(!showSoundPlayer)} variant="outline" className="w-full">
              <Music className="w-4 h-4 mr-2" />
              {showSoundPlayer ? "Ẩn" : "Hiện"} âm thanh tập trung
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sound Player */}
      {showSoundPlayer && <FocusSoundPlayer autoStartWithPomodoro={isActive && currentPhase === "focus"} />}
    </div>
  )
}
