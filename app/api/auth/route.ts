import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Authenticate user with database (both parent and child)
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🔐 Authenticating user:', email)
    console.log('🔧 Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL
    })

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // First try to authenticate as child
    console.log('📊 Querying child table with:', { email, password })
    const { data: childUsers, error: childError } = await supabase
      .from('child')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .limit(1)

    console.log('📊 Child query result:', { childUsers, childError })

    if (childUsers && childUsers.length > 0) {
      const user = childUsers[0]
      console.log('✅ Child authentication successful for:', email, 'User ID:', user.childid)

      const userData = {
        id: user.childid.toString(),
        email: user.email,
        firstName: user.first_name || user.full_name?.split(' ')[0] || 'Child',
        lastName: user.last_name || user.full_name?.split(' ').slice(1).join(' ') || '',
        name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        role: 'child',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      return NextResponse.json({ 
        success: true, 
        user: userData,
        message: 'Child authentication successful' 
      })
    }

    // If not found in child table, try parent table
    console.log('📊 Querying parent table with:', { email, password })
    const { data: parentUsers, error: parentError } = await supabase
      .from('parent')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .limit(1)

    console.log('📊 Parent query result:', { parentUsers, parentError })

    if (parentError) {
      console.error('❌ Database error during parent authentication:', parentError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
    }

    if (parentUsers && parentUsers.length > 0) {
      const user = parentUsers[0]
      console.log('✅ Parent authentication successful for:', email, 'User ID:', user.parentid)

      const userData = {
        id: user.parentid.toString(),
        email: user.email,
        firstName: user.first_name || user.full_name?.split(' ')[0] || 'Parent',
        lastName: user.last_name || user.full_name?.split(' ').slice(1).join(' ') || '',
        name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        role: 'parent',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      return NextResponse.json({ 
        success: true, 
        user: userData,
        message: 'Parent authentication successful' 
      })
    }

    // If not found in either table
    console.log('❌ Invalid credentials for:', email)
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

  } catch (error) {
    console.error('❌ Authentication error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}