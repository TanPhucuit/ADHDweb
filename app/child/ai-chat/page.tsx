"use client"

import { useEffect, useState, useCallback } from "react"
import { StudyChat } from "@/components/study-chat"
import { GoBackButton } from "@/components/ui/go-back-button"
import type { User } from "@/lib/types"
import { getActiveSession, onSessionChange, onToolAction } from "@/lib/study-session-store"
import type { ActiveStudySession, ToolAction } from "@/lib/study-session-store"
import { Timer, Music, X, Play, Pause } from "lucide-react"

function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("adhd-dashboard-user")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        if (userData.id && userData.role && userData.email) {
          setUser(userData)
        }
      } catch (e) {
        console.error("Error parsing user:", e)
      }
    }
    setLoading(false)
  }, [])

  return { user, loading }
}

// Mini countdown timer widget controlled by AI
function MiniTimer({ initialMinutes, onClose }: { initialMinutes: number; onClose: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60)
  const [running, setRunning] = useState(true)
  const totalSeconds = initialMinutes * 60

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { clearInterval(id); setRunning(false); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0")
  const ss = String(secondsLeft % 60).padStart(2, "0")
  const pct = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100)
  const done = secondsLeft === 0

  return (
    <div className="bg-white/95 rounded-2xl shadow-lg border border-sky-200 p-3 flex items-center gap-3">
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#e0f2fe" strokeWidth="4" />
          <circle cx="24" cy="24" r="20" fill="none" stroke={done ? "#22c55e" : "#0ea5e9"} strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
            strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center">
          <Timer className="w-4 h-4 text-sky-600" />
        </span>
      </div>
      <div className="flex-1">
        <div className={`text-xl font-mono font-bold ${done ? "text-green-600" : "text-sky-700"}`}>
          {done ? "Xong!" : `${mm}:${ss}`}
        </div>
        <div className="text-xs text-gray-500">{done ? "Hết giờ học!" : `${initialMinutes} phút học tập`}</div>
      </div>
      <div className="flex items-center gap-1">
        {!done && (
          <button onClick={() => setRunning(r => !r)} className="p-1.5 rounded-lg hover:bg-sky-50 text-sky-600">
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        )}
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function MiniMusicWidget({ category, onClose }: { category: string; onClose: () => void }) {
  const labels: Record<string, string> = {
    ambient: "Lo-fi Study", nature: "Thiên nhiên", "white-noise": "Tiếng ồn trắng", binaural: "Sóng não",
  }
  return (
    <div className="bg-white/95 rounded-2xl shadow-lg border border-purple-200 p-3 flex items-center gap-3">
      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <Music className="w-5 h-5 text-purple-600 animate-pulse" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-purple-700">{labels[category] || category}</div>
        <div className="text-xs text-gray-500">Mở trang Nhạc tập trung để nghe</div>
      </div>
      <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function ChildStudyChatPage() {
  const { user, loading } = useAuth()
  const [activeSession, setActiveSession] = useState<ActiveStudySession | null>(null)
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null)
  const [musicCategory, setMusicCategory] = useState<string | null>(null)

  useEffect(() => {
    setActiveSession(getActiveSession())
    return onSessionChange((s) => setActiveSession(s))
  }, [])

  useEffect(() => {
    return onToolAction((action: ToolAction) => {
      if (action.type === "set_timer") setTimerMinutes(action.minutes)
      else if (action.type === "play_music") setMusicCategory(action.category || "ambient")
      else if (action.type === "stop_music") setMusicCategory(null)
      else if (action.type === "stop_timer") setTimerMinutes(null)
    })
  }, [])

  const handleTimerSet = useCallback((minutes: number) => setTimerMinutes(minutes), [])
  const handleMusicPlay = useCallback((category: string) => setMusicCategory(category), [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user || user.role !== "child") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-400">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Chưa đăng nhập</h2>
          <p className="font-medium">Vui lòng đăng nhập với tài khoản con</p>
        </div>
      </div>
    )
  }

  const hasWidgets = timerMinutes !== null || musicCategory !== null

  return (
    <div className="min-h-screen bg-sky-400 p-1 sm:p-2">
      <div className="container mx-auto max-w-full flex flex-col" style={{ height: "100vh" }}>

        {/* Top bar */}
        <div className="mb-2 flex items-center justify-between flex-shrink-0">
          <GoBackButton className="text-white hover:bg-white/20" />
          {activeSession && (
            <div className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium">
              Đang học: <b>{activeSession.subject}</b>
            </div>
          )}
        </div>

        <div className="mb-2 text-center flex-shrink-0">
          <h1 className="text-xl font-bold text-white">Bạn học AI</h1>
          <p className="text-white/80 text-xs">Trợ lý học tập của {user.name}</p>
        </div>

        {/* Mini action widgets (timer / music) from AI */}
        {hasWidgets && (
          <div className="mb-2 grid grid-cols-1 sm:grid-cols-2 gap-2 flex-shrink-0">
            {timerMinutes !== null && (
              <MiniTimer key={`timer-${timerMinutes}`} initialMinutes={timerMinutes} onClose={() => setTimerMinutes(null)} />
            )}
            {musicCategory !== null && (
              <MiniMusicWidget category={musicCategory} onClose={() => setMusicCategory(null)} />
            )}
          </div>
        )}

        {/* Chat area - fills remaining space */}
        <div className="flex-1 bg-white/95 rounded-lg sm:rounded-2xl shadow-xl flex flex-col overflow-hidden min-h-0">
          <StudyChat
            childId={String(user.id)}
            childName={user.name}
            activeSession={activeSession}
            onTimerSet={handleTimerSet}
            onMusicPlay={handleMusicPlay}
          />
        </div>
      </div>
    </div>
  )
}
