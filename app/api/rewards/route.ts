import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// Helper functions to calculate rewards from database
const calculateRewardsFromDatabase = async (childId: string) => {
  const supabase = createServerSupabaseClient()
  console.log('🧮 Calculating rewards from database for child:', childId)
  
  // First, get all schedule IDs that belong to this child
  const { data: schedules, error: scheduleListError } = await supabase
    .from('schedule')
    .select('scheduleid')
    .eq('childid', childId)

  if (scheduleListError) {
    console.error('❌ Schedule list query error:', scheduleListError)
    console.log('⚠️ Continuing with 0 schedules due to error')
  }

  const scheduleIds = schedules?.map(s => s.scheduleid) || []
  console.log('📅 Found schedules for child', childId, ':', scheduleIds)

  // Now get completed activities for ALL schedules of this child
  let scheduleActivities = []
  if (scheduleIds.length > 0) {
    const { data: activities, error: scheduleError } = await supabase
      .from('schedule_activity')
      .select('*')
      .in('scheduleid', scheduleIds) // Use all schedule IDs
      .eq('status', 'completed')

    if (scheduleError) {
      console.error('❌ Schedule activities query error:', scheduleError)
      console.log('⚠️ Continuing with 0 schedule activities due to error')
    } else {
      scheduleActivities = activities || []
    }
  }

  // Get taken medications from database
  const { data: medicationLogs, error: medicationError } = await supabase
    .from('medicine_notification')
    .select('*')
    .eq('childid', childId)
    .eq('status', 'taken')

  if (medicationError) {
    console.error('❌ Medication logs query error:', medicationError)
    // Don't throw, continue with 0 count
    console.log('⚠️ Continuing with 0 medication logs due to error')
  }

  const scheduleCount = scheduleActivities?.length || 0
  const medicationCount = medicationLogs?.length || 0
  
  console.log('📊 Database counts for child', childId, ':')
  console.log('  - Schedules found:', scheduleIds.length)
  console.log('  - Completed activities:', scheduleCount)
  console.log('  - Taken medications:', medicationCount)
  console.log('  - Schedule activities:', scheduleActivities)
  
  // CÔNG THỨC ĐÚNG:
  // - schedule_activity completed: 5 sao mỗi hoạt động
  // - medication taken: 10 sao mỗi lần uống thuốc
  return {
    scheduleActivities: scheduleCount,
    scheduleStars: scheduleCount * 5, // 5 stars per completed schedule activity
    medicationLogs: medicationCount,
    medicationStars: medicationCount * 10, // 10 stars per taken medication
    totalStars: (scheduleCount * 5) + (medicationCount * 10)
  }
}

// GET - Get reward points for a child
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')

    if (!childId) {
      return NextResponse.json({ error: 'childId is required' }, { status: 400 })
    }

    // Calculate rewards from Supabase database ONLY
    const rewardData = await calculateRewardsFromDatabase(childId)
    
    console.log('🏆 Calculated rewards:', rewardData)

    return NextResponse.json({
      data: {
        childId,
        totalStars: rewardData.totalStars,
        breakdown: {
          scheduleActivities: rewardData.scheduleActivities,
          scheduleStars: rewardData.scheduleStars,
          medicationLogs: rewardData.medicationLogs,
          medicationStars: rewardData.medicationStars
        }
      }
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}