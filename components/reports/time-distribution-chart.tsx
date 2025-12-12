"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface TimeDistributionChartProps {
  parentId: string
}

interface ParentAction {
  id: number
  parentid: number
  action_label: string
  timestamp: string
}

const chartConfig = {
  focused: {
    label: "Tập trung",
    color: "hsl(var(--primary))",
  },
  distracted: {
    label: "Mất tập trung",
    color: "hsl(var(--destructive))",
  },
  break: {
    label: "Nghỉ ngơi",
    color: "hsl(var(--muted-foreground))",
  },
}

export function TimeDistributionChart({ parentId }: TimeDistributionChartProps) {
  const [actions, setActions] = useState<ParentAction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActions = async () => {
      if (!parentId) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        const response = await fetch(`/api/parent/actions/list?parentId=${parentId}`)
        if (response.ok) {
          const data = await response.json()
          setActions(data.actions || [])
        }
      } catch (error) {
        console.error('Error fetching actions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActions()
  }, [parentId])

  // Calculate distribution from actions
  const calculateDistribution = () => {
    if (actions.length === 0) {
      return [
        { name: "Tập trung", value: 0, color: "hsl(var(--primary))" },
        { name: "Mất tập trung", value: 0, color: "hsl(var(--destructive))" },
        { name: "Nghỉ ngơi", value: 0, color: "hsl(var(--muted-foreground))" },
      ]
    }

    let focusedCount = 0
    let distractedCount = 0
    let breakCount = 0

    actions.forEach((action) => {
      if (action.action_label === 'nhac-tap-trung') {
        distractedCount++
      } else if (action.action_label === 'nghi-giai-lao') {
        breakCount++
      } else {
        // khen-ngoi, dong-vien -> focused
        focusedCount++
      }
    })

    const total = focusedCount + distractedCount + breakCount
    
    return [
      { 
        name: "Tập trung", 
        value: Math.round((focusedCount / total) * 100), 
        color: "hsl(var(--primary))" 
      },
      { 
        name: "Mất tập trung", 
        value: Math.round((distractedCount / total) * 100), 
        color: "hsl(var(--destructive))" 
      },
      { 
        name: "Nghỉ ngơi", 
        value: Math.round((breakCount / total) * 100), 
        color: "hsl(var(--muted-foreground))" 
      },
    ]
  }

  const chartData = calculateDistribution()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">Phân bổ thời gian</CardTitle>
        <CardDescription>Tỷ lệ thời gian trong các trạng thái khác nhau</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-primary">{`${data.value}%`}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Custom Legend */}
        <div className="flex justify-center gap-6 mt-4">
          {chartData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}</span>
              <span className="font-medium">{entry.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
