"use client"

import type { FocusSession, DailyReport } from "@/lib/types"
import { ChartTooltip } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Dot } from "recharts"

interface FocusScoreChartProps {
  sessions: FocusSession[]
  reports: DailyReport[]
}

export function FocusScoreChart({ sessions, reports }: FocusScoreChartProps) {
  const chartData = (sessions || [])
    .filter((session) => session.endTime) // Only completed sessions
    .slice(0, 20) // Last 20 sessions
    .map((session) => ({
      time: session.startTime ? session.startTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "00:00",
      date: session.startTime ? session.startTime.toLocaleDateString("vi-VN") : "",
      score: session.focusScore || 0,
      intervention: null, // Interventions not implemented yet
      subject: session.subject || 'Không xác định',
      activity: session.subject || 'Không xác định', // Use subject as activity
      heartRate: 90, // Default heart rate
      duration: session.endTime && session.startTime ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000) : 0,
    }))
    .reverse() // Show chronologically

  const averageScore =
    chartData.length > 0 ? Math.round(chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length) : 60

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Điểm tập trung theo thời gian</h2>
          <p className="text-gray-600 text-sm">Theo dõi sự thay đổi khả năng tập trung với các can thiệp</p>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p className="text-gray-500">Chưa có dữ liệu tập trung</p>
            <p className="text-sm text-gray-400 mt-1">Dữ liệu sẽ hiển thị sau khi có phiên học</p>
          </div>
        </div>
      </div>
    )
  }

  const chartConfig = {
    score: {
      label: "Điểm tập trung",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Điểm tập trung theo thời gian</h2>
        <p className="text-gray-600 text-sm">Theo dõi sự thay đổi khả năng tập trung với các can thiệp</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="time" tickLine={false} axisLine={false} className="text-xs" interval="preserveStartEnd" />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              className="text-xs"
              label={{ value: "Điểm (%)", angle: -90, position: "insideLeft" }}
            />
            <ChartTooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white border rounded-lg p-4 shadow-lg">
                      <p className="font-semibold text-gray-900 mb-2">{`${data.date} - ${label}`}</p>
                      <div className="space-y-1">
                        <p className="text-blue-600">
                          <span className="font-medium">Điểm tập trung:</span> {data.score}%
                        </p>
                        <p className="text-red-600">
                          <span className="font-medium">Nhịp tim:</span> {data.heartRate} BPM
                        </p>
                        <p className="text-purple-600">
                          <span className="font-medium">Môn học:</span> {data.subject}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Thời gian:</span> {data.duration} phút
                        </p>
                        {data.intervention && (
                          <p className="text-orange-600 text-sm mt-2 p-2 bg-orange-50 rounded">
                            📢 {data.intervention}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />

            <ReferenceLine y={averageScore} stroke="#10b981" strokeDasharray="5 5" />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={(props) => {
                const { key, payload, ...dotProps } = props
                if (payload.intervention) {
                  return <Dot key={key} {...dotProps} fill="#f59e0b" stroke="#f59e0b" strokeWidth={2} r={6} />
                }
                return <Dot key={key} {...dotProps} fill="#3b82f6" strokeWidth={2} r={4} />
              }}
              activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-500 rounded" />
          <span>Điểm tập trung</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-green-500 rounded" style={{ borderStyle: "dashed" }} />
          <span>Trung bình ({averageScore}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <span>Can thiệp</span>
        </div>
      </div>
    </div>
  )
}
