"use client"

import type { FocusSession } from "@/lib/types"
import { ChartTooltip } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface SubjectPerformanceChartProps {
  sessions: FocusSession[]
}

export function SubjectPerformanceChart({ sessions }: SubjectPerformanceChartProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Hiệu suất theo môn học</h2>
          <p className="text-gray-600 text-sm">Điểm tập trung trung bình cho từng môn học</p>
        </div>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">Chưa có dữ liệu buổi học nào</p>
        </div>
      </div>
    )
  }

  const subjectData = sessions.reduce(
    (acc, session) => {
      if (!session.subject) return acc

      if (!acc[session.subject]) {
        acc[session.subject] = {
          totalScore: 0,
          sessionCount: 0,
          totalTime: 0,
        }
      }

      acc[session.subject].totalScore += session.focusScore || 0
      acc[session.subject].sessionCount += 1
      if (session.endTime && session.startTime) {
        acc[session.subject].totalTime += (session.endTime.getTime() - session.startTime.getTime()) / 60000
      }

      return acc
    },
    {} as Record<string, { totalScore: number; sessionCount: number; totalTime: number }>,
  )

  const chartData = Object.entries(subjectData)
    .map(([subject, data]) => ({
      subject,
      score: Math.round(data.totalScore / data.sessionCount),
      sessions: data.sessionCount,
      totalTime: Math.round(data.totalTime),
    }))
    .sort((a, b) => b.score - a.score) // Sort by performance

  const chartConfig = {
    score: {
      label: "Điểm trung bình",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Hiệu suất theo môn học</h2>
        <p className="text-gray-600 text-sm">Điểm tập trung trung bình cho từng môn học</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis
              dataKey="subject"
              tickLine={false}
              axisLine={false}
              className="text-xs"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} className="text-xs" />
            <ChartTooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white border rounded-lg p-4 shadow-lg">
                      <p className="font-semibold text-gray-900 mb-2">{`Môn: ${label}`}</p>
                      <div className="space-y-1">
                        <p className="text-blue-600">
                          <span className="font-medium">Điểm TB:</span> {data.score}%
                        </p>
                        <p className="text-green-600">
                          <span className="font-medium">Số buổi:</span> {data.sessions}
                        </p>
                        <p className="text-purple-600">
                          <span className="font-medium">Tổng thời gian:</span> {data.totalTime} phút
                        </p>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} className="hover:opacity-80 transition-opacity" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {chartData.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{chartData[0]?.subject}</div>
              <div className="text-sm text-gray-500">Môn học tốt nhất</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{chartData[0]?.score}%</div>
              <div className="text-sm text-gray-500">Điểm cao nhất</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {chartData.reduce((sum, item) => sum + item.sessions, 0)}
              </div>
              <div className="text-sm text-gray-500">Tổng buổi học</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length)}%
              </div>
              <div className="text-sm text-gray-500">Điểm TB chung</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
