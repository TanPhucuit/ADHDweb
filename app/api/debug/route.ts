import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    console.log('🔍 Checking database schema...')
    
    // Check schedule_activity schema
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('schedule_activity')
      .select('*')
      .limit(1)

    // Check medicine_notification schema  
    const { data: medicineData, error: medicineError } = await supabase
      .from('medicine_notification')
      .select('*')
      .limit(1)

    // Check child table schema
    const { data: childData, error: childError } = await supabase
      .from('child')
      .select('*')
      .limit(1)

    const result = {
      schedule_activity: {
        error: scheduleError,
        columns: scheduleData?.[0] ? Object.keys(scheduleData[0]) : [],
        sample: scheduleData?.[0] || null
      },
      medicine_notification: {
        error: medicineError,
        columns: medicineData?.[0] ? Object.keys(medicineData[0]) : [],
        sample: medicineData?.[0] || null
      },
      child: {
        error: childError,
        columns: childData?.[0] ? Object.keys(childData[0]) : [],
        sample: childData?.[0] || null
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({ error: 'Debug failed', details: error }, { status: 500 })
  }
}