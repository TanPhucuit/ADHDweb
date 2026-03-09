import { NextRequest, NextResponse } from 'next/server'
import { encodeRewardRequest, decodeRewardAction, isRewardRequest, isRewardApproved, isRewardDenied } from '@/lib/reward-catalog'

// In-memory store (same pattern as /api/notifications/route.ts)
interface RewardRequest {
  actionId: string
  childId: string
  rewardId: string
  rewardTitle: string
  rewardStars: number
  requestedAt: string
  status: 'pending' | 'approved' | 'denied'
}

const rewardRequests: RewardRequest[] = []

// POST: Child submits a reward redemption request
export async function POST(request: NextRequest) {
  try {
    const { childId, rewardId, rewardTitle, rewardStars } = await request.json()

    if (!childId || !rewardId) {
      return NextResponse.json({ error: 'childId and rewardId required' }, { status: 400 })
    }

    // Check for existing pending request for same reward
    const existing = rewardRequests.find(
      r => r.childId === String(childId) && r.rewardId === String(rewardId) && r.status === 'pending'
    )
    if (existing) {
      return NextResponse.json({ success: true, requestId: existing.actionId, alreadyPending: true })
    }

    const actionId = `reward-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newRequest: RewardRequest = {
      actionId,
      childId: String(childId),
      rewardId: String(rewardId),
      rewardTitle: rewardTitle ?? '',
      rewardStars: rewardStars ?? 0,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    }

    rewardRequests.push(newRequest)
    console.log('Reward request saved:', newRequest)
    console.log('Total reward requests in store:', rewardRequests.length)

    return NextResponse.json({ success: true, requestId: actionId })
  } catch (error) {
    console.error('Error in reward redeem POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET: Fetch pending reward requests for a child
// ?childId=X  — used by both child (own requests) and parent (selected child's requests)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')

    if (!childId) {
      return NextResponse.json({ requests: [] })
    }

    const pendingRequests = rewardRequests
      .filter(r => r.childId === String(childId) && r.status === 'pending')
      .map(r => ({
        actionId: r.actionId,
        childId: r.childId,
        rewardId: r.rewardId,
        rewardTitle: r.rewardTitle,
        rewardStars: r.rewardStars,
        requestedAt: r.requestedAt,
      }))

    return NextResponse.json({ requests: pendingRequests })
  } catch (error) {
    console.error('Error in reward redeem GET:', error)
    return NextResponse.json({ requests: [] })
  }
}

// Internal helper — exported for use by the respond route
export { rewardRequests }
export type { RewardRequest }
