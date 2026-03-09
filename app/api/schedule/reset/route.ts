import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// POST - Reset all of a child's schedule activities to 'pending' (start of new day)
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  try {
    const { childId } = await request.json()
    if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

    // Find all schedule IDs for this child
    const { data: schedules, error: schedErr } = await supabase
      .from('schedule')
      .select('scheduleid')
      .eq('childid', parseInt(childId))

    if (schedErr) return NextResponse.json({ error: schedErr.message }, { status: 500 })
    if (!schedules || schedules.length === 0) {
      return NextResponse.json({ success: true, reset: 0 })
    }

    const scheduleIds = schedules.map(s => s.scheduleid)

    const { count, error } = await supabase
      .from('schedule_activity')
      .update({ status: 'pending' })
      .in('scheduleid', scheduleIds)
      .eq('status', 'completed')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, reset: count ?? 0 })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
