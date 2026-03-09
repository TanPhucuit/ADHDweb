import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// POST: Child submits a break request
export async function POST(request: NextRequest) {
  try {
    const { childId, parentId } = await request.json()

    if (!childId || !parentId) {
      return NextResponse.json({ error: 'childId and parentId required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('action')
      .insert({
        childid: parseInt(childId),
        parentid: parseInt(parentId),
        actiontype: 'break_request',
        action_label: 'nghi-giai-lao',
        timestamp: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting break request:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, requestId: data.actionid ?? data.id })
  } catch (error) {
    console.error('Error in break request POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: Parent polls for pending break requests (last 10 minutes)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    if (!parentId) {
      return NextResponse.json({ requests: [] })
    }

    const supabase = createServerSupabaseClient()
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('action')
      .select('*')
      .eq('parentid', parseInt(parentId))
      .eq('actiontype', 'break_request')
      .gte('timestamp', since)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Error fetching break requests:', error)
      return NextResponse.json({ requests: [] })
    }

    return NextResponse.json({ requests: data || [] })
  } catch (error) {
    console.error('Error in break request GET:', error)
    return NextResponse.json({ requests: [] })
  }
}
