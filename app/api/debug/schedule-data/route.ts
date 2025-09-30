import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId') || '30'
    
    const supabase = createClient()
    
    console.log('🔍 Debug: Checking schedule data for child:', childId)
    
    const response: any = {
      childId,
      tables: {}
    }
    
    // Check schedule_activity table (the one from the screenshot)
    try {
      // Try different child ID formats
      const childIdFormats = [
        { field: 'childId', value: parseInt(childId), type: 'int' },
        { field: 'childId', value: childId, type: 'string' },
        { field: 'child_id', value: 'child-2', type: 'mapped' }
      ]
      
      for (const format of childIdFormats) {
        try {
          const { data, count, error } = await supabase
            .from('schedule_activity')
            .select('*', { count: 'exact' })
            .eq(format.field, format.value)
            .eq('status', 'completed')
          
          if (!error) {
            response.tables[`schedule_activity_${format.field}_${format.type}`] = {
              count: count || 0,
              totalRecords: data?.length || 0,
              sampleData: data?.slice(0, 3) || [],
              allIds: data?.map(d => d.schedule_activityid || d.id) || []
            }
            
            if (count && count > 0) {
              console.log(`✅ Found ${count} completed activities in schedule_activity with ${format.field}=${format.value}`)
            }
          } else {
            response.tables[`schedule_activity_${format.field}_${format.type}_error`] = error.message
          }
        } catch (e) {
          response.tables[`schedule_activity_${format.field}_${format.type}_exception`] = String(e)
        }
      }
      
      // Also try without child ID filter to see all completed activities
      try {
        const { data: allData, count: allCount, error: allError } = await supabase
          .from('schedule_activity')
          .select('*', { count: 'exact' })
          .eq('status', 'completed')
        
        if (!allError) {
          response.tables['schedule_activity_all_completed'] = {
            count: allCount || 0,
            totalRecords: allData?.length || 0,
            uniqueChildIds: [...new Set(allData?.map(d => d.childId) || [])],
            sampleData: allData?.slice(0, 5) || []
          }
        }
      } catch (e) {
        response.tables['schedule_activity_all_error'] = String(e)
      }
      
    } catch (e) {
      response.tables['schedule_activity_general_error'] = String(e)
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