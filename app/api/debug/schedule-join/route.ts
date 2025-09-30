import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const response: any = {
      tables: {}
    }
    
    // Check schedule table structure
    try {
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedule')
        .select('*')
        .limit(5)
      
      if (!scheduleError) {
        response.tables['schedule_sample'] = {
          count: scheduleData?.length || 0,
          sampleData: scheduleData || [],
          columns: scheduleData?.[0] ? Object.keys(scheduleData[0]) : []
        }
      } else {
        response.tables['schedule_error'] = scheduleError.message
      }
    } catch (e) {
      response.tables['schedule_exception'] = String(e)
    }
    
    // Try to join schedule_activity with schedule to get child info
    try {
      const { data: joinData, error: joinError } = await supabase
        .from('schedule_activity')
        .select(`
          *,
          schedule (*)
        `)
        .eq('status', 'completed')
        .limit(10)
      
      if (!joinError) {
        response.tables['schedule_activity_with_schedule'] = {
          count: joinData?.length || 0,
          sampleData: joinData || []
        }
      } else {
        response.tables['schedule_activity_join_error'] = joinError.message
      }
    } catch (e) {
      response.tables['schedule_activity_join_exception'] = String(e)
    }
    
    return NextResponse.json(response, { status: 200 })
    
  } catch (error) {
    console.error('❌ Error in schedule debug API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}