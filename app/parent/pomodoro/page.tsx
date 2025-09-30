import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer"

export default function ParentPomodoroPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pomodoro Timer</h1>
        <p className="text-muted-foreground">Kỹ thuật tập trung hiệu quả cho trẻ ADHD</p>
      </div>
      <PomodoroTimer childId="child-1" />
    </div>
  )
}
