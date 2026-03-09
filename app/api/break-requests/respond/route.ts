import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getVietnamTime } from '@/lib/vietnam-time'

// POST: Parent approves or denies a break request
export async function POST(request: NextRequest) {
  try {
    const { childId, approved } = await request.json()

    if (!childId) {
      return NextResponse.json({ error: 'childId required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const actiontype = approved ? 'break_approved' : 'break_denied'

    // Insert action targeting the child — triggers child's Supabase realtime subscription
    const { error } = await supabase
      .from('action')
      .insert({
        childid: parseInt(childId),
        actiontype,
        action_label: 'nghi-giai-lao',
        timestamp: getVietnamTime(),
      })

    if (error) {
      console.error('Error sending break response:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, actiontype })
  } catch (error) {
    console.error('Error in break respond POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
