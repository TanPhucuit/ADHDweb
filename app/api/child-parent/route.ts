import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjvztaykgkxnefwsyqvd.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqdnp0YXlrZ2t4bmVmd3N5cXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNTczMjIsImV4cCI6MjA0NzgzMzMyMn0.Jj6Tiq-GCnfhftIBb39s9Cr5HaMO9pHh9FKsWr5Mii8'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')

    if (!childId) {
      return NextResponse.json({ error: 'childId is required' }, { status: 400 })
    }

    console.log('🔍 Finding parent for child:', childId)

    // Query database to find parent ID for the given child ID
    const { data: childData, error } = await supabase
      .from('child')
      .select('parentid')
      .eq('childid', parseInt(childId))
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!childData || !childData.parentid) {
      console.log('❌ No parent found for child:', childId)
      return NextResponse.json({ error: 'Parent not found for this child' }, { status: 404 })
    }

    console.log('✅ Found parent ID:', childData.parentid, 'for child:', childId)

    return NextResponse.json({ 
      parentId: childData.parentid.toString()
    })

  } catch (error) {
    console.error('❌ Error in child-parent API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}