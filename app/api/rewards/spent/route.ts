import { NextRequest, NextResponse } from 'next/server'
import { rewardRequests } from '../redeem/route'

// GET: Calculate total stars spent for a child (approved reward redemptions)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')

    if (!childId) {
      return NextResponse.json({ spent: 0 })
    }

    const spent = rewardRequests
      .filter(r => r.childId === String(childId) && r.status === 'approved')
      .reduce((sum, r) => sum + r.rewardStars, 0)

    return NextResponse.json({ spent })
  } catch (error) {
    console.error('Error in rewards spent GET:', error)
    return NextResponse.json({ spent: 0 })
  }
}
