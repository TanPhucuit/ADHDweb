"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function RealTimeStatusCard() {
  const focusScore = 87
  const currentActivity = "Làm bài tập Toán"
  const status = "Đang tập trung tốt"

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 shadow-lg">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-heading">Trạng thái hiện tại</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Emoji and Text */}
        <div className="text-center space-y-2">
          <div className="text-6xl">😊</div>
          <h3 className="text-lg font-semibold text-primary">{status}</h3>
          <p className="text-muted-foreground">Hoạt động: {currentActivity}</p>
        </div>

        {/* Focus Score Gauge */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold font-heading text-primary">{focusScore}%</div>
            <p className="text-sm text-muted-foreground">Điểm tập trung</p>
          </div>

          <div className="relative">
            <Progress value={focusScore} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="w-3 h-3 bg-primary rounded-full mx-auto" />
            <p className="text-xs text-muted-foreground">Tập trung</p>
          </div>
          <div className="space-y-1">
            <div className="w-3 h-3 bg-muted rounded-full mx-auto" />
            <p className="text-xs text-muted-foreground">Bình thường</p>
          </div>
          <div className="space-y-1">
            <div className="w-3 h-3 bg-muted rounded-full mx-auto" />
            <p className="text-xs text-muted-foreground">Mất tập trung</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
