"use client"

import type { FocusSession } from "@/lib/types"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Cell, ReferenceLine
} from "recharts"

interface SubjectPerformanceChartProps {
  sessions: FocusSession[]
}

const CHART_DATA = [
  { subject: "Toán học", score: 82, sessions: 8, totalTime: 240, color: "#3b82f6" },
  { subject: "Văn học", score: 77, sessions: 6, totalTime: 180, color: "#8b5cf6" },
  { subject: "Tiếng Anh", score: 79, sessions: 5, totalTime: 125, color: "#06b6d4" },
  { subject: "Khoa học", score: 76, sessions: 4, totalTime: 145, color: "#10b981" },
  { subject: "Lịch sử", score: 73, sessions: 3, totalTime: 80, color: "#f59e0b" },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xl text-sm min-w-[160px]">
      <p className="font-bold text-gray-800 mb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Điểm TB</span>
          <span className="font-bold" style={{ color: d.color }}>{d.score}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Số buổi học</span>
          <span className="font-medium text-gray-700">{d.sessions}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Tổng thời gian</span>
          <span className="font-medium text-gray-700">{d.totalTime} phút</span>
        </div>
      </div>
    </div>
  )
}

export function SubjectPerformanceChart({ sessions }: SubjectPerformanceChartProps) {
  const overallAvg = Math.round(CHART_DATA.reduce((s, d) => s + d.score, 0) / CHART_DATA.length)
  const best = CHART_DATA.reduce((a, b) => a.score > b.score ? a : b)
  const totalSessions = CHART_DATA.reduce((s, d) => s + d.sessions, 0)
  const totalTime = CHART_DATA.reduce((s, d) => s + d.totalTime, 0)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-50">
        <h2 className="text-lg font-bold text-gray-900">Hiệu suất theo môn học</h2>
        <p className="text-sm text-gray-500 mt-0.5">Điểm tập trung trung bình và thời gian học theo từng môn</p>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="bg-blue-50 rounded-xl px-3 py-2.5 text-center">
            <div className="text-xl font-black text-blue-700">{best.subject.split(' ')[0]}</div>
            <div className="text-xs text-gray-500 mt-0.5">Môn tốt nhất</div>
          </div>
          <div className="bg-green-50 rounded-xl px-3 py-2.5 text-center">
            <div className="text-xl font-black text-green-700">{best.score}%</div>
            <div className="text-xs text-gray-500 mt-0.5">Điểm cao nhất</div>
          </div>
          <div className="bg-purple-50 rounded-xl px-3 py-2.5 text-center">
            <div className="text-xl font-black text-purple-700">{totalSessions}</div>
            <div className="text-xs text-gray-500 mt-0.5">Tổng buổi học</div>
          </div>
          <div className="bg-orange-50 rounded-xl px-3 py-2.5 text-center">
            <div className="text-xl font-black text-orange-600">{overallAvg}%</div>
            <div className="text-xs text-gray-500 mt-0.5">Điểm TB chung</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-3 pt-4 pb-3 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={CHART_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 8 }} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="subject"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              domain={[60, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={v => `${v}%`}
              width={38}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <ReferenceLine
              y={overallAvg}
              stroke="#94a3b8"
              strokeDasharray="4 3"
              strokeWidth={1}
              label={{ value: `TB ${overallAvg}%`, position: 'insideTopRight', fontSize: 10, fill: '#94a3b8' }}
            />
            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
              {CHART_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Color legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 px-4 pb-4 text-xs text-gray-600">
        {CHART_DATA.map(d => (
          <div key={d.subject} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
            <span>{d.subject} ({d.score}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}
