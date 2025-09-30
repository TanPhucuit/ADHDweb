import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')

    if (!childId) {
      return NextResponse.json({ error: 'childId is required' }, { status: 400 })
    }

    console.log('🔍 Fetching parent for child:', childId)

    // Query the child table to get parent ID
    const { data, error } = await supabase
      .from('child')
      .select('parentid')
      .eq('childid', childId)
      .single()

    if (error) {
      console.error('❌ Error fetching child-parent relationship:', error)
      return NextResponse.json({ error: 'Failed to fetch parent info' }, { status: 500 })
    }

    if (!data) {
      console.log('⚠️ Child not found:', childId)
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    console.log('✅ Found parent ID:', data.parentid, 'for child:', childId)

    return NextResponse.json({
      childId,
      parentId: data.parentid.toString()
    })

  } catch (error) {
    console.error('❌ Error in child-parent API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}