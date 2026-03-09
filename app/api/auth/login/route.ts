import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjvztaykgkxnefwsyqvd.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqdnp0YXlrZ2t4bmVmd3N5cXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNTczMjIsImV4cCI6MjA0NzgzMzMyMn0.Jj6Tiq-GCnfhftIBb39s9Cr5HaMO9pHh9FKsWr5Mii8'

const supabase = createClient(supabaseUrl, supabaseKey)

// ===== DEMO ACCOUNTS (Local, không cần Supabase) =====
const DEMO_ACCOUNTS: Record<string, { password: string; user: Record<string, any> }> = {
  'demo-child@adhd.local': {
    password: 'demo123',
    user: {
      id: 'demo-child-001',
      email: 'demo-child@adhd.local',
      name: 'Bé Demo',
      role: 'child',
      parentId: 'demo-parent-001',
      class: 'Lớp 5A',
      age: 10,
    },
  },
  'demo-parent@adhd.local': {
    password: 'demo123',
    user: {
      id: 'demo-parent-001',
      email: 'demo-parent@adhd.local',
      name: 'Phụ huynh Demo',
      role: 'parent',
      phone: '0123456789',
    },
  },
}

function getDemoUser(email: string, password: string, role: string) {
  const account = DEMO_ACCOUNTS[email]
  if (account && account.password === password && account.user.role === role) {
    return account.user
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    console.log('🔐 Login attempt for email:', email, 'role:', role)

    // Check demo accounts first (bypass Supabase)
    const demoUser = getDemoUser(email, password, role)
    if (demoUser) {
      console.log('✅ Demo login successful:', demoUser)
      return NextResponse.json({ success: true, user: demoUser })
    }

    if (role === 'child') {
      // Search only in child table
      console.log('🔍 Searching for child with email:', email)
      const { data: childData, error: childError } = await supabase
        .from('child')
        .select('childid, parentid, full_name, email, class, age, password')
        .eq('email', email)
        .single()

      console.log('👶 Child query result:', { childData, childError })

      if (childData && !childError) {
        console.log('👶 Found child user:', { ...childData, password: '***' })

        // Verify password from database
        if (childData.password && childData.password === password) {
          const user = {
            id: childData.childid,
            email: childData.email,
            name: childData.full_name,
            role: 'child',
            parentId: childData.parentid,
            class: childData.class,
            age: childData.age
          }

          console.log('✅ Child authentication successful:', user)
          return NextResponse.json({ success: true, user })
        } else {
          console.log('❌ Invalid password for child')
          return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
        }
      } else {
        console.log('❌ Child not found:', childError)
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      }
    } else if (role === 'parent') {
      // Search in parent table with multiple attempts
      console.log('🔍 Searching for parent with email:', email)

      // Try different table names
      const tableNames = ['parents', 'parent', 'parent_user', 'user_parent']
      let parentData = null
      let foundTable = null

      for (const tableName of tableNames) {
        try {
          console.log(`🔍 Trying table: ${tableName}`)
          const { data, error } = await supabase
            .from(tableName)
            .select('*') // Select all columns to see what's available
            .eq('email', email)
            .single()

          if (data && !error) {
            parentData = data
            foundTable = tableName
            console.log(`✅ Found parent in table ${tableName}:`, { ...data, password: data.password ? '***' : 'NO_PASSWORD' })
            break
          } else if (error) {
            console.log(`❌ Error querying ${tableName}:`, error.message)
          }
        } catch (e) {
          console.log(`❌ Exception querying ${tableName}:`, e)
        }
      }

      if (parentData && foundTable) {
        console.log('👨‍👩‍👧‍👦 Found parent user in table:', foundTable)

        // Try different password field names
        const possiblePasswordFields = ['password', 'mat_khau', 'pass', 'pwd']
        let passwordMatch = false
        let passwordField = null

        for (const field of possiblePasswordFields) {
          if (parentData[field] && parentData[field] === password) {
            passwordMatch = true
            passwordField = field
            break
          }
        }

        // For demo, also check hardcoded passwords
        if (!passwordMatch && (password === 'demo123' || password === 'matkhau123')) {
          passwordMatch = true
          passwordField = 'demo'
        }

        if (passwordMatch) {
          const user = {
            id: parentData.parent_id || parentData.parentid || parentData.id,
            email: parentData.email,
            name: parentData.full_name || parentData.name,
            role: 'parent',
            phone: parentData.phone
          }

          console.log('✅ Parent authentication successful:', user)
          return NextResponse.json({ success: true, user })
        } else {
          console.log('❌ Invalid password for parent. Available fields:', Object.keys(parentData))
          return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
        }
      } else {
        console.log('❌ Parent not found in any table. Tried:', tableNames)
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      }
    } else {
      console.log('❌ Invalid role specified')
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}