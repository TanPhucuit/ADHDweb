import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET - Get learning performance data for a child
export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')

    if (!childId) {
      return NextResponse.json({ error: 'childId is required' }, { status: 400 })
    }

    console.log('📊 Calculating learning performance for child:', childId)

    // Get all schedules for this child
    const { data: schedules, error: scheduleError } = await supabase
      .from('schedule')
      .select('scheduleid')
      .eq('childid', childId)

    if (scheduleError) {
      console.error('❌ Error fetching schedules:', scheduleError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const scheduleIds = schedules?.map(s => s.scheduleid) || []
    console.log('📅 Found schedules for child', childId, ':', scheduleIds)

    if (scheduleIds.length === 0) {
      return NextResponse.json({
        data: {
          childId,
          completed: 0,
          pending: 0,
          totalActivities: 0,
          completionRate: 0
        }
      })
    }

    // Get all schedule activities for these schedules
    const { data: allActivities, error: allActivitiesError } = await supabase
      .from('schedule_activity')
      .select('*')
      .in('scheduleid', scheduleIds)

    if (allActivitiesError) {
      console.error('❌ Error fetching all activities:', allActivitiesError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Get completed schedule activities
    const { data: completedActivities, error: completedError } = await supabase
      .from('schedule_activity')
      .select('*')
      .in('scheduleid', scheduleIds)
      .eq('status', 'completed')

    if (completedError) {
      console.error('❌ Error fetching completed activities:', completedError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const totalActivities = allActivities?.length || 0
    const completedCount = completedActivities?.length || 0
    const pendingCount = totalActivities - completedCount
    const completionRate = totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0

    console.log('📊 Learning performance calculated:', {
      totalActivities,
      completedCount,
      pendingCount,
      completionRate
    })

    return NextResponse.json({
      data: {
        childId,
        completed: completedCount,
        pending: pendingCount,
        totalActivities,
        completionRate
      }
    })

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}