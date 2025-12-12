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

    // Get today's date range (Vietnam timezone GMT+7)
    const today = new Date()
    // Set to Vietnam timezone
    const vietnamOffset = 7 * 60 // GMT+7 in minutes
    const localOffset = today.getTimezoneOffset()
    const vietnamTime = new Date(today.getTime() + (vietnamOffset + localOffset) * 60 * 1000)
    
    const startOfDay = new Date(vietnamTime.getFullYear(), vietnamTime.getMonth(), vietnamTime.getDate())
    const endOfDay = new Date(vietnamTime.getFullYear(), vietnamTime.getMonth(), vietnamTime.getDate() + 1)
    
    console.log('📅 Date range:', {
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
      vietnamTime: vietnamTime.toISOString()
    })

    // 1. Get average heart rate (BPM) from result table
    console.log('📊 Fetching heart rate for child:', childId)
    
    // IMPORTANT: Query by device_id, not child_id
    // Get devices for this child first
    const { data: devices } = await supabase
      .from('devices')
      .select('id')
      .eq('child_id', parseInt(childId))
    
    const deviceIds = devices?.map(d => d.id) || []
    console.log('📱 Found devices for child:', deviceIds)
    
    let heartRateData = null
    if (deviceIds.length > 0) {
      heartRateData = await supabase
        .from('result')
        .select('bpm')
        .in('device_id', deviceIds)
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
    
    let restlessnessData = null
    if (deviceIds.length > 0) {
      restlessnessData = await supabase
        .from('result')
        .select('restlessness_rate')
        .in('device_id', deviceIds)
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

    // 3. Get total focus time from result table (focus_time column)
    console.log('📊 Fetching focus time for child:', childId)
    
    let focusTimeData = null
    if (deviceIds.length > 0) {
      focusTimeData = await supabase
        .from('result')
        .select('focus_time')
        .in('device_id', deviceIds)
        .gte('created_at', startOfDay.toISOString())
        .lt('created_at', endOfDay.toISOString())
        .not('focus_time', 'is', null)
        .then(res => res.data)
    }

    let focusTimeToday = 0
    if (focusTimeData && focusTimeData.length > 0) {
      // Get the most recent focus_time value
      focusTimeToday = focusTimeData[focusTimeData.length - 1]?.focus_time || 0
      console.log('⏱️ Focus time records:', focusTimeData.length, 'Most recent:', focusTimeToday, 'mins')
    } else {
      console.log('⚠️ No focus time data found')
    }

    // If no data found, use demo data to show UI works
    const hasData = averageHeartRate > 0 || fidgetLevel > 0 || focusTimeToday > 0
    
    if (!hasData) {
      console.log('⚠️ No real data found, using demo data to demonstrate features')
      return NextResponse.json({ 
        success: true,
        metrics: {
          averageHeartRate: 78, // Demo BPM
          fidgetLevel: 35, // Demo restlessness %
          focusTimeToday: 45, // Demo minutes
        },
        isDemo: true
      })
    }
    
    console.log('✅ Metrics fetched (real data):', { 
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
      },
      isDemo: false
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
