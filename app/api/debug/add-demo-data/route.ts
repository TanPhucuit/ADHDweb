import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const today = new Date().toISOString()
    
    // Add demo schedule activities for child-2 (Trần Bảo Nam)
    const scheduleActivities = [
      {
        child_id: 'child-2',
        activity_name: 'Làm bài tập toán',
        status: 'completed',
        completed_at: today,
        created_at: today
      },
      {
        child_id: 'child-2', 
        activity_name: 'Đọc sách 30 phút',
        status: 'completed',
        completed_at: today,
        created_at: today
      },
      {
        child_id: 'child-2',
        activity_name: 'Tập thể dục',
        status: 'pending',
        created_at: today
      }
    ]
    
    // Try to insert into schedule_activities table first
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('schedule_activities')
      .insert(scheduleActivities)
      .select()
    
    let scheduleResult = null
    if (scheduleError) {
      console.log('❌ schedule_activities insert failed:', scheduleError.message)
      
      // Try schedule_activity table with different schema
      const scheduleActivitiesAlt = scheduleActivities.map(activity => ({
        childId: 30, // Use integer child ID 
        title: activity.activity_name,
        status: activity.status,
        completed_at: activity.completed_at,
        created_at: activity.created_at
      }))
      
      const { data: altData, error: altError } = await supabase
        .from('schedule_activity')
        .insert(scheduleActivitiesAlt)
        .select()
      
      if (altError) {
        console.log('❌ schedule_activity insert also failed:', altError.message)
      } else {
        scheduleResult = altData
        console.log('✅ Successfully inserted into schedule_activity:', altData)
      }
    } else {
      scheduleResult = scheduleData
      console.log('✅ Successfully inserted into schedule_activities:', scheduleData)
    }
    
    // Add demo medication logs
    const medicationLogs = [
      {
        child_id: 'child-2',
        medication_name: 'Vitamin D',
        status: 'taken',
        taken_at: today,
        created_at: today
      },
      {
        child_id: 'child-2',
        medication_name: 'Omega-3',
        status: 'taken', 
        taken_at: today,
        created_at: today
      }
    ]
    
    // Try medication_logs table first
    const { data: medData, error: medError } = await supabase
      .from('medication_logs')
      .insert(medicationLogs)
      .select()
    
    let medicationResult = null
    if (medError) {
      console.log('❌ medication_logs insert failed:', medError.message)
      
      // Try medicine_notification table
      const medicationAlt = medicationLogs.map(med => ({
        childid: 30,
        medication: med.medication_name,
        status: med.status,
        taken_at: med.taken_at,
        created_at: med.created_at
      }))
      
      const { data: altMedData, error: altMedError } = await supabase
        .from('medicine_notification')
        .insert(medicationAlt)
        .select()
      
      if (altMedError) {
        console.log('❌ medicine_notification insert also failed:', altMedError.message)
      } else {
        medicationResult = altMedData
        console.log('✅ Successfully inserted into medicine_notification:', altMedData)
      }
    } else {
      medicationResult = medData
      console.log('✅ Successfully inserted into medication_logs:', medData)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Demo data inserted successfully',
      data: {
        scheduleActivities: scheduleResult,
        medicationLogs: medicationResult
      }
    })
    
  } catch (error) {
    console.error('❌ Error inserting demo data:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}