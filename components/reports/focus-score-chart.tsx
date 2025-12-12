"use client"

import type { FocusSession, DailyReport } from "@/lib/types"
import { ChartTooltip } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Dot } from "recharts"

interface FocusScoreChartProps {
  sessions: FocusSession[]
  reports: DailyReport[]
}

export function FocusScoreChart({ sessions, reports }: FocusScoreChartProps) {
  // Use mock data for demo
  const chartData = [
    { time: "08:00", date: "20/01/2025", score: 65, intervention: null, subject: "Toán học", activity: "Giải toán", heartRate: 78, duration: 25 },
    { time: "09:00", date: "20/01/2025", score: 72, intervention: "Nhắc nhở giữ tư thế ngồi", subject: "Văn học", activity: "Đọc sách", heartRate: 75, duration: 30 },
    { time: "10:30", date: "20/01/2025", score: 68, intervention: null, subject: "Toán học", activity: "Luyện tập", heartRate: 80, duration: 20 },
    { time: "13:00", date: "20/01/2025", score: 75, intervention: null, subject: "Tiếng Anh", activity: "Học từ vựng", heartRate: 76, duration: 25 },
    { time: "14:00", date: "20/01/2025", score: 70, intervention: "Nghỉ giải lao 5 phút", subject: "Khoa học", activity: "Thí nghiệm", heartRate: 82, duration: 35 },
    { time: "15:30", date: "21/01/2025", score: 78, intervention: null, subject: "Toán học", activity: "Bài tập nâng cao", heartRate: 74, duration: 30 },
    { time: "16:00", date: "21/01/2025", score: 73, intervention: null, subject: "Lịch sử", activity: "Đọc hiểu", heartRate: 79, duration: 25 },
    { time: "08:00", date: "22/01/2025", score: 80, intervention: null, subject: "Toán học", activity: "Giải toán", heartRate: 73, duration: 40 },
    { time: "09:30", date: "22/01/2025", score: 76, intervention: "Khuyến khích tập trung", subject: "Văn học", activity: "Viết bài", heartRate: 77, duration: 30 },
    { time: "11:00", date: "22/01/2025", score: 82, intervention: null, subject: "Tiếng Anh", activity: "Nghe hiểu", heartRate: 75, duration: 25 },
    { time: "14:00", date: "22/01/2025", score: 79, intervention: null, subject: "Khoa học", activity: "Nghiên cứu", heartRate: 78, duration: 35 },
    { time: "15:00", date: "23/01/2025", score: 85, intervention: null, subject: "Toán học", activity: "Ôn tập", heartRate: 72, duration: 30 },
    { time: "08:30", date: "23/01/2025", score: 77, intervention: null, subject: "Văn học", activity: "Bài tập", heartRate: 76, duration: 25 },
    { time: "10:00", date: "23/01/2025", score: 81, intervention: "Tặng thưởng ngôi sao", subject: "Tiếng Anh", activity: "Luyện nói", heartRate: 74, duration: 30 },
    { time: "13:30", date: "24/01/2025", score: 83, intervention: null, subject: "Toán học", activity: "Kiểm tra", heartRate: 77, duration: 35 },
    { time: "15:00", date: "24/01/2025", score: 88, intervention: null, subject: "Khoa học", activity: "Dự án", heartRate: 71, duration: 40 },
    { time: "08:00", date: "25/01/2025", score: 80, intervention: null, subject: "Toán học", activity: "Ôn tập", heartRate: 75, duration: 25 },
    { time: "09:30", date: "25/01/2025", score: 86, intervention: null, subject: "Văn học", activity: "Sáng tác", heartRate: 73, duration: 35 },
    { time: "11:00", date: "25/01/2025", score: 84, intervention: null, subject: "Lịch sử", activity: "Thảo luận", heartRate: 76, duration: 30 },
    { time: "14:00", date: "25/01/2025", score: 90, intervention: null, subject: "Toán học", activity: "Thử thách", heartRate: 70, duration: 40 },
  ]

  const averageScore = Math.round(chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length)

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
