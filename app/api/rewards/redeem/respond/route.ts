import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { encodeRewardResponse } from '@/lib/reward-catalog'
import { getVietnamTime } from '@/lib/vietnam-time'
import { rewardRequests } from '../route'

// POST: Parent approves or denies a reward redemption request
export async function POST(request: NextRequest) {
  try {
    const { childId, rewardId, rewardTitle, rewardStars, approved } = await request.json()

    if (!childId || !rewardId) {
      return NextResponse.json({ error: 'childId and rewardId required' }, { status: 400 })
    }

    // Update in-memory store
    const req = rewardRequests.find(
      r => r.childId === String(childId) && r.rewardId === String(rewardId) && r.status === 'pending'
    )
    if (req) {
      req.status = approved ? 'approved' : 'denied'
    }

    // Best-effort: also insert into action table to trigger child's Supabase realtime subscription
    try {
      const supabase = createServerSupabaseClient()
      const encoded = encodeRewardResponse(approved, rewardId, rewardStars ?? 0, rewardTitle ?? '')
      await supabase
        .from('action')
        .insert({
          childid: parseInt(childId),
          actiontype: encoded,
          action_label: 'dong-vien',
          timestamp: getVietnamTime(),
        })
    } catch (dbErr) {
      console.warn('Could not write reward response to action table (non-fatal):', dbErr)
    }

    return NextResponse.json({ success: true, approved })
  } catch (error) {
    console.error('Error in reward respond POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
