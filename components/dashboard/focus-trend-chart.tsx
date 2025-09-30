"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"

const chartData = [
  { time: "14:00", score: 65 },
  { time: "14:15", score: 72 },
  { time: "14:30", score: 68 },
  { time: "14:45", score: 85 },
  { time: "15:00", score: 87 },
  { time: "15:15", score: 82 },
  { time: "15:30", score: 90 },
  { time: "15:45", score: 87 },
]

const chartConfig = {
  score: {
    label: "Điểm tập trung",
    color: "hsl(var(--primary))",
  },
}

export function FocusTrendChart() {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="font-heading">Xu hướng tập trung</CardTitle>
        <CardDescription>Điểm tập trung trong 1 giờ qua</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="time" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--color-primary)"
                strokeWidth={3}
                dot={{ fill: "var(--color-primary)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "var(--color-primary)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
