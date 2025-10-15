import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET - Get camera live link for a child
export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')

    if (!childId) {
      return NextResponse.json({ error: 'childId is required' }, { status: 400 })
    }

    console.log('📹 Fetching camera live link for child:', childId)

    // Get the liveid from smartcamera table
    const { data: cameraData, error: cameraError } = await supabase
      .from('smartcamera')
      .select('liveid')
      .eq('childid', childId)
      .single()

    if (cameraError) {
      console.error('❌ Error fetching camera data:', cameraError)
      return NextResponse.json({ 
        data: { 
          childId, 
          liveLink: null 
        } 
      })
    }

    console.log('📹 Camera data found:', cameraData)

    return NextResponse.json({
      data: {
        childId,
        liveLink: cameraData?.liveid || null
      }
    })

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}