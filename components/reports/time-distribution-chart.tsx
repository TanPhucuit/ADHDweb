"use client"

import type { DailyReport } from "@/lib/types"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface TimeDistributionChartProps {
  reports: DailyReport[]
}

// Solid hex colors — no CSS variables
const SEGMENTS = [
  { key: "focused",     name: "Tập trung",      color: "#3b82f6", bgColor: "bg-blue-50",   textColor: "text-blue-700" },
  { key: "break",       name: "Nghỉ giải lao",  color: "#10b981", bgColor: "bg-green-50",  textColor: "text-green-700" },
  { key: "distracted",  name: "Mất tập trung",  color: "#f87171", bgColor: "bg-red-50",    textColor: "text-red-600" },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-xl text-sm">
      <p className="font-bold" style={{ color: d.color }}>{d.name}</p>
      <p className="text-gray-600">{d.value}% thời gian</p>
    </div>
  )
}

export function TimeDistributionChart({ reports }: TimeDistributionChartProps) {
  // Derive distribution from reports — interventionsCount indicates distraction
  // sessionsCount * 25min per session = focused time
  // remainder is break + distracted

  let focusedPct = 65
  let breakPct = 19
  let distractedPct = 16

  if (reports && reports.length > 0) {
    const totalInterventions = reports.reduce((s, r) => s + (r.interventionsCount ?? 0), 0)
    const totalSessions = reports.reduce((s, r) => s + (r.sessionsCount ?? 0), 0)
    // Rough estimate: each intervention = ~5 min distraction; each session = 25 min focus
    const focusMin = totalSessions * 25
    const distractMin = totalInterventions * 5
    const breakMin = Math.max(0, focusMin * 0.25) // ~25% of focus time is breaks
    const totalMin = focusMin + distractMin + breakMin
    if (totalMin > 0) {
      focusedPct = Math.round((focusMin / totalMin) * 100)
      distractedPct = Math.round((distractMin / totalMin) * 100)
      breakPct = 100 - focusedPct - distractedPct
    }
  }

  const chartData = [
    { ...SEGMENTS[0], value: focusedPct },
    { ...SEGMENTS[1], value: breakPct },
    { ...SEGMENTS[2], value: distractedPct },
  ].filter(d => d.value > 0)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-50">
        <h2 className="text-lg font-bold text-gray-900">Phân bổ thời gian</h2>
        <p className="text-sm text-gray-500 mt-0.5">Tỷ lệ thời gian trong các trạng thái học tập</p>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-6">
          {/* Donut */}
          <div className="relative flex-shrink-0" style={{ width: 180, height: 180 }}>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
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
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-blue-600">{focusedPct}%</span>
              <span className="text-xs text-gray-500">tập trung</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="flex-1 space-y-2.5">
            {[
              { label: "Tập trung", value: focusedPct, color: "#3b82f6", bg: "bg-blue-50", text: "text-blue-700" },
              { label: "Nghỉ giải lao", value: breakPct, color: "#10b981", bg: "bg-green-50", text: "text-green-700" },
              { label: "Mất tập trung", value: distractedPct, color: "#f87171", bg: "bg-red-50", text: "text-red-600" },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-gray-700 font-medium">{s.label}</span>
                  </div>
                  <span className={`font-bold ${s.text}`}>{s.value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${s.value}%`, backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className={`mt-4 px-4 py-3 rounded-xl text-sm border-l-4 ${
          focusedPct >= 65
            ? 'bg-blue-50 border-blue-400 text-blue-800'
            : 'bg-yellow-50 border-yellow-400 text-yellow-800'
        }`}>
          {focusedPct >= 65
            ? `✅ Tỷ lệ tập trung tốt (${focusedPct}%). Trẻ dành phần lớn thời gian cho học tập.`
            : `⚡ Tỷ lệ tập trung ${focusedPct}% — thấp hơn mức mục tiêu 65%. Cần kiểm tra môi trường học tập.`}
        </div>
      </div>
    </div>
  )
}
