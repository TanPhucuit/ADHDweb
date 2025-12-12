import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    
    if (!childId) {
      return NextResponse.json({ error: 'Child ID is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // 1. Get average heart rate (BPM) from result table
    console.log('📊 Fetching heart rate for child:', childId)
    
    // Try child_id first
    let heartRateData = await supabase
      .from('result')
      .select('bpm')
      .eq('child_id', parseInt(childId))
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString())
      .not('bpm', 'is', null)
      .then(res => res.data)
    
    // If no data, try childid column
    if (!heartRateData || heartRateData.length === 0) {
      heartRateData = await supabase
        .from('result')
        .select('bpm')
        .eq('childid', parseInt(childId))
        .gte('created_at', startOfDay.toISOString())
        .lt('created_at', endOfDay.toISOString())
        .not('bpm', 'is', null)
        .then(res => res.data)
    }

    let averageHeartRate = 0
    if (heartRateData && heartRateData.length > 0) {
      const totalBpm = heartRateData.reduce((sum, item) => sum + (item.bpm || 0), 0)
      averageHeartRate = Math.round(totalBpm / heartRateData.length)
      console.log('💓 Heart rate data points:', heartRateData.length, 'Average:', averageHeartRate)
    } else {
      console.log('⚠️ No heart rate data found')
    }

    // 2. Get average restlessness rate from result table
    console.log('📊 Fetching restlessness for child:', childId)
    
    // Try child_id first
    let restlessnessData = await supabase
      .from('result')
      .select('restlessness_rate')
      .eq('child_id', parseInt(childId))
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString())
      .not('restlessness_rate', 'is', null)
      .then(res => res.data)
    
    // If no data, try childid column
    if (!restlessnessData || restlessnessData.length === 0) {
      restlessnessData = await supabase
        .from('result')
        .select('restlessness_rate')
        .eq('childid', parseInt(childId))
        .gte('created_at', startOfDay.toISOString())
        .lt('created_at', endOfDay.toISOString())
        .not('restlessness_rate', 'is', null)
        .then(res => res.data)
    }

    let fidgetLevel = 0
    if (restlessnessData && restlessnessData.length > 0) {
      const totalRestlessness = restlessnessData.reduce((sum, item) => sum + (item.restlessness_rate || 0), 0)
      fidgetLevel = Math.round(totalRestlessness / restlessnessData.length)
      console.log('🔄 Restlessness data points:', restlessnessData.length, 'Average:', fidgetLevel)
    } else {
      console.log('⚠️ No restlessness data found')
    }

    // 3. Get total focus time from completed schedule_activity
    console.log('📊 Fetching completed activities for child:', childId)
    
    // Try child_id first
    let completedActivities = await supabase
      .from('schedule_activity')
      .select('start_time, end_time, completed_at')
      .eq('child_id', parseInt(childId))
      .eq('status', 'completed')
      .gte('completed_at', startOfDay.toISOString())
      .lt('completed_at', endOfDay.toISOString())
      .not('start_time', 'is', null)
      .not('end_time', 'is', null)
      .then(res => res.data)
    
    // If no data, try childid column
    if (!completedActivities || completedActivities.length === 0) {
      completedActivities = await supabase
        .from('schedule_activity')
        .select('start_time, end_time, completed_at')
        .eq('childid', parseInt(childId))
        .eq('status', 'completed')
        .gte('completed_at', startOfDay.toISOString())
        .lt('completed_at', endOfDay.toISOString())
        .not('start_time', 'is', null)
        .not('end_time', 'is', null)
        .then(res => res.data)
    }

    let focusTimeToday = 0
    if (completedActivities && completedActivities.length > 0) {
      completedActivities.forEach(activity => {
        const startTime = new Date(activity.start_time)
        const endTime = new Date(activity.end_time)
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
        focusTimeToday += durationMinutes
      })
      console.log('⏱️ Completed activities:', completedActivities.length, 'Total time:', focusTimeToday, 'mins')
    } else {
      console.log('⚠️ No completed activities found')
    }

    console.log('✅ Metrics fetched:', { 
      averageHeartRate, 
      fidgetLevel, 
      focusTimeToday,
      childId 
    })

    return NextResponse.json({ 
      success: true,
      metrics: {
        averageHeartRate,
        fidgetLevel,
        focusTimeToday,
      }
    })

  } catch (error) {
    console.error('❌ Error in metrics API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage
    }, { status: 500 })
  }
}
