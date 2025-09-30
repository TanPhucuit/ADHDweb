"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { DailyReport } from "@/lib/types"

interface TimeDistributionChartProps {
  reports: DailyReport[]
}

const chartConfig = {
  focused: {
    label: "Tập trung",
    color: "hsl(var(--primary))",
  },
  distracted: {
    label: "Mất tập trung",
    color: "hsl(var(--destructive))",
  },
  break: {
    label: "Nghỉ ngơi",
    color: "hsl(var(--muted-foreground))",
  },
}

export function TimeDistributionChart({ reports }: TimeDistributionChartProps) {
  const calculateTimeDistribution = () => {
    if (!reports || reports.length === 0) {
      return [
        { name: "Tập trung", value: 0, color: "hsl(var(--primary))" },
        { name: "Mất tập trung", value: 0, color: "hsl(var(--destructive))" },
        { name: "Nghỉ ngơi", value: 0, color: "hsl(var(--muted-foreground))" },
      ]
    }

    // Calculate time distribution from focus time and scores
    const totalFocusTime = reports.reduce((sum, report) => sum + (report.totalFocusTime || 0), 0)
    const avgFocusScore = reports.reduce((sum, report) => sum + (report.averageFocusScore || 0), 0) / reports.length
    
    // Estimate focused vs distracted time based on focus score
    const focusedMinutes = Math.round(totalFocusTime * (avgFocusScore / 100))
    const distractedMinutes = Math.round(totalFocusTime * ((100 - avgFocusScore) / 100))
    const breakMinutes = Math.round(totalFocusTime * 0.2) // Assume 20% break time
    
    const totalMinutes = focusedMinutes + distractedMinutes + breakMinutes

    if (totalMinutes === 0) {
      return [
        { name: "Tập trung", value: 0, color: "hsl(var(--primary))" },
        { name: "Mất tập trung", value: 0, color: "hsl(var(--destructive))" },
        { name: "Nghỉ ngơi", value: 0, color: "hsl(var(--muted-foreground))" },
      ]
    }

    return [
      {
        name: "Tập trung",
        value: Math.round((focusedMinutes / totalMinutes) * 100),
        color: "hsl(var(--primary))",
      },
      {
        name: "Mất tập trung",
        value: Math.round((distractedMinutes / totalMinutes) * 100),
        color: "hsl(var(--destructive))",
      },
      {
        name: "Nghỉ ngơi",
        value: Math.round((breakMinutes / totalMinutes) * 100),
        color: "hsl(var(--muted-foreground))",
      },
    ]
  }

  const chartData = calculateTimeDistribution()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">Phân bổ thời gian</CardTitle>
        <CardDescription>Tỷ lệ thời gian trong các trạng thái khác nhau</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-primary">{`${data.value}%`}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Custom Legend */}
        <div className="flex justify-center gap-6 mt-4">
          {chartData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}</span>
              <span className="font-medium">{entry.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
