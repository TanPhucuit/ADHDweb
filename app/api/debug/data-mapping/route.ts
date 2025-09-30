import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    console.log('🔍 Checking child and data mapping...')
    
    const supabase = createClient()
    
    // Check children
    const { data: children, error: childError } = await supabase
      .from('child')
      .select('childid, full_name, parentid')
      .limit(10)

    // Check schedule_activities data
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('schedule_activities')
      .select('child_id, title, status')
      .limit(10)
      
    // Check medication_logs data  
    const { data: medicationData, error: medicationError } = await supabase
      .from('medication_logs')
      .select('child_id, medication_name, status')
      .limit(10)

    // Check action data
    const { data: actionData, error: actionError } = await supabase
      .from('action')
      .select('parentid, action_label')
      .limit(10)

    return NextResponse.json({
      children: children || [],
      childError: childError?.message || null,
      scheduleData: scheduleData || [],
      scheduleError: scheduleError?.message || null,
      medicationData: medicationData || [],
      medicationError: medicationError?.message || null,
      actionData: actionData || [],
      actionError: actionError?.message || null
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}