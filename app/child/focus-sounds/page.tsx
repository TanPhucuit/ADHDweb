"use client"

import { useEffect, useState } from "react"
import type { Child, User } from "@/lib/types"
import { ChildHeader } from "@/components/child/child-header"
import { FocusSoundPlayer } from "@/components/focus/focus-sound-player"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { GoBackButton } from "@/components/ui/go-back-button"
import { getActiveSession, onSessionChange } from "@/lib/study-session-store"
import type { ActiveStudySession } from "@/lib/study-session-store"
import { BookOpen, Lightbulb } from "lucide-react"

// Map subject to suggested music category
const SUBJECT_MUSIC_HINT: Record<string, { label: string; tip: string }> = {
  "Toán học": { label: "Binaural / Lo-fi", tip: "Sóng não Beta giúp tập trung làm toán tốt hơn" },
  "Tiếng Việt": { label: "Thiên nhiên", tip: "Tiếng mưa nhẹ giúp đọc và viết tốt hơn" },
  "Tiếng Anh": { label: "Lo-fi Ambient", tip: "Lo-fi giúp ghi nhớ từ vựng hiệu quả" },
  "Khoa học": { label: "Tiếng ồn trắng", tip: "Tiếng ồn trắng giúp tập trung nghiên cứu" },
  "Lịch sử": { label: "Nhạc cổ điển", tip: "Classical Focus phù hợp khi học lịch sử" },
  "Địa lý": { label: "Thiên nhiên", tip: "Âm thanh thiên nhiên phù hợp khi học địa lý" },
  "Thể dục": { label: "Study Beats", tip: "Nhịp nhạc năng động cho buổi học thể dục" },
  "Âm nhạc": { label: "Lo-fi / Jazz", tip: "Nhạc nhẹ Jazz Study phù hợp khi học âm nhạc" },
  "Mỹ thuật": { label: "Ambient / Jazz", tip: "Nhạc ambient kích thích sáng tạo mỹ thuật" },
}

function getMusicHint(subject: string) {
  const key = Object.keys(SUBJECT_MUSIC_HINT).find((k) =>
    subject.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(subject.toLowerCase())
  )
  return key ? SUBJECT_MUSIC_HINT[key] : { label: "Lo-fi Study", tip: "Nhạc lo-fi giúp tập trung học bài hiệu quả" }
}

function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("adhd-dashboard-user")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        if (userData.id && userData.role && userData.email) setUser(userData)
      } catch (e) {
        console.error("Error parsing user:", e)
      }
    }
    setLoading(false)
  }, [])

  return { user, loading }
}

export default function ChildFocusSoundsPage() {
  const { user, loading } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [activeSession, setActiveSession] = useState<ActiveStudySession | null>(null)

  useEffect(() => {
    setActiveSession(getActiveSession())
    return onSessionChange((s) => setActiveSession(s))
  }, [])

  useEffect(() => {
    if (user && user.role === "child") {
      setChild({
        id: user.id,
        name: user.name,
        parentId: (user as any).parentId || "",
        age: (user as any).age || 0,
      } as Child)
    }
  }, [user])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-sky-400"><LoadingSpinner /></div>
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

  if (!child) {
    return <div className="min-h-screen flex items-center justify-center bg-sky-400"><LoadingSpinner /></div>
  }

  const musicHint = activeSession ? getMusicHint(activeSession.subject) : null

  return (
    <div className="min-h-screen bg-sky-400">
      <ChildHeader child={child} />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <GoBackButton className="text-white hover:bg-white/20" />
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white mb-1">Âm thanh tập trung</h1>
          <p className="text-white/80 text-sm">Chọn âm thanh để học bài tốt hơn</p>
        </div>

        {/* Active session + music suggestion banner */}
        {activeSession && (
          <div className="mb-4 bg-white/20 backdrop-blur-sm rounded-2xl p-4 space-y-2 border border-white/30">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span>Đang học: <b>{activeSession.subject}</b></span>
            </div>
            {musicHint && (
              <div className="flex items-start gap-2 text-white/90 text-sm">
                <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-300 flex-shrink-0" />
                <span>
                  <b className="text-yellow-300">Gợi ý nhạc:</b> {musicHint.tip} — thử <b>{musicHint.label}</b>!
                </span>
              </div>
            )}
          </div>
        )}

        <FocusSoundPlayer />
      </main>
    </div>
  )
}
