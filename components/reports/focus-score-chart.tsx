"use client"

import type { FocusSession, DailyReport } from "@/lib/types"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, ReferenceLine, Dot, Tooltip
} from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"

interface FocusScoreChartProps {
  sessions: FocusSession[]
  reports: DailyReport[]
}

const CHART_DATA = [
  { time: "08:00", date: "20/01", score: 65, intervention: null, subject: "Toán học" },
  { time: "09:00", date: "20/01", score: 72, intervention: "Nhắc nhở tập trung", subject: "Văn học" },
  { time: "10:30", date: "20/01", score: 68, intervention: null, subject: "Toán học" },
  { time: "13:00", date: "20/01", score: 75, intervention: null, subject: "Tiếng Anh" },
  { time: "14:00", date: "20/01", score: 70, intervention: "Nghỉ giải lao", subject: "Khoa học" },
  { time: "15:30", date: "21/01", score: 78, intervention: null, subject: "Toán học" },
  { time: "08:00", date: "22/01", score: 80, intervention: null, subject: "Toán học" },
  { time: "09:30", date: "22/01", score: 76, intervention: "Khen ngợi", subject: "Văn học" },
  { time: "11:00", date: "22/01", score: 82, intervention: null, subject: "Tiếng Anh" },
  { time: "15:00", date: "23/01", score: 85, intervention: null, subject: "Toán học" },
  { time: "08:30", date: "23/01", score: 77, intervention: null, subject: "Văn học" },
  { time: "10:00", date: "23/01", score: 81, intervention: "Tặng thưởng", subject: "Tiếng Anh" },
  { time: "13:30", date: "24/01", score: 83, intervention: null, subject: "Toán học" },
  { time: "15:00", date: "24/01", score: 88, intervention: null, subject: "Khoa học" },
  { time: "08:00", date: "25/01", score: 80, intervention: null, subject: "Toán học" },
  { time: "09:30", date: "25/01", score: 86, intervention: null, subject: "Văn học" },
  { time: "14:00", date: "25/01", score: 90, intervention: null, subject: "Toán học" },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xl text-sm min-w-[175px]">
      <p className="font-bold text-gray-800 mb-2">{d.date} · {label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Điểm tập trung</span>
          <span className="font-bold text-blue-600">{d.score}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Môn học</span>
          <span className="font-medium text-gray-700">{d.subject}</span>
        </div>
        {d.intervention && (
          <div className="mt-1.5 pt-1.5 border-t border-gray-100">
            <p className="text-orange-600 text-xs font-medium">Can thiệp: {d.intervention}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function FocusScoreChart({ sessions, reports }: FocusScoreChartProps) {
  const scores = CHART_DATA.map(d => d.score)
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  const best = Math.max(...scores)
  const worst = Math.min(...scores)
  const mid = Math.floor(scores.length / 2)
  const earlyAvg = scores.slice(0, mid).reduce((a, b) => a + b, 0) / mid
  const lateAvg = scores.slice(mid).reduce((a, b) => a + b, 0) / (scores.length - mid)
  const trendDelta = Math.round(lateAvg - earlyAvg)
  const interventions = CHART_DATA.filter(d => d.intervention).length

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Điểm tập trung theo thời gian</h2>
            <p className="text-sm text-gray-500 mt-0.5">Xu hướng tập trung qua các buổi học trong tuần</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold flex-shrink-0 ${
            trendDelta >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            {trendDelta >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {trendDelta >= 0 ? '+' : ''}{trendDelta}đ xu hướng
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {([
            { label: "Trung bình", value: `${avg}%`, bg: "bg-blue-50", text: "text-blue-700" },
            { label: "Cao nhất", value: `${best}%`, bg: "bg-green-50", text: "text-green-700" },
            { label: "Thấp nhất", value: `${worst}%`, bg: "bg-orange-50", text: "text-orange-600" },
            { label: "Can thiệp", value: String(interventions), bg: "bg-yellow-50", text: "text-yellow-700" },
          ] as const).map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl px-3 py-2.5 text-center`}>
              <div className={`text-xl font-black leading-tight ${s.text}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-3 pt-4 pb-1 h-[270px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CHART_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[50, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={v => `${v}%`}
              width={38}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={avg}
              stroke="#10b981"
              strokeDasharray="5 4"
              strokeWidth={1.5}
              label={{ value: `TB ${avg}%`, position: 'insideTopRight', fontSize: 10, fill: '#059669' }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#focusGradient)"
              dot={(props: any) => {
                const { key, payload, cx, cy } = props
                if (payload.intervention) {
                  return <Dot key={key} cx={cx} cy={cy} r={6} fill="#f59e0b" stroke="#fff" strokeWidth={2} />
                }
                return <Dot key={key} cx={cx} cy={cy} r={3.5} fill="#3b82f6" stroke="#fff" strokeWidth={1.5} />
              }}
              activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0.5 bg-blue-500 rounded" />
          <span>Điểm tập trung</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="20" height="4" viewBox="0 0 20 4">
            <line x1="0" y1="2" x2="20" y2="2" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
          <span>Trung bình ({avg}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <span>Có can thiệp</span>
        </div>
      </div>
    </div>
  )
}
