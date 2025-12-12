import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET - Get all children for a specific parent
export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    console.log('🔍 Fetching children for parent:', parentId)

    if (!parentId) {
      return NextResponse.json({ error: 'Parent ID is required' }, { status: 400 })
    }

    // Try different column names for parent relationship
    let data = null
    let error = null
    
    // Try 1: parentid column
    const result1 = await supabase
      .from('child')
      .select('*')
      .eq('parentid', parentId)
      .order('childid', { ascending: true })
    
    if (result1.data && result1.data.length > 0) {
      data = result1.data
      console.log('✅ Found', data.length, 'children using parentid column')
    } else {
      // Try 2: parent_id column
      const result2 = await supabase
        .from('child')
        .select('*')
        .eq('parent_id', parentId)
        .order('childid', { ascending: true })
      
      if (result2.data && result2.data.length > 0) {
        data = result2.data
        console.log('✅ Found', data.length, 'children using parent_id column')
      } else {
        // Try 3: Check all children to see what's in database
        const result3 = await supabase
          .from('child')
          .select('childid, full_name, parentid, parent_id')
          .limit(5)
        
        console.log('🔍 Sample children in database:', result3.data)
        console.log('⚠️ No children found for parent', parentId)
        data = []
      }
      
      error = result2.error
    }

    if (error && !data) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 })
    }

    console.log('📊 Final result:', data?.length || 0, 'children for parent', parentId)

    // Convert database format to API format
    const children = data?.map(child => ({
      id: child.childid.toString(),
      parentId: child.parentid.toString(),
      name: child.full_name || `${child.first_name || ''} ${child.last_name || ''}`.trim(),
      email: child.email,
      age: child.age || 8,
      grade: child.grade || 'Lớp 3',
      avatar: "/child-avatar.png",
      deviceId: `device-${child.childid}`,
      settings: {
        focusGoalMinutes: 90,
        breakReminderInterval: 25,
        lowFocusThreshold: 35,
        subjects: ["Toán", "Văn", "Tiếng Anh", "Khoa học"],
        schoolHours: {
          start: "07:45",
          end: "16:15",
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })) || []

    return NextResponse.json({ data: children })
  } catch (error) {
    console.error('💥 Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}