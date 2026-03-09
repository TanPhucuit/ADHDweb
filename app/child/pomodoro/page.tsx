"use client"

import { useEffect, useState, useRef } from "react"
import { GoBackButton } from "@/components/ui/go-back-button"
import { getActiveSession, onSessionChange, onToolAction } from "@/lib/study-session-store"
import type { ActiveStudySession, ToolAction } from "@/lib/study-session-store"
import { Play, Pause, RotateCcw, Coffee, BookOpen } from "lucide-react"

type Phase = "focus" | "break"

function formatTime(seconds: number) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0")
  const s = String(seconds % 60).padStart(2, "0")
  return `${m}:${s}`
}

export default function ChildPomodoroPage() {
  const [activeSession, setActiveSession] = useState<ActiveStudySession | null>(null)

  const [phase, setPhase] = useState<Phase>("focus")
  const [focusMins, setFocusMins] = useState(25)
  const [breakMins] = useState(5)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const session = getActiveSession()
    if (session) {
      setActiveSession(session)
      setFocusMins(session.durationMinutes)
      setSecondsLeft(session.durationMinutes * 60)
    }
    const unsub = onSessionChange((s) => {
      setActiveSession(s)
      if (s) {
        setFocusMins(s.durationMinutes)
        setPhase("focus")
        setSecondsLeft(s.durationMinutes * 60)
        setRunning(false)
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    return onToolAction((action: ToolAction) => {
      if (action.type === "set_timer") {
        setFocusMins(action.minutes)
        setPhase("focus")
        setSecondsLeft(action.minutes * 60)
        setRunning(true)
      } else if (action.type === "stop_timer") {
        setRunning(false)
      }
    })
  }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            if (phase === "focus") {
              setSessionsCompleted((c) => c + 1)
              setPhase("break")
              setSecondsLeft(breakMins * 60)
              try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.connect(gain); gain.connect(ctx.destination)
                osc.frequency.value = 800
                gain.gain.setValueAtTime(0.3, ctx.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1)
                osc.start(); osc.stop(ctx.currentTime + 1)
              } catch {}
            } else {
              setPhase("focus")
              setSecondsLeft(focusMins * 60)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, phase, focusMins, breakMins])

  const totalSeconds = phase === "focus" ? focusMins * 60 : breakMins * 60
  const pct = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100)
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - pct / 100)

  const isFocus = phase === "focus"
  const phaseColor = isFocus ? "text-sky-600" : "text-green-600"
  const phaseStroke = isFocus ? "#0ea5e9" : "#22c55e"
  const phaseTrack = isFocus ? "#e0f2fe" : "#dcfce7"
  const phaseBg = isFocus ? "bg-sky-50" : "bg-green-50"
  const phaseBorder = isFocus ? "border-sky-200" : "border-green-200"

  const reset = () => {
    setRunning(false)
    setPhase("focus")
    setSecondsLeft(focusMins * 60)
  }

  const PRESETS = [15, 20, 25, 30, 45, 60]

  return (
    <div className="min-h-screen bg-sky-400 p-4">
      <div className="container mx-auto max-w-md">
        <div className="mb-4">
          <GoBackButton className="text-white hover:bg-white/20" />
        </div>

        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-white">Timer Học Tập</h1>
          {activeSession && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 text-white text-sm px-3 py-1.5 rounded-full">
              <BookOpen className="w-4 h-4" />
              Đang học: <b>{activeSession.subject}</b>
            </div>
          )}
        </div>

        <div className="bg-white/95 rounded-3xl shadow-xl p-6 space-y-6">
          {/* Phase label */}
          <div className={`${phaseBg} ${phaseBorder} border rounded-2xl p-3 text-center`}>
            <span className={`font-bold text-sm ${phaseColor}`}>
              {isFocus ? "Tập trung học bài" : "Nghỉ giải lao"}
            </span>
            {!isFocus && (
              <div className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
                <Coffee className="w-3 h-3" /> Nghỉ ngơi sau {sessionsCompleted} phiên học
              </div>
            )}
          </div>

          {/* Circular timer */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
                <circle cx="100" cy="100" r={radius} fill="none" stroke={phaseTrack} strokeWidth="10" />
                <circle
                  cx="100" cy="100" r={radius} fill="none"
                  stroke={phaseStroke} strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-mono font-bold ${phaseColor}`}>
                  {formatTime(secondsLeft)}
                </span>
                <span className="text-sm text-gray-400 mt-1">{pct}% xong</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={reset}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setRunning((r) => !r)}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-colors ${
                isFocus ? "bg-sky-500 hover:bg-sky-600" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {running ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </button>

            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
              {sessionsCompleted}x
            </div>
          </div>

          {/* Duration presets (only when stopped and in focus phase) */}
          {!running && isFocus && (
            <div>
              <p className="text-xs text-gray-500 text-center mb-2">Chọn thời lượng học</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {PRESETS.map((m) => (
                  <button
                    key={m}
                    onClick={() => { setFocusMins(m); setSecondsLeft(m * 60) }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      focusMins === m ? "bg-sky-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {m}p
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Session dots */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${i < (sessionsCompleted % 4) ? "bg-sky-500" : "bg-gray-200"}`}
              />
            ))}
          </div>
          <p className="text-center text-xs text-gray-400">{sessionsCompleted} phiên học hôm nay</p>
        </div>
      </div>
    </div>
  )
}
