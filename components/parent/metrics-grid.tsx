"use client"

import type { Child, DailyReport, FocusSession } from "@/lib/types"
import { Clock, Heart, Activity, Bell } from "lucide-react"
import { useInterventionCount } from "@/hooks/use-intervention-count"

interface MetricsGridProps {
  child: Child
  todayReport: DailyReport | null
  currentSession: FocusSession | null
  parentId?: string
}

export function MetricsGrid({ child, todayReport, currentSession, parentId }: MetricsGridProps) {
  const focusTimeToday = todayReport?.totalFocusTime || 0
  const averageHeartRate = todayReport?.averageHeartRate || 0
  const fidgetLevel = todayReport?.averageFidgetLevel || 0
  const focusGoal = child.settings.focusGoalMinutes

  // Use real intervention count from API
  const { todayActions: interventionsToday, isLoading: interventionLoading } = useInterventionCount(parentId)

  const getFidgetLevelText = (level: number) => {
    if (level < 30) return "Thấp"
    if (level < 60) return "Trung bình"
    return "Cao"
  }

  const getFidgetColor = (level: number) => {
    if (level < 30) return "text-green-600"
    if (level < 60) return "text-yellow-600"
    return "text-red-600"
  }

  const metrics = [
    {
      title: "Thời gian tập trung hôm nay",
      value: `${focusTimeToday}p / ${focusGoal}p`,
      progress: Math.min((focusTimeToday / focusGoal) * 100, 100),
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: `Còn ${Math.max(0, focusGoal - focusTimeToday)} phút để đạt mục tiêu`,
    },
    {
      title: "Nhịp tim trung bình",
      value: `${averageHeartRate} BPM`,
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: averageHeartRate > 90 ? "Hơi cao" : averageHeartRate > 70 ? "Bình thường" : "Thấp",
    },
    {
      title: "Mức độ bồn chồn",
      value: getFidgetLevelText(fidgetLevel),
      icon: Activity,
      color: getFidgetColor(fidgetLevel),
      bgColor: fidgetLevel < 30 ? "bg-green-100" : fidgetLevel < 60 ? "bg-yellow-100" : "bg-red-100",
      description: `${fidgetLevel}% - ${fidgetLevel < 30 ? "Rất tốt!" : fidgetLevel < 60 ? "Ổn định" : "Cần chú ý"}`,
    },
    {
      title: "Lần can thiệp hôm nay",
      value: interventionLoading ? "..." : interventionsToday.toString(),
      icon: Bell,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: interventionLoading 
        ? "Đang tải..." 
        : interventionsToday > 5 
          ? "Nhiều hơn bình thường" 
          : "Trong mức bình thường",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl ${metric.bgColor} flex items-center justify-center`}>
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
            </div>
            {metric.progress !== undefined && (
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">{Math.round(metric.progress)}%</div>
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${metric.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <h3 className="text-sm font-medium text-gray-600 mb-2">{metric.title}</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
          <p className="text-xs text-gray-500">{metric.description}</p>
        </div>
      ))}
    </div>
  )
}
