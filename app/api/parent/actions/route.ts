import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { parentId, actionLabel, actionName, timestamp } = body
    
    console.log('📥 Received action request:', { body, parentId, actionLabel, actionName, timestamp })
    
    if (!parentId || !actionLabel || !timestamp) {
      console.error('❌ Missing required fields:', { parentId, actionLabel, timestamp })
      return NextResponse.json({ 
        error: 'Missing required fields',
        received: { parentId: !!parentId, actionLabel: !!actionLabel, timestamp: !!timestamp }
      }, { status: 400 })
    }

    const pid = Number(parentId)
    if (!Number.isFinite(pid)) {
      return NextResponse.json({ error: 'Invalid parentId' }, { status: 400 })
    }

    const ts = new Date(timestamp)
    if (isNaN(ts.getTime())) {
      return NextResponse.json({ error: 'Invalid timestamp' }, { status: 400 })
    }

    // Use current Vietnam time directly since server is already in Asia/Saigon timezone
    const vietnamTime = new Date() // Server is already in GMT+7

    console.log('🎯 Recording parent action:', { 
      parentId: pid, 
      actionLabel, 
      currentVietnamTime: vietnamTime.toLocaleString('vi-VN'),
      timestampToSave: vietnamTime.toISOString()
    })

    const supabase = createServerSupabaseClient()

    const canonicalMap: Record<string, string> = {
      // Map tất cả các biến thể về 3 giá trị hợp lệ trong DB
      // Giá trị hợp lệ: 'nhac-tap-trung', 'khen-ngoi', 'dong-vien'
      'co-vu': 'dong-vien',
      'nhac-hoc': 'nhac-tap-trung',
      'nghi-giai-lao': 'dong-vien', // Map break to encouragement
      'nghi-ngoi': 'dong-vien', // Map rest to encouragement
      'khen-thuong': 'khen-ngoi',
      'xem-gio': 'nhac-tap-trung', // Map to reminder category
      'kiem-tra-thoi-gian': 'nhac-tap-trung' // Map time check to reminder
    }

    // Normalize action label before inserting
    const normalizedLabel = canonicalMap[actionLabel] || actionLabel
    
    console.log('🔄 Action label normalization:', { 
      original: actionLabel, 
      normalized: normalizedLabel 
    })

    const tryInsert = async (label: string) => {
      return await supabase
        .from('action')
        .insert({
          parentid: pid,
          action_label: label,
          timestamp: vietnamTime.toISOString(),
        })
        .select()
        .single()
    }

    // Use normalized label directly
    const { data: action, error: actionError } = await tryInsert(normalizedLabel)

    if (actionError) {
      console.error('❌ Error recording action:', actionError)
      return NextResponse.json({ 
        error: 'Error recording action',
        details: actionError.message 
      }, { status: 500 })
    }

    console.log('✅ Action recorded successfully:', action)

    // Create notification for parent when action is recorded
    try {
      // Use relative URL to work in both dev and production
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                      `http://localhost:${process.env.PORT || 3000}`)
      
      const notificationResponse = await fetch(`${baseUrl}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: pid.toString(),
          childId: 'system',
          type: 'parent_action_recorded',
          title: '✅ Hành động đã ghi nhận',
          message: `Đã ghi nhận hành động: ${actionName || actionLabel}`,
          metadata: { actionLabel: normalizedLabel, actionName }
        })
      })

      if (notificationResponse.ok) {
        console.log('📢 Notification created for parent action')
      }
    } catch (error) {
      console.log('⚠️ Failed to create notification:', error)
    }

    return NextResponse.json({ 
      success: true, 
      action,
      message: `Đã ghi nhận hành động: ${actionName || actionLabel}`
    })

  } catch (error) {
    console.error('❌ Error in parent actions API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    
    if (!parentId) {
      return NextResponse.json({ error: 'Parent ID is required' }, { status: 400 })
    }

    console.log('📊 Fetching action count for parent:', parentId)

    const supabase = createServerSupabaseClient()

    // Get total action count for this parent
    const { count: totalCount, error: totalCountError } = await supabase
      .from('action')
      .select('*', { count: 'exact', head: true })
      .eq('parentid', parseInt(parentId))

    if (totalCountError) {
      console.error('❌ Error fetching total action count:', totalCountError)
      return NextResponse.json({ 
        error: 'Error fetching total action count',
        details: totalCountError.message 
      }, { status: 500 })
    }

    // Get today's action count
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const { count: todayCount, error: todayCountError } = await supabase
      .from('action')
      .select('*', { count: 'exact', head: true })
      .eq('parentid', parseInt(parentId))
      .gte('timestamp', startOfDay.toISOString())
      .lt('timestamp', endOfDay.toISOString())

    if (todayCountError) {
      console.error('❌ Error fetching today action count:', todayCountError)
      return NextResponse.json({ 
        error: 'Error fetching today action count',
        details: todayCountError.message 
      }, { status: 500 })
    }

    console.log('✅ Action counts fetched - Total:', totalCount, 'Today:', todayCount)

    return NextResponse.json({ 
      success: true,
      totalActions: totalCount || 0,
      todayActions: todayCount || 0,
      parentId
    })

  } catch (error) {
    console.error('❌ Error in get actions API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage
    }, { status: 500 })
  }
}