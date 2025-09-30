"use client"

import { useState, useEffect } from "react"
import { ScheduleView } from "./schedule-view"
import { TaskProgress } from "./task-progress"
import { apiService } from "@/lib/api-service"
import type { Child, ScheduleItem } from "@/lib/types"

interface ScheduleManagementProps {
  childId: string
}

export function ScheduleManagement({ childId }: ScheduleManagementProps) {
  const [child, setChild] = useState<Child | null>(null)
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [childData, scheduleData] = await Promise.all([
        apiService.getChild(childId),
        apiService.getScheduleActivities(childId)
      ])
      
      setChild(childData)
      setScheduleItems(scheduleData)
    } catch (error) {
      console.error('Error loading schedule data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (childId) {
      loadData()
    }
  }, [childId])

  const handleTaskUpdate = async (taskId: string, updates: Partial<ScheduleItem>) => {
    try {
      await apiService.updateScheduleActivity(taskId, updates)
      
      // Award points for task completion if completed
      if (updates.status === 'completed') {
        console.log('🎉 Task completed, awarding points')
        // Points will be calculated automatically by the rewards API from database
      }
      
      // Reload data to reflect changes
      await loadData()
    } catch (error) {
      console.error('❌ Error updating task:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Đang tải lịch trình...</div>
  }

  if (!child) {
    return <div className="text-center py-4">Không tìm thấy thông tin trẻ em</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Lịch học của {child.name}
        </h2>
        
        <TaskProgress
          tasks={scheduleItems}
          onTaskUpdate={handleTaskUpdate}
        />
      </div>

      <ScheduleView
        child={child}
        scheduleItems={scheduleItems}
        onTaskUpdate={handleTaskUpdate}
        onReload={loadData}
      />
    </div>
  )
}