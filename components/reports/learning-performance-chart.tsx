"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { BookOpen } from "lucide-react"

interface LearningPerformanceData {
  childId: string
  completed: number
  pending: number
  totalActivities: number
  completionRate: number
}

interface LearningPerformanceChartProps {
  childId: string
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-xl text-sm">
      <p className="font-bold" style={{ color: d.color }}>{d.name}</p>
      <p className="text-gray-600">{d.value} hoạt động</p>
    </div>
  )
}

export function LearningPerformanceChart({ childId }: LearningPerformanceChartProps) {
  const [data, setData] = useState<LearningPerformanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) return
    setLoading(true)
    fetch(`/api/reports/learning-performance?childId=${childId}&_t=${Date.now()}`)
      .then(r => r.ok ? r.json() : null)
      .then(result => setData(result?.data ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [childId])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Hiệu suất học tập</h2>
        <div className="flex items-center justify-center h-56">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!data || data.totalActivities === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Hiệu suất học tập</h2>
        <div className="flex flex-col items-center justify-center h-56 gap-3">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Chưa có hoạt động học tập</p>
          <p className="text-gray-400 text-sm">Dữ liệu sẽ hiển thị khi có hoạt động</p>
        </div>
      </div>
    )
  }

  const chartData = [
    { name: 'Đã hoàn thành', value: data.completed, color: '#22c55e' },
    { name: 'Chưa hoàn thành', value: data.pending, color: '#f87171' },
  ].filter(d => d.value > 0)

  const rate = data.completionRate
  const rateColor = rate >= 80 ? '#22c55e' : rate >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-50">
        <h2 className="text-lg font-bold text-gray-900">Hiệu suất học tập</h2>
        <p className="text-sm text-gray-500 mt-0.5">Tỷ lệ hoàn thành hoạt động trong thời khóa biểu</p>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-6">
          {/* Donut chart with center label */}
          <div className="relative flex-shrink-0" style={{ width: 180, height: 180 }}>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={80}
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black" style={{ color: rateColor }}>{rate}%</span>
              <span className="text-xs text-gray-500 mt-0.5">hoàn thành</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-700">Đã hoàn thành</span>
              </div>
              <span className="text-xl font-black text-green-600">{data.completed}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-sm font-medium text-gray-700">Chưa hoàn thành</span>
              </div>
              <span className="text-xl font-black text-red-500">{data.pending}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Tổng hoạt động</span>
              </div>
              <span className="text-xl font-black text-gray-700">{data.totalActivities}</span>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Tiến độ</span>
                <span className="font-semibold" style={{ color: rateColor }}>{rate}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${rate}%`, backgroundColor: rateColor }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation note */}
        <div className={`mt-4 px-4 py-3 rounded-xl text-sm border-l-4 ${
          rate >= 80
            ? 'bg-green-50 border-green-400 text-green-800'
            : rate >= 60
            ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
            : 'bg-red-50 border-red-400 text-red-800'
        }`}>
          {rate >= 80
            ? '✅ Xuất sắc! Trẻ hoàn thành tốt các hoạt động học tập.'
            : rate >= 60
            ? '⚡ Khá tốt! Có thể cải thiện thêm để đạt mục tiêu 80%.'
            : '⚠️ Cần chú ý — hãy hỗ trợ thêm để tăng tỷ lệ hoàn thành.'}
        </div>
      </div>
    </div>
  )
}
