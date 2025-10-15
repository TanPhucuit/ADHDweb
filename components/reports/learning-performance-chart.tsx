"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

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

const COLORS = {
  completed: '#22c55e', // Green
  pending: '#ef4444'    // Red
}

export function LearningPerformanceChart({ childId }: LearningPerformanceChartProps) {
  const [data, setData] = useState<LearningPerformanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (childId) {
      fetchLearningPerformance()
    }
  }, [childId])

  const fetchLearningPerformance = async () => {
    try {
      setLoading(true)
      console.log('📊 Fetching learning performance for child:', childId)
      
      const response = await fetch(`/api/reports/learning-performance?childId=${childId}&_t=${Date.now()}`)
      const result = await response.json()
      
      if (response.ok) {
        setData(result.data)
        console.log('📊 Learning performance data loaded:', result.data)
      } else {
        console.error('❌ Error fetching learning performance:', result.error)
        setData(null)
      }
    } catch (error) {
      console.error('❌ Error:', error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hiệu suất học tập</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.totalActivities === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hiệu suất học tập</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có hoạt động học tập</h3>
              <p className="text-gray-500">Dữ liệu sẽ hiển thị khi có hoạt động học tập</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = [
    {
      name: 'Đã hoàn thành',
      value: data.completed,
      color: COLORS.completed
    },
    {
      name: 'Chưa hoàn thành', 
      value: data.pending,
      color: COLORS.pending
    }
  ].filter(item => item.value > 0) // Only show non-zero values

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hiệu suất học tập</CardTitle>
        <div className="text-sm text-gray-600">
          Tổng số hoạt động: {data.totalActivities} | Tỷ lệ hoàn thành: {data.completionRate}%
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.completed}</div>
            <div className="text-sm text-gray-600">Đã hoàn thành</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{data.pending}</div>
            <div className="text-sm text-gray-600">Chưa hoàn thành</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}