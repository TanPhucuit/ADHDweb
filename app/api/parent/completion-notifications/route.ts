import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjvztaykgkxnefwsyqvd.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqdnp0YXlrZ2t4bmVmd3N5cXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNTczMjIsImV4cCI6MjA0NzgzMzMyMn0.Jj6Tiq-GCnfhftIBb39s9Cr5HaMO9pHh9FKsWr5Mii8'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    
    if (!parentId) {
      return NextResponse.json({ error: 'Parent ID is required' }, { status: 400 })
    }

    console.log('🎯 Generating completed activity notifications for parent:', parentId)

    // Step 1: Get all children of this parent - try different table/column names
    let children: any[] | null = null
    let childrenError = null

    // Try different possible table and column combinations
    const childQueries = [
      // Try 1: child table with parentid column
      () => supabase.from('child').select('childid, full_name, parentid').eq('parentid', parentId),
      // Try 2: child table with parent_id column  
      () => supabase.from('child').select('childid, full_name, parent_id').eq('parent_id', parentId),
      // Try 3: children table with parentid column
      () => supabase.from('children').select('child_id, full_name, parent_id').eq('parent_id', parentId),
      // Try 4: children table with parentid column
      () => supabase.from('children').select('child_id, full_name, parentid').eq('parentid', parentId)
    ]

    for (let i = 0; i < childQueries.length; i++) {
      try {
        console.log(`🔍 Trying child query ${i + 1}...`)
        const result = await childQueries[i]()
        if (result.data && !result.error) {
          children = result.data
          console.log(`✅ Successfully fetched children with query ${i + 1}:`, children)
          break
        } else {
          console.log(`❌ Query ${i + 1} failed:`, result.error)
        }
      } catch (error) {
        console.log(`❌ Query ${i + 1} exception:`, error)
      }
    }

    if (!children) {
      console.log('❌ All child queries failed, trying to return empty result')
      return NextResponse.json({ 
        success: true, 
        notifications: [],
        message: 'No children found or database error',
        debug: 'All child table queries failed'
      })
    }

    console.log(`📋 Found ${children?.length || 0} children for parent ${parentId}`)

    if (children.length === 0) {
      return NextResponse.json({ 
        success: true, 
        notifications: [],
        message: 'No children found for this parent'
      })
    }

    // Step 2: Get all completed activities for these children
    // Extract child IDs (handle both childid and child_id)
    const childIds = children.map((child: any) => child.childid || child.child_id).filter(Boolean)
    
    if (childIds.length === 0) {
      return NextResponse.json({ 
        success: true, 
        notifications: [],
        message: 'No valid child IDs found'
      })
    }

    console.log('🔍 Looking for completed activities for child IDs:', childIds)

    // Try different activity table queries - JOIN WITH SCHEDULE TABLE
    let completedActivities: any[] | null = null
    
    // Get schedule IDs for these children first
    const { data: childSchedules, error: schedulesError } = await supabase
      .from('schedule')
      .select('scheduleid, childid')
      .in('childid', childIds)
    
    if (schedulesError) {
      console.log('❌ Error fetching schedules:', schedulesError)
      return NextResponse.json({ 
        success: true, 
        notifications: [],
        message: 'Error fetching schedules',
        debug: schedulesError
      })
    }
    
    const scheduleIds = childSchedules?.map(s => s.scheduleid) || []
    console.log('🔍 Found schedule IDs for children:', scheduleIds)
    
    if (scheduleIds.length === 0) {
      return NextResponse.json({ 
        success: true, 
        notifications: [],
        message: 'No schedules found for children'
      })
    }
    
    // Now get completed activities for these schedules
    const { data: activities, error: activitiesError } = await supabase
      .from('schedule_activity')
      .select('*')
      .in('scheduleid', scheduleIds)
      .eq('status', 'completed')
    
    if (activitiesError) {
      console.log('❌ Error fetching activities:', activitiesError)
      return NextResponse.json({ 
        success: true, 
        notifications: [],
        message: 'Error fetching activities',
        debug: activitiesError
      })
    }
    
    completedActivities = activities
    console.log(`✅ Found ${completedActivities?.length || 0} completed activities`)
    
    // Add childid to each activity from schedule mapping
    completedActivities = completedActivities?.map(activity => {
      const schedule = childSchedules?.find(s => s.scheduleid === activity.scheduleid)
      return {
        ...activity,
        childid: schedule?.childid
      }
    }) || []

    console.log(`✅ Found ${completedActivities?.length || 0} completed activities`)

    // Step 3: Transform to notification format
    const notifications = completedActivities?.map((activity: any) => {
      // Use the childid we added from schedule mapping
      const activityChildId = activity.childid
      const child = children!.find((c: any) => c.childid === activityChildId)
      const childName = child?.full_name || 'Học sinh'
      
      // Use end_time_stamp as completion time since updated_at doesn't exist
      const completedTime = activity.end_time_stamp 
        ? new Date(activity.end_time_stamp).toLocaleString('vi-VN')
        : 'Không xác định'

      return {
        id: `completed-${activity.schedule_activityid}`,
        type: 'activity_completed',
        title: '🎉 Hoàn thành bài học',
        message: `${childName} đã hoàn thành bài tập môn ${activity.subject}`,
        childName: childName,
        childId: activityChildId,
        subject: activity.subject,
        activityId: activity.schedule_activityid,
        completedAt: completedTime,
        startTime: activity.start_time_stamp 
          ? new Date(activity.start_time_stamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          : null,
        endTime: activity.end_time_stamp 
          ? new Date(activity.end_time_stamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          : null,
        metadata: {
          activityTitle: activity.subject,
          subject: activity.subject,
          completedAt: activity.end_time_stamp,
          childName: childName
        },
        created_at: activity.end_time_stamp || new Date().toISOString(),
        is_read: false
      }
    }) || []

    console.log(`📢 Generated ${notifications.length} completion notifications`)

    return NextResponse.json({ 
      success: true, 
      notifications,
      totalCompleted: notifications.length,
      parentId,
      childrenCount: children.length,
      debug: {
        childIds,
        activitiesFound: completedActivities.length
      }
    })

  } catch (error) {
    console.error('❌ Error generating completion notifications:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage,
      stack: errorStack 
    }, { status: 500 })
  }
}