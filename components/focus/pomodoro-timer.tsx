"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Coffee, Brain, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PomodoroSettings {
  workDuration: number // minutes
  shortBreakDuration: number // minutes
  longBreakDuration: number // minutes
  sessionsUntilLongBreak: number
}

type TimerState = "work" | "short-break" | "long-break" | "paused" | "stopped"

interface PomodoroTimerProps {
  onSessionComplete?: (type: "work" | "break", duration: number) => void
  onFocusAlert?: () => void
}

export function PomodoroTimer({ onSessionComplete, onFocusAlert }: PomodoroTimerProps) {
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  })

  const [state, setState] = useState<TimerState>("stopped")
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60) // in seconds
  const [completedSessions, setCompletedSessions] = useState(0)
  const [currentCycle, setCurrentCycle] = useState<"work" | "short-break" | "long-break">("work")

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  // Initialize audio for notifications
  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.volume = 0.5
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Timer countdown logic
  useEffect(() => {
    if (state === "work" || state === "short-break" || state === "long-break") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }

          // Alert when time is running out (last 5 minutes of work session)
          if (currentCycle === "work" && prev === 5 * 60) {
            onFocusAlert?.()
            toast({
              title: "Sắp hết giờ!",
              description: "Còn 5 phút nữa là hết thời gian tập trung",
            })
          }

          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state, currentCycle, onFocusAlert])

  const handleTimerComplete = () => {
    setState("stopped")

    // Play notification sound
    if (audioRef.current) {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = currentCycle === "work" ? 800 : 400
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 1)
    }

    if (currentCycle === "work") {
      const newCompletedSessions = completedSessions + 1
      setCompletedSessions(newCompletedSessions)
      onSessionComplete?.("work", settings.workDuration)

      // Determine next break type
      const isLongBreak = newCompletedSessions % settings.sessionsUntilLongBreak === 0
      const nextCycle = isLongBreak ? "long-break" : "short-break"
      const nextDuration = isLongBreak ? settings.longBreakDuration : settings.shortBreakDuration

      setCurrentCycle(nextCycle)
      setTimeLeft(nextDuration * 60)

      toast({
        title: "Hoàn thành phiên tập trung! 🎉",
        description: `Bạn đã tập trung được ${settings.workDuration} phút. ${isLongBreak ? "Giờ nghỉ dài!" : "Giờ nghỉ ngắn!"}`,
      })
    } else {
      onSessionComplete?.(
        "break",
        currentCycle === "long-break" ? settings.longBreakDuration : settings.shortBreakDuration,
      )
      setCurrentCycle("work")
      setTimeLeft(settings.workDuration * 60)

      toast({
        title: "Hết giờ nghỉ! 💪",
        description: "Sẵn sàng cho phiên tập trung tiếp theo!",
      })
    }
  }

  const startTimer = () => {
    setState(currentCycle)
  }

  const pauseTimer = () => {
    setState("paused")
  }

  const resetTimer = () => {
    setState("stopped")
    setCurrentCycle("work")
    setTimeLeft(settings.workDuration * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    const totalDuration =
      currentCycle === "work"
        ? settings.workDuration * 60
        : currentCycle === "long-break"
          ? settings.longBreakDuration * 60
          : settings.shortBreakDuration * 60

    return ((totalDuration - timeLeft) / totalDuration) * 100
  }

  const getCycleInfo = () => {
    switch (currentCycle) {
      case "work":
        return {
          title: "Thời gian tập trung",
          icon: <Brain className="w-5 h-5" />,
          color: "bg-blue-500",
          description: "Hãy tập trung hoàn toàn vào công việc",
        }
      case "short-break":
        return {
          title: "Nghỉ ngắn",
          icon: <Coffee className="w-5 h-5" />,
          color: "bg-green-500",
          description: "Thư giãn 5 phút và chuẩn bị tiếp tục",
        }
      case "long-break":
        return {
          title: "Nghỉ dài",
          icon: <Coffee className="w-5 h-5" />,
          color: "bg-orange-500",
          description: "Nghỉ ngơi kỹ lưỡng để nạp lại năng lượng",
        }
    }
  }

  const cycleInfo = getCycleInfo()
  const isRunning = state === "work" || state === "short-break" || state === "long-break"
  const isPaused = state === "paused"

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {cycleInfo.icon}
          Pomodoro Timer
        </CardTitle>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge className={cycleInfo.color}>{cycleInfo.title}</Badge>
          <Badge variant="outline">Phiên {completedSessions + 1}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center space-y-4">
          <div className="text-6xl font-mono font-bold text-primary">{formatTime(timeLeft)}</div>
          <p className="text-sm text-muted-foreground">{cycleInfo.description}</p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={getProgress()} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Tiến độ</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-3">
          {!isRunning && !isPaused && (
            <Button onClick={startTimer} size="lg" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Bắt đầu
            </Button>
          )}

          {isRunning && (
            <Button onClick={pauseTimer} variant="outline" size="lg" className="flex items-center gap-2 bg-transparent">
              <Pause className="w-4 h-4" />
              Tạm dừng
            </Button>
          )}

          {isPaused && (
            <Button onClick={startTimer} size="lg" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Tiếp tục
            </Button>
          )}

          <Button onClick={resetTimer} variant="outline" size="lg" className="flex items-center gap-2 bg-transparent">
            <RotateCcw className="w-4 h-4" />
            Đặt lại
          </Button>
        </div>

        {/* Session Counter */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Phiên đã hoàn thành hôm nay</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: settings.sessionsUntilLongBreak }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < (completedSessions % settings.sessionsUntilLongBreak) ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{completedSessions} phiên hoàn thành</p>
        </div>

        {/* Quick Settings */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Cài đặt nhanh
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <p className="font-medium">Tập trung</p>
              <p className="text-muted-foreground">{settings.workDuration}m</p>
            </div>
            <div className="text-center">
              <p className="font-medium">Nghỉ ngắn</p>
              <p className="text-muted-foreground">{settings.shortBreakDuration}m</p>
            </div>
            <div className="text-center">
              <p className="font-medium">Nghỉ dài</p>
              <p className="text-muted-foreground">{settings.longBreakDuration}m</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
