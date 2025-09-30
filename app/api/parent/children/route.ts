import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Get all children for a specific parent
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    console.log('🔍 Fetching children for parent:', parentId)

    if (!parentId) {
      return NextResponse.json({ error: 'Parent ID is required' }, { status: 400 })
    }

    // Get children for this parent
    const { data, error } = await supabase
      .from('child')
      .select('*')
      .eq('parentid', parentId)
      .order('childid', { ascending: true })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 })
    }

    console.log('✅ Found', data?.length || 0, 'children for parent', parentId)

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