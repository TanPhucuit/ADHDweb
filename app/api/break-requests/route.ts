import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { childId, childName, parentId, duration = 5 } = await request.json()
    
    console.log('💤 Recording break request as action for child:', childId, 'parent:', parentId)

    const supabase = createServerSupabaseClient()

    // Record break request as a special action type
    const { data, error } = await supabase
      .from('action')
      .insert([{
        parentid: parseInt(parentId),
        action_label: 'nghi-ngoi', // Use 'nghi-ngoi' for break requests
        timestamp: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Database error creating break action:', error)
      return NextResponse.json({ 
        error: 'Failed to record break request',
        details: error.message 
      }, { status: 500 })
    }

    console.log('✅ Break request recorded as action:', data)

    return NextResponse.json({ 
      success: true, 
      breakRequest: data,
      message: `Break request recorded for ${childName}` 
    })

  } catch (error) {
    console.error('❌ Error recording break request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    const childId = searchParams.get('childId')
    
    console.log('📋 Fetching break requests from database for parent:', parentId, 'child:', childId)

    const supabase = createServerSupabaseClient()

    // First check if table exists and get all data for debugging
    const { data: allData, error: allError } = await supabase
      .from('break_requests')
      .select('*')
      .limit(5)

    if (allError) {
      console.error('❌ Database error (table check):', allError)
      // Return empty data instead of error for now
      return NextResponse.json({ 
        success: true, 
        breakRequests: [],
        total: 0,
        debug: { error: allError.message }
      })
    }

    console.log('📊 Sample break requests data:', allData)

    let query = supabase
      .from('break_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (parentId) {
      query = query.eq('parent_id', parentId)
    }

    if (childId) {
      query = query.eq('child_id', childId)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Database error fetching break requests:', error)
      // Return empty instead of error
      return NextResponse.json({ 
        success: true, 
        breakRequests: [],
        total: 0,
        debug: { error: error.message }
      })
    }

    console.log(`✅ Found ${data?.length || 0} break requests in database`)

    return NextResponse.json({ 
      success: true, 
      breakRequests: data || [],
      total: data?.length || 0
    })

  } catch (error) {
    console.error('❌ Error fetching break requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { breakId, status } = await request.json()
    
    console.log('🔄 Updating break request in database:', breakId, 'status:', status)

    const { data, error } = await supabase
      .from('break_requests')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', breakId)
      .select()
      .single()

    if (error) {
      console.error('❌ Database error updating break request:', error)
      return NextResponse.json({ error: 'Break request not found or update failed' }, { status: 404 })
    }

    console.log('✅ Break request updated in database')

    return NextResponse.json({ 
      success: true, 
      breakRequest: data
    })

  } catch (error) {
    console.error('❌ Error updating break request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}