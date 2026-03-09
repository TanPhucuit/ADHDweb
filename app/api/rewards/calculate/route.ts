import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// Child ID mapping - convert from internal child ID to database child_id
function getChildDataId(childId: string): string {
  const childMapping: { [key: string]: string } = {
    '30': 'child-2',  // Trần Bảo Nam
    '28': 'child-1',  // Other child if exists
    // Add more mappings as needed
  }
  return childMapping[childId] || childId
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    const parentId = searchParams.get('parentId')
    
    if (!childId) {
      return NextResponse.json({ error: 'Child ID is required' }, { status: 400 })
    }

    // Convert child ID to database format
    const dataChildId = getChildDataId(childId)
    console.log('🏆 Calculating reward points for child:', childId, '-> data child ID:', dataChildId)

    const supabase = createServerSupabaseClient()

    // 1. Count schedule_activity with status = completed using JOIN with schedule table
    let completedScheduleCount = 0
    let scheduleError = null
    
    console.log('🔍 Querying schedule data for child:', childId, 'using JOIN approach')
    
    try {
      const { data: scheduleData, count: scheduleCount, error: scheduleJoinError } = await supabase
        .from('schedule_activity')
        .select(`
          *,
          schedule!inner(childid)
        `, { count: 'exact' })
        .eq('status', 'completed')
        .eq('schedule.childid', parseInt(childId))
      
      if (!scheduleJoinError && scheduleCount !== null) {
        completedScheduleCount = scheduleCount
        console.log('✅ Found schedule_activity data with JOIN:', scheduleCount, 'activities for child:', childId)
        
        // Log some sample data for verification
        if (scheduleData && scheduleData.length > 0) {
          console.log('📋 Sample activities:', scheduleData.slice(0, 3).map(a => ({
            id: a.schedule_activityid,
            subject: a.subject,
            status: a.status,
            childid: a.schedule?.childid
          })))
        }
      } else if (scheduleJoinError) {
        console.log('❌ schedule_activity JOIN error:', scheduleJoinError.message)
        scheduleError = scheduleJoinError
      }
    } catch (e) {
      console.log('❌ schedule_activity JOIN exception:', e)
      scheduleError = e
    }

    if (scheduleError) {
      console.error('❌ Error fetching completed schedule activities:', scheduleError)
      // Don't return error, just set count to 0 and continue
      completedScheduleCount = 0
    }
    // 2. Count medication with status = taken with mapped child ID
    let takenMedicationCount = 0
    let medicationError = null
    
    console.log('🔍 Trying to query medication data for child:', childId, '-> mapped:', dataChildId)
    
    // Approach 1: Try medication_logs table with child_id field (from setup)
    try {
      const { count: count1, error: error1 } = await supabase
        .from('medication_logs')
        .select('*', { count: 'exact', head: true })
        .eq('child_id', dataChildId)
        .eq('status', 'taken')
      
      if (!error1 && count1 !== null) {
        takenMedicationCount = count1;
        console.log('✅ Found medication_logs data:', count1)
      } else if (error1) {
        console.log('❌ medication_logs error:', error1.message)
      }
    } catch (e) {
      console.log('❌ medication_logs exception:', e)
    }
    
    // Approach 2: Try medicine_notification table with childid field (from API)
    if (takenMedicationCount === 0) {
      try {
        const { count: count2, error: error2 } = await supabase
          .from('medicine_notification')
          .select('*', { count: 'exact', head: true })
          .eq('childid', parseInt(childId))
          .eq('status', 'taken')
        
        if (!error2 && count2 !== null) {
          takenMedicationCount = count2;
          console.log('✅ Found medicine_notification data (int childid):', count2)
        } else if (error2) {
          console.log('❌ medicine_notification (int) error:', error2.message)
        }
      } catch (e) {
        console.log('❌ medicine_notification (int) exception:', e)
      }
    }
    
    // Approach 3: Try medicine_notification with string childid
    if (takenMedicationCount === 0) {
      try {
        const { count: count3, error: error3 } = await supabase
          .from('medicine_notification')
          .select('*', { count: 'exact', head: true })
          .eq('childid', dataChildId)
          .eq('status', 'taken')
        
        if (!error3 && count3 !== null) {
          takenMedicationCount = count3;
          console.log('✅ Found medicine_notification data (string childid):', count3)
        } else if (error3) {
          console.log('❌ medicine_notification (string) error:', error3.message)
          medicationError = error3;
        }
      } catch (e) {
        console.log('❌ medicine_notification (string) exception:', e)
        medicationError = e;
      }
    }

    if (medicationError) {
      console.error('❌ Error fetching taken medications:', medicationError)
      // Don't return error, just set count to 0 and continue
      takenMedicationCount = 0;
    }

    // 3. Đếm số action có action_label là 'khen-ngoi' hoặc 'dong-vien' (original labels)
    let encouragementActionCount = 0
    if (parentId) {
      const { count: actionCount, error: actionError } = await supabase
        .from('action')
        .select('*', { count: 'exact', head: true })
        .eq('parentid', parseInt(parentId))
        .in('action_label', ['khen-ngoi', 'dong-vien'])

      if (actionError) {
        console.error('❌ Error fetching encouragement actions:', actionError)
        // Không return error, chỉ để count = 0
        encouragementActionCount = 0
      } else {
        encouragementActionCount = actionCount || 0
      }
    }

    // 4. Tính toán điểm sao theo công thức CHÍNH XÁC:
    // - schedule_activity completed: 5 sao mỗi hoạt động
    // - medication taken: 10 sao mỗi lần uống thuốc
    // - Không dùng demo data, chỉ dùng dữ liệu thực từ database
    
    const finalCompletedSchedule = completedScheduleCount || 0
    const finalTakenMedication = takenMedicationCount || 0
    const finalEncouragementActions = encouragementActionCount || 0
    
    // Công thức đúng:
    // schedule_activity: 5 sao mỗi hoạt động hoàn thành
    // medication: 10 sao mỗi lần uống thuốc
    // encouragement: 5 sao mỗi lần được khen/động viên (bonus)
    const scheduleStars = finalCompletedSchedule * 5
    const medicationStars = finalTakenMedication * 10
    const encouragementStars = finalEncouragementActions * 5
    const totalStars = scheduleStars + medicationStars + encouragementStars

    console.log('📊 Final calculation results:', {
      originalChildId: childId,
      mappedChildId: dataChildId,
      completedScheduleCount: finalCompletedSchedule,
      takenMedicationCount: finalTakenMedication,
      encouragementActionCount: finalEncouragementActions,
      scheduleStars,
      medicationStars,
      encouragementStars,
      totalStars
    })

    return NextResponse.json({
      totalStars,
      breakdown: {
        scheduleStars,
        medicationStars,
        encouragementStars,
        completedScheduleCount: finalCompletedSchedule,
        takenMedicationCount: finalTakenMedication,
        encouragementActionCount: finalEncouragementActions
      }
    })

  } catch (error) {
    console.error('❌ Error calculating rewards:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}