import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    
    if (!parentId) {
      return NextResponse.json({ error: 'Parent ID is required' }, { status: 400 })
    }

    console.log('📋 Fetching action list for parent:', parentId)

    const supabase = createServerSupabaseClient()

    // Get all actions for this parent with full details
    const { data: actions, error } = await supabase
      .from('action')
      .select('*')
      .eq('parentid', parseInt(parentId))
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('❌ Error fetching actions:', error)
      return NextResponse.json({ 
        error: 'Error fetching actions',
        details: error.message 
      }, { status: 500 })
    }

    console.log('✅ Actions fetched:', actions?.length || 0)

    return NextResponse.json({ 
      success: true,
      actions: actions || []
    })

  } catch (error) {
    console.error('❌ Error in list actions API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage
    }, { status: 500 })
  }
}
