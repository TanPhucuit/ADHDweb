import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer"
import { GoBackButton } from "@/components/ui/go-back-button"

export default function ChildPomodoroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-4">
      <div className="container mx-auto">
        <div className="mb-4">
          <GoBackButton className="text-white hover:bg-white/20" />
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">⏰ Timer Học Tập</h1>
          <p className="text-white/80">Học tập hiệu quả với kỹ thuật Pomodoro!</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          <PomodoroTimer childId="child-1" isChildView={true} />
        </div>
      </div>
    </div>
  )
}
