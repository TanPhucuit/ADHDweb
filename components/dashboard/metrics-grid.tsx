"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Heart, Activity, Bell } from "lucide-react"

export function MetricsGrid() {
  const metrics = [
    {
      title: "Thời gian tập trung hôm nay",
      value: "6.8h",
      icon: Clock,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Nhịp tim hiện tại",
      value: "78 BPM",
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Mức độ vận động",
      value: "Thấp",
      icon: Activity,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Lần nhắc nhở",
      value: "12",
      icon: Bell,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
              {metric.title}
            </CardTitle>
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${metric.bgColor} flex items-center justify-center flex-shrink-0`}
            >
              <metric.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold font-heading">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
