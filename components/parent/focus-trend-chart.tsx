"use client"

import type { FocusSession, Child } from "@/lib/types"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { TrendingUp } from "lucide-react"

interface FocusTrendChartProps {
  sessions: FocusSession[]
  child: Child
}

export function FocusTrendChart({ sessions, child }: FocusTrendChartProps) {
  // Use mock data for demo purposes
  const chartData = [
    { session: "Phiên 1", time: "08:00", focusScore: 65, heartRate: 78, fidgetLevel: 30, subject: "Toán học", activity: "Bài tập", duration: 25 },
    { session: "Phiên 2", time: "09:00", focusScore: 72, heartRate: 75, fidgetLevel: 25, subject: "Văn học", activity: "Đọc sách", duration: 30 },
    { session: "Phiên 3", time: "10:30", focusScore: 68, heartRate: 80, fidgetLevel: 35, subject: "Toán học", activity: "Luyện tập", duration: 20 },
    { session: "Phiên 4", time: "13:00", focusScore: 75, heartRate: 76, fidgetLevel: 22, subject: "Tiếng Anh", activity: "Học từ vựng", duration: 25 },
    { session: "Phiên 5", time: "14:00", focusScore: 70, heartRate: 82, fidgetLevel: 28, subject: "Khoa học", activity: "Thí nghiệm", duration: 35 },
    { session: "Phiên 6", time: "15:30", focusScore: 78, heartRate: 74, fidgetLevel: 20, subject: "Toán học", activity: "Bài tập nâng cao", duration: 30 },
    { session: "Phiên 7", time: "16:00", focusScore: 73, heartRate: 79, fidgetLevel: 26, subject: "Lịch sử", activity: "Đọc hiểu", duration: 25 },
    { session: "Phiên 8", time: "08:00", focusScore: 80, heartRate: 73, fidgetLevel: 18, subject: "Toán học", activity: "Giải toán", duration: 40 },
    { session: "Phiên 9", time: "09:30", focusScore: 76, heartRate: 77, fidgetLevel: 23, subject: "Văn học", activity: "Viết bài", duration: 30 },
    { session: "Phiên 10", time: "11:00", focusScore: 82, heartRate: 75, fidgetLevel: 19, subject: "Tiếng Anh", activity: "Nghe hiểu", duration: 25 },
    { session: "Phiên 11", time: "14:00", focusScore: 79, heartRate: 78, fidgetLevel: 21, subject: "Khoa học", activity: "Nghiên cứu", duration: 35 },
    { session: "Phiên 12", time: "15:00", focusScore: 85, heartRate: 72, fidgetLevel: 15, subject: "Toán học", activity: "Ôn tập", duration: 30 },
  ]

  const averageScore = chartData.length > 0 ? 
    Math.round(chartData.reduce((sum, item) => sum + (item.focusScore || 0), 0) / chartData.length) : 0

  // Show empty state if no data
  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Xu hướng tập trung</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-600">Chưa có dữ liệu phiên tập trung</p>
          <p className="text-sm text-gray-500 mt-1">Biểu đồ sẽ hiển thị khi có hoạt động</p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">
            {label} - {data.time}
          </p>
          <div className="space-y-1">
            <p className="text-blue-600">
              <span className="font-medium">Điểm tập trung:</span> {data.focusScore}%
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
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Xu hướng tập trung
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm">12 phiên học gần nhất</p>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{averageScore}%</div>
          <div className="text-xs sm:text-sm text-gray-500">Điểm TB</div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px] h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="session" tick={{ fontSize: 10 }} stroke="#666" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#666" />
              <Tooltip content={<CustomTooltip />} />

              {/* Reference line for target focus score */}
              <ReferenceLine y={70} stroke="#10b981" strokeDasharray="5 5" label="Mục tiêu" />

              {/* Focus score line */}
              <Line
                type="monotone"
                dataKey="focusScore"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#3b82f6", strokeWidth: 2 }}
              />

              {/* Heart rate line (secondary) */}
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-3 sm:mt-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600">Điểm tập trung</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-red-500 rounded"></div>
          <span className="text-gray-600">Nhịp tim</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-green-500 rounded" style={{ borderStyle: "dashed" }}></div>
          <span className="text-gray-600">Mục tiêu (70%)</span>
        </div>
      </div>
    </div>
  )
}
