import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { parentId, actionLabel, actionName, timestamp } = await request.json()
    
    if (!parentId || !actionLabel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const currentTimestamp = timestamp || new Date().toISOString()
    console.log('🎯 Recording parent action:', { parentId, actionLabel, actionName, timestamp: currentTimestamp })

    const supabase = createClient()

    try {
      console.log('🔍 Attempting insert with original label:', actionLabel)
      const { data, error } = await supabase
        .from('action')
        .insert({
          parentid: parseInt(parentId),
          action_label: actionLabel,
          timestamp: currentTimestamp
        })
        .select()
        .single()

      if (error) {
        console.log('❌ Original action label failed:', error.message)
        
        const fallbackMapping: { [key: string]: string } = {
          'nghi-ngoi': 'nghi-giai-lao',
          'khen-ngoi': 'khen-thuong', 
          'nhac-tap-trung': 'nhac-hoc',
          'dong-vien': 'co-vu',
          'kiem-tra-thoi-gian': 'xem-gio'
        }
        
        const fallbackLabel = fallbackMapping[actionLabel];
        if (fallbackLabel) {
          console.log('🔄 Trying fallback action label:', fallbackLabel)
          
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('action')
            .insert({
              parentid: parseInt(parentId),
              action_label: fallbackLabel,
              timestamp: currentTimestamp
            })
            .select()
            .single()
            
          if (fallbackError) {
            throw fallbackError;
          }
          
          console.log('✅ Fallback action recorded successfully')
          return NextResponse.json({
            success: true,
            message: `Đã ghi nhận hành động: ${actionName}`,
            action: { id: fallbackData?.id, parentId, actionLabel: fallbackLabel, actionName, timestamp: currentTimestamp }
          })
        } else {
          throw error;
        }
      } else {
        console.log('✅ Original action recorded successfully')
        return NextResponse.json({
          success: true,
          message: `Đã ghi nhận hành động: ${actionName}`,
          action: { id: data?.id, parentId, actionLabel, actionName, timestamp: currentTimestamp }
        })
      }
    } catch (insertError) {
      console.error('❌ Error recording action:', insertError)
      return NextResponse.json({ 
        error: 'Failed to record action',
        details: insertError instanceof Error ? insertError.message : 'Database constraint violation'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Error in parent actions API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
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
    const supabase = createClient()

    const { count: totalActions, error: totalError } = await supabase
      .from('action')
      .select('*', { count: 'exact', head: true })
      .eq('parentid', parseInt(parentId))

    if (totalError) {
      console.error('❌ Error fetching total actions:', totalError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: todayActions, error: todayError } = await supabase
      .from('action')
      .select('*', { count: 'exact', head: true })
      .eq('parentid', parseInt(parentId))
      .gte('timestamp', today.toISOString())

    if (todayError) {
      console.error('❌ Error fetching today actions:', todayError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('✅ Action counts fetched - Total:', totalActions, 'Today:', todayActions)

    return NextResponse.json({
      success: true,
      data: {
        totalActions: totalActions || 0,
        todayActions: todayActions || 0
      }
    })

  } catch (error) {
    console.error('❌ Error in parent actions GET API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}