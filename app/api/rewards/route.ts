import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper functions to calculate rewards from database
const calculateRewardsFromDatabase = async (childId: string) => {
  console.log('🧮 Calculating rewards from database for child:', childId)
  
  // Get completed schedule activities from database
  const { data: scheduleActivities, error: scheduleError } = await supabase
    .from('schedule_activity')
    .select('*')
    .eq('scheduleid', childId)
    .eq('status', 'completed')

  if (scheduleError) {
    console.error('❌ Schedule activities query error:', scheduleError)
    throw scheduleError
  }

  // Get taken medications from database
  const { data: medicationLogs, error: medicationError } = await supabase
    .from('medicine_notification')
    .select('*')
    .eq('childid', childId)
    .eq('status', 'taken')

  if (medicationError) {
    console.error('❌ Medication logs query error:', medicationError)
    throw medicationError
  }

  const scheduleCount = scheduleActivities?.length || 0
  const medicationCount = medicationLogs?.length || 0
  
  console.log('📊 Database counts:', { scheduleCount, medicationCount })
  
  return {
    scheduleActivities: scheduleCount,
    scheduleStars: scheduleCount * 5,
    medicationLogs: medicationCount,
    medicationStars: medicationCount * 10,
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