import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId') || '30'
    
    const supabase = createClient()
    
    // Get today's date for filtering
    const today = new Date().toISOString().split('T')[0]
    console.log('🔍 Checking data for child:', childId, 'date:', today)
    
    const response: any = {
      childId,
      date: today,
      tables: {}
    }
    
    // Check all possible schedule tables
    const scheduleTables = [
      'schedule_activities',
      'schedule_activity'
    ]
    
    for (const table of scheduleTables) {
      try {
        // Try with child_id field
        const { data: data1, error: error1 } = await supabase
          .from(table)
          .select('*')
          .eq('child_id', 'child-2')
          .gte('created_at', today + 'T00:00:00')
          .lte('created_at', today + 'T23:59:59')
        
        if (!error1) {
          response.tables[`${table}_child_id`] = {
            count: data1?.length || 0,
            data: data1
          }
        }
        
        // Try with childId field (integer)
        const { data: data2, error: error2 } = await supabase
          .from(table)
          .select('*')
          .eq('childId', parseInt(childId))
          .gte('created_at', today + 'T00:00:00')
          .lte('created_at', today + 'T23:59:59')
        
        if (!error2) {
          response.tables[`${table}_childId_int`] = {
            count: data2?.length || 0,
            data: data2
          }
        }
        
        // Try with childId field (string)
        const { data: data3, error: error3 } = await supabase
          .from(table)
          .select('*')
          .eq('childId', 'child-2')
          .gte('created_at', today + 'T00:00:00')
          .lte('created_at', today + 'T23:59:59')
        
        if (!error3) {
          response.tables[`${table}_childId_string`] = {
            count: data3?.length || 0,
            data: data3
          }
        }
        
      } catch (e) {
        response.tables[`${table}_error`] = e
      }
    }
    
    // Check medication tables
    const medicationTables = [
      'medication_logs',
      'medicine_notification'
    ]
    
    for (const table of medicationTables) {
      try {
        // Try with child_id field
        const { data: data1, error: error1 } = await supabase
          .from(table)
          .select('*')
          .eq('child_id', 'child-2')
          .gte('created_at', today + 'T00:00:00')
          .lte('created_at', today + 'T23:59:59')
        
        if (!error1) {
          response.tables[`${table}_child_id`] = {
            count: data1?.length || 0,
            data: data1
          }
        }
        
        // Try with childid field (integer)
        const { data: data2, error: error2 } = await supabase
          .from(table)
          .select('*')
          .eq('childid', parseInt(childId))
          .gte('created_at', today + 'T00:00:00')
          .lte('created_at', today + 'T23:59:59')
        
        if (!error2) {
          response.tables[`${table}_childid_int`] = {
            count: data2?.length || 0,
            data: data2
          }
        }
        
        // Try with childid field (string) 
        const { data: data3, error: error3 } = await supabase
          .from(table)
          .select('*')
          .eq('childid', 'child-2')
          .gte('created_at', today + 'T00:00:00')
          .lte('created_at', today + 'T23:59:59')
        
        if (!error3) {
          response.tables[`${table}_childid_string`] = {
            count: data3?.length || 0,
            data: data3
          }
        }
        
      } catch (e) {
        response.tables[`${table}_error`] = e
      }
    }
    
    // Check action table
    try {
      const { data: actionData, error: actionError } = await supabase
        .from('action')
        .select('*')
        .eq('parentid', 23)
        .gte('created_at', today + 'T00:00:00')
        .lte('created_at', today + 'T23:59:59')
      
      if (!actionError) {
        response.tables['action_parentid_23'] = {
          count: actionData?.length || 0,
          data: actionData
        }
      }
    } catch (e) {
      response.tables['action_error'] = e
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Error in debug API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}