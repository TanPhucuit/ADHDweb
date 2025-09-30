import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    console.log('🔍 Testing database tables and data...')
    
    // Test 1: Check if we can connect to database
    const { data: testConnection, error: connectionError } = await supabase
      .from('child')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.log('❌ Database connection error:', connectionError)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: connectionError
      }, { status: 500 })
    }
    
    console.log('✅ Database connection successful')
    
    // Test 2: List all tables (this might fail, that's ok)
    console.log('🔍 Checking tables...')
    
    // Test 3: Check child table structure and data
    const { data: childData, error: childError } = await supabase
      .from('child')
      .select('*')
      .limit(5)
    
    console.log('Child table data:', childData)
    console.log('Child table error:', childError)
    
    // Test 4: Check if schedule_activity table exists
    const { data: activityData, error: activityError } = await supabase
      .from('schedule_activity')
      .select('*')
      .limit(5)
    
    console.log('Schedule_activity table data:', activityData)
    console.log('Schedule_activity table error:', activityError)
    
    // Test 5: Check for parent ID 23 specifically
    const { data: parent23Children, error: parent23Error } = await supabase
      .from('child')
      .select('*')
      .eq('parentid', 23)
    
    console.log('Parent 23 children:', parent23Children)
    console.log('Parent 23 error:', parent23Error)
    
    // Test 6: Try different parent column name
    const { data: parent23ChildrenAlt, error: parent23ErrorAlt } = await supabase
      .from('child')
      .select('*')
      .eq('parent_id', 23)
    
    console.log('Parent 23 children (parent_id):', parent23ChildrenAlt)
    console.log('Parent 23 error (parent_id):', parent23ErrorAlt)
    
    // Test 7: Get all children regardless of parent
    const { data: allChildren, error: allChildrenError } = await supabase
      .from('child')
      .select('*')
      .limit(10)
    
    console.log('All children:', allChildren)
    console.log('All children error:', allChildrenError)
    
    // Test 8: Check schedule table structure
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('schedule')
      .select('*')
      .limit(5)
    
    console.log('Schedule table data:', scheduleData)
    console.log('Schedule table error:', scheduleError)
    
    // Test 9: Check specific scheduleid from activity
    const firstActivity = activityData?.[0]
    let scheduleForActivity = null
    let scheduleForActivityError = null
    
    if (firstActivity?.scheduleid) {
      const result = await supabase
        .from('schedule')
        .select('*')
        .eq('scheduleid', firstActivity.scheduleid)
      
      scheduleForActivity = result.data
      scheduleForActivityError = result.error
      
      console.log(`Schedule for activity ${firstActivity.scheduleid}:`, scheduleForActivity)
      console.log(`Schedule error:`, scheduleForActivityError)
    }
    
    return NextResponse.json({
      success: true,
      tests: {
        connection: !connectionError,
        childData: {
          data: childData,
          error: childError,
          count: childData?.length || 0
        },
        activityData: {
          data: activityData,
          error: activityError,
          count: activityData?.length || 0
        },
        scheduleData: {
          data: scheduleData,
          error: scheduleError,
          count: scheduleData?.length || 0
        },
        scheduleForActivity: firstActivity?.scheduleid ? {
          scheduleid: firstActivity.scheduleid,
          data: scheduleForActivity,
          error: scheduleForActivityError
        } : null,
        parent23: {
          parentid: {
            data: parent23Children,
            error: parent23Error,
            count: parent23Children?.length || 0
          },
          parent_id: {
            data: parent23ChildrenAlt,
            error: parent23ErrorAlt,
            count: parent23ChildrenAlt?.length || 0
          }
        },
        allChildren: {
          data: allChildren,
          error: allChildrenError,
          count: allChildren?.length || 0
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Test API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({
      error: 'Test failed',
      details: errorMessage
    }, { status: 500 })
  }
}