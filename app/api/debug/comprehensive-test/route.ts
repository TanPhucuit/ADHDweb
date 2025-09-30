import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    console.log('🔍 Debug: Comprehensive system test')
    
    const supabase = createClient()
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    }

    // Test 1: Check user authentication data
    console.log('\n1️⃣ Testing Auth Data...')
    try {
      // Check what users exist in system
      const { data: parents, error: parentError } = await supabase
        .from('parent')
        .select('parentid, full_name, email')
        .limit(5)
        
      const { data: children, error: childError } = await supabase
        .from('child')
        .select('childid, full_name, parentid, email')
        .limit(5)

      results.tests.auth = {
        parents: parents || [],
        children: children || [],
        parentError: parentError?.message || null,
        childError: childError?.message || null
      }
      
      console.log('👥 Parents in DB:', parents)
      console.log('👶 Children in DB:', children)
      
    } catch (e) {
      results.tests.auth = { error: e instanceof Error ? e.message : 'Unknown error' }
    }

    // Test 2: Check table schemas
    console.log('\n2️⃣ Testing Table Schemas...')
    const tables = ['schedule_activities', 'schedule_activity', 'medication_logs', 'medicine_notification', 'action']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
          
        results.tests[`table_${table}`] = {
          exists: !error,
          error: error?.message || null,
          sampleData: data?.[0] || null
        }
        
        console.log(`📋 ${table}:`, error ? `❌ ${error.message}` : `✅ Exists`)
        
      } catch (e) {
        results.tests[`table_${table}`] = {
          exists: false,
          error: e instanceof Error ? e.message : 'Unknown error'
        }
      }
    }

    // Test 3: Check data for specific child IDs
    console.log('\n3️⃣ Testing Child Data Mapping...')
    const testChildIds = ['30', 'child-2', '28', 'child-1']
    
    for (const childId of testChildIds) {
      try {
        results.tests[`child_${childId}_data`] = {}
        
        // Try schedule_activities
        const { count: scheduleCount1 } = await supabase
          .from('schedule_activities')
          .select('*', { count: 'exact', head: true })
          .eq('child_id', childId)
          
        // Try schedule_activity  
        const { count: scheduleCount2 } = await supabase
          .from('schedule_activity')
          .select('*', { count: 'exact', head: true })
          .eq('childId', parseInt(childId))
          .catch(() => ({ count: null }))
          
        // Try medication_logs
        const { count: medCount1 } = await supabase
          .from('medication_logs')
          .select('*', { count: 'exact', head: true })
          .eq('child_id', childId)
          
        // Try medicine_notification
        const { count: medCount2 } = await supabase
          .from('medicine_notification')
          .select('*', { count: 'exact', head: true })
          .eq('childid', parseInt(childId))
          .catch(() => ({ count: null }))
          
        results.tests[`child_${childId}_data`] = {
          schedule_activities: scheduleCount1 || 0,
          schedule_activity: scheduleCount2 || 0,
          medication_logs: medCount1 || 0,
          medicine_notification: medCount2 || 0
        }
        
        console.log(`👶 Child ${childId} data:`, results.tests[`child_${childId}_data`])
        
      } catch (e) {
        results.tests[`child_${childId}_data`] = {
          error: e instanceof Error ? e.message : 'Unknown error'
        }
      }
    }

    // Test 4: Check action constraints
    console.log('\n4️⃣ Testing Action Constraints...')
    try {
      const { data: existingActions } = await supabase
        .from('action')
        .select('action_label')
        .limit(10)
        
      const uniqueLabels = [...new Set(existingActions?.map(a => a.action_label) || [])]
      results.tests.action_constraints = {
        existing_labels: uniqueLabels,
        total_actions: existingActions?.length || 0
      }
      
      console.log('🎯 Existing action labels:', uniqueLabels)
      
    } catch (e) {
      results.tests.action_constraints = {
        error: e instanceof Error ? e.message : 'Unknown error'
      }
    }

    return NextResponse.json(results, { status: 200 })

  } catch (error) {
    console.error('❌ Debug API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}