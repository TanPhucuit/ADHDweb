import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getVietnamTime } from '@/lib/vietnam-time'

// GET - Get schedule activities for today only (or specific date via ?date=YYYY-MM-DD)
export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    const dateParam = searchParams.get('date') // YYYY-MM-DD, defaults to today

    // Calculate today's date range (Vietnam time)
    const targetDate = dateParam ? new Date(dateParam) : new Date()
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).toISOString()
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1).toISOString()

    console.log('🔍 Fetching TODAY schedule for child:', childId, 'date:', startOfDay.slice(0, 10))

    if (childId) {
      // Find schedules for this child, then get today's activities
      const { data: schedules, error: scheduleError } = await supabase
        .from('schedule')
        .select('scheduleid')
        .eq('childid', parseInt(childId))

      if (scheduleError) {
        console.error('❌ Schedule lookup error:', scheduleError)
        return NextResponse.json({ error: 'Schedule lookup error: ' + scheduleError.message }, { status: 500 })
      }

      if (!schedules || schedules.length === 0) {
        console.log('⚠️ No schedules found for child:', childId)
        return NextResponse.json({ data: [] })
      }

      const scheduleIds = schedules.map(s => s.scheduleid)

      const { data, error } = await supabase
        .from('schedule_activity')
        .select('*')
        .in('scheduleid', scheduleIds)
        .gte('start_time_stamp', startOfDay)
        .lt('start_time_stamp', endOfDay)
        .order('start_time_stamp', { ascending: true })

      if (error) {
        console.error('❌ Database error:', error)
        return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 })
      }

      console.log('✅ Found', data?.length || 0, 'schedule activities in database')

      // QUAN TRỌNG: Convert database format to API format
      // CHỈ sử dụng dữ liệu THỰC từ database, KHÔNG có mock data
      const activities = data?.map(item => {
        console.log('📋 Processing activity from DB:', {
          id: item.schedule_activityid,
          subject: item.subject,
          status: item.status,
          startTime: item.start_time_stamp,
          endTime: item.end_time_stamp
        })
        
        return {
          id: item.schedule_activityid,
          childId: childId, // Use original childId parameter
          subject: item.subject,
          title: item.subject, // Use subject as title since title doesn't exist
          description: '', // Description doesn't exist in schema
          startTime: new Date(item.start_time_stamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          endTime: new Date(item.end_time_stamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          status: item.status,
          completedAt: item.status === 'completed' ? getVietnamTime() : null,
          createdAt: getVietnamTime(),
          updatedAt: getVietnamTime()
        }
      }) || []

      console.log('✅ Returning', activities.length, 'activities - ALL FROM DATABASE, NO MOCK DATA')
      return NextResponse.json({ data: activities })
    } else {
      // Get all activities
      const { data, error } = await supabase
        .from('schedule_activity')
        .select('*')
        .order('schedule_activityid', { ascending: false })

      if (error) {
        console.error('❌ Database error:', error)
        return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 })
      }

      console.log('✅ Found', data?.length || 0, 'schedule activities in database')

      // Convert database format to API format
      const activities = data?.map(item => ({
        id: item.schedule_activityid,
        childId: item.scheduleid,
        subject: item.subject,
        title: item.subject,
        description: '',
        startTime: new Date(item.start_time_stamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(item.end_time_stamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        status: item.status,
        completedAt: item.status === 'completed' ? getVietnamTime() : null,
        createdAt: getVietnamTime(),
        updatedAt: getVietnamTime()
      })) || []

      return NextResponse.json({ data: activities })
    }
  } catch (error) {
    console.error('💥 Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create or update schedule activity in Supabase database ONLY
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  
  try {
    const body = await request.json()
    const { id, childId, subject, title, description, startTime, endTime, status, completedAt } = body

    console.log('📝 Processing schedule activity:', { id, childId, status })

    if (id) {
      // Update existing activity in database
      const updateData: any = {}

      if (status) updateData.status = status

      const { data, error } = await supabase
        .from('schedule_activity')
        .update(updateData)
        .eq('schedule_activityid', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Database update error:', error)
        return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 })
      }

      console.log('✅ Schedule activity updated in database:', data.schedule_activityid)

      // Convert database format to API format
      const activity = {
        id: data.schedule_activityid,
        childId: data.scheduleid,
        subject: data.subject,
        title: data.subject,
        description: '',
        startTime: new Date(data.start_time_stamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(data.end_time_stamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        status: data.status,
        completedAt: data.status === 'completed' ? getVietnamTime() : null,
        createdAt: getVietnamTime(),
        updatedAt: getVietnamTime()
      }

      return NextResponse.json({ data: activity })
    } else {
      // For now, we don't support creating new activities since we don't know the full schema
      return NextResponse.json({ error: 'Creating new activities not supported yet' }, { status: 400 })
    }
  } catch (error) {
    console.error('💥 Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}