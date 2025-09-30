import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjvztaykgkxnefwsyqvd.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqdnp0YXlrZ2t4bmVmd3N5cXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNTczMjIsImV4cCI6MjA0NzgzMzMyMn0.Jj6Tiq-GCnfhftIBb39s9Cr5HaMO9pHh9FKsWr5Mii8'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    
    if (!childId) {
      return NextResponse.json({ error: 'Child ID is required' }, { status: 400 })
    }

    console.log('🎯 Fetching completed activities for child:', childId)

    // Query completed schedule activities from database
    const { data, error } = await supabase
      .from('schedule_activity')
      .select('*')
      .eq('childid', childId)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching completed activities:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log(`✅ Found ${data?.length || 0} completed activities`)

    // Format completed activities with time information
    const completedActivities = data?.map(activity => ({
      id: activity.schedule_activityid,
      childId: activity.childid,
      subject: activity.subject,
      title: activity.subject,
      status: activity.status,
      startTime: new Date(activity.start_time_stamp).toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      endTime: new Date(activity.end_time_stamp).toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      completedAt: activity.updated_at ? new Date(activity.updated_at).toLocaleString('vi-VN') : null,
      duration: activity.end_time_stamp && activity.start_time_stamp 
        ? Math.round((new Date(activity.end_time_stamp).getTime() - new Date(activity.start_time_stamp).getTime()) / (1000 * 60)) + ' phút'
        : null
    })) || []

    return NextResponse.json({ 
      success: true, 
      completedActivities,
      totalCompleted: completedActivities.length
    })

  } catch (error) {
    console.error('❌ Error in completed activities API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}