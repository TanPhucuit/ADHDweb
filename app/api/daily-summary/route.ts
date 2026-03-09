import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET /api/daily-summary?childId=X
// Returns today's: completed activities, total study minutes, medications taken
export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

    // --- Schedule activities ---
    const { data: schedules } = await supabase
      .from('schedule')
      .select('scheduleid')
      .eq('childid', parseInt(childId))

    let totalActivities = 0
    let completedActivities = 0
    let totalStudyMinutes = 0

    if (schedules && schedules.length > 0) {
      const scheduleIds = schedules.map(s => s.scheduleid)

      const { data: activities } = await supabase
        .from('schedule_activity')
        .select('*')
        .in('scheduleid', scheduleIds)
        .gte('start_time_stamp', startOfDay)
        .lt('start_time_stamp', endOfDay)

      if (activities) {
        totalActivities = activities.length
        const completed = activities.filter(a => a.status === 'completed')
        completedActivities = completed.length

        // Sum duration of completed activities in minutes
        totalStudyMinutes = completed.reduce((sum, a) => {
          try {
            const start = new Date(a.start_time_stamp).getTime()
            const end = new Date(a.end_time_stamp).getTime()
            const mins = Math.round((end - start) / 60000)
            return sum + (mins > 0 ? mins : 0)
          } catch {
            return sum
          }
        }, 0)
      }
    }

    // --- Medications ---
    const { data: meds } = await supabase
      .from('medicine_notification')
      .select('*')
      .eq('childid', parseInt(childId))

    const totalMeds = meds?.length ?? 0
    const takenMeds = meds?.filter(m => m.status === 'taken').length ?? 0

    return NextResponse.json({
      date: today.toISOString().slice(0, 10),
      activities: { total: totalActivities, completed: completedActivities },
      studyMinutes: totalStudyMinutes,
      medications: { total: totalMeds, taken: takenMeds },
    })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
