import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    
    if (!childId) {
      return NextResponse.json({ error: 'Child ID is required' }, { status: 400 })
    }

    console.log('📋 Fetching parent actions for child:', childId)

    const supabase = createClient()

    // Lấy parentId từ childId
    const { data: child, error: childError } = await supabase
      .from('child')
      .select('parentid')
      .eq('childid', parseInt(childId))
      .single()

    if (childError || !child) {
      console.error('❌ Error fetching child:', childError)
      return NextResponse.json({ 
        error: 'Child not found',
        details: childError?.message 
      }, { status: 404 })
    }

    // Lấy TẤT CẢ các actions của parent này (không giới hạn ngày)
    const { data: actions, error: actionsError } = await supabase
      .from('action')
      .select('*')
      .eq('parentid', child.parentid)
      .order('timestamp', { ascending: false })
      .limit(100) // Giới hạn 100 actions gần nhất

    if (actionsError) {
      console.error('❌ Error fetching actions:', actionsError)
      return NextResponse.json({ 
        error: 'Error fetching actions',
        details: actionsError.message 
      }, { status: 500 })
    }

    // Transform action_label thành message thân thiện (sử dụng original labels)
    const actionMessages: { [key: string]: string } = {
      'nhac-tap-trung': 'nhắc con tập trung',
      'dong-vien': 'động viên con',
      'nghi-ngoi': 'nhắc con nghỉ ngơi',
      'khen-ngoi': 'khen ngợi con',
      'kiem-tra-thoi-gian': 'nhắc con kiểm tra thời gian'
    }

    const notifications = actions.map(action => ({
      id: action.actionid,
      message: `Ba mẹ vừa ${actionMessages[action.action_label] || action.action_label}`,
      timestamp: action.timestamp,
      type: 'parent_action',
      action_label: action.action_label
    }))

    console.log('✅ Found', notifications.length, 'parent actions for child', childId)

    return NextResponse.json({ 
      success: true,
      notifications,
      count: notifications.length
    })

  } catch (error) {
    console.error('❌ Error in child parent-actions API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage
    }, { status: 500 })
  }
}