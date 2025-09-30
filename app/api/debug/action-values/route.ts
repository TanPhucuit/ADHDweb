import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    console.log('🔍 Checking action table values...')
    
    const supabase = createClient()
    
    // Get distinct action_label values
    const { data: actionData, error: actionError } = await supabase
      .from('action')
      .select('action_label')
      .limit(50)

    if (actionError) {
      console.log('❌ Error fetching action data:', actionError)
      return NextResponse.json({ 
        error: actionError.message,
        distinctValues: [],
        allValues: []
      })
    }

    const allValues = actionData?.map(r => r.action_label) || []
    const distinctValues = [...new Set(allValues)]

    console.log('📊 Action label values:', { distinctValues, total: allValues.length })

    return NextResponse.json({
      distinctValues,
      allValues,
      total: allValues.length,
      error: null
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      distinctValues: [],
      allValues: []
    }, { status: 500 })
  }
}