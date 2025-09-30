import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjvztaykgkxnefwsyqvd.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqdnp0YXlrZ2t4bmVmd3N5cXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNTczMjIsImV4cCI6MjA0NzgzMzMyMn0.Jj6Tiq-GCnfhftIBb39s9Cr5HaMO9pHh9FKsWr5Mii8'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { childId, childName, parentId, duration = 5, timestamp } = await request.json()
    
    // Sử dụng timestamp từ client hoặc timestamp hiện tại
    const requestTimestamp = timestamp || new Date().toISOString()
    
    console.log('💤 Recording break request in database for child:', childId, 'parent:', parentId, 'at:', requestTimestamp)

    // Insert break request into database
    const { data, error } = await supabase
      .from('break_requests')
      .insert([{
        child_id: childId,
        child_name: childName,
        parent_id: parentId,
        duration,
        status: 'active',
        created_at: requestTimestamp,
        updated_at: requestTimestamp
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Database error creating break request:', error)
      return NextResponse.json({ error: 'Failed to record break request' }, { status: 500 })
    }

    console.log('✅ Break request recorded in database:', data)

    return NextResponse.json({ 
      success: true, 
      breakRequest: data,
      message: `Break request recorded for ${childName} at ${new Date(requestTimestamp).toLocaleTimeString('vi-VN')}` 
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
      return NextResponse.json({ error: 'Failed to fetch break requests' }, { status: 500 })
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