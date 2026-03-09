import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { childId, activities } = await request.json()

    if (!childId || !activities || activities.length === 0) {
      return NextResponse.json({ error: 'Child ID and activities are required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Step 1: Create a new schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from('schedule')
      .insert({
        childid: parseInt(childId) // childid should be integer
      })
      .select()
      .single()

    if (scheduleError) {
      console.error('❌ Error creating schedule:', scheduleError)
      return NextResponse.json({ error: 'Error creating schedule' }, { status: 500 })
    }

    console.log('✅ Created schedule:', schedule)

    // Step 2: Create schedule activities
    const today = new Date().toISOString().split('T')[0] // Get today's date (YYYY-MM-DD)
    
    const scheduleActivities = activities.map((activity: any) => ({
      scheduleid: schedule.scheduleid,
      subject: activity.subject,
      start_time_stamp: `${today}T${activity.start_time}:00`, // Convert to full timestamp
      end_time_stamp: `${today}T${activity.end_time}:00`,     // Convert to full timestamp
      status: 'pending'
    }))

    const { data: createdActivities, error: activitiesError } = await supabase
      .from('schedule_activity')
      .insert(scheduleActivities)
      .select()

    if (activitiesError) {
      console.error('❌ Error creating activities:', activitiesError)
      // Try to cleanup the schedule if activities failed
      await supabase.from('schedule').delete().eq('scheduleid', schedule.scheduleid)
      return NextResponse.json({ error: 'Error creating activities' }, { status: 500 })
    }

    console.log('✅ Created activities:', createdActivities)

    return NextResponse.json({ 
      success: true, 
      schedule,
      activities: createdActivities,
      message: `Đã tạo lịch học với ${createdActivities.length} hoạt động cho trẻ`
    })

  } catch (error) {
    console.error('❌ Error in create-schedule API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage
    }, { status: 500 })
  }
}