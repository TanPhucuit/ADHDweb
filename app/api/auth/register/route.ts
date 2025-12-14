import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}

// POST - Register new user (parent or child)
export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()
  
  try {
    const body = await request.json()
    const { role, name, email, password, age, gender, parentName, parentEmail, device1Uid, device2Uid } = body

    console.log('📝 Register request:', { role, name, email })

    if (!role || !name || !email || !password) {
      return NextResponse.json({ 
        error: 'Thiếu thông tin bắt buộc' 
      }, { status: 400 })
    }

    if (role === 'parent') {
      // Register as parent
      // Check if email already exists
      const { data: existingParent } = await supabase
        .from('parent')
        .select('email')
        .eq('email', email)
        .single()

      if (existingParent) {
        return NextResponse.json({ 
          error: 'Email đã được sử dụng' 
        }, { status: 400 })
      }

      // Insert new parent
      const { data: newParent, error: insertError } = await supabase
        .from('parent')
        .insert({
          full_name: name,
          email: email,
          password: password, // In production, hash this!
          phone_number: '' // Optional field
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Error creating parent:', insertError)
        return NextResponse.json({ 
          error: 'Không thể tạo tài khoản phụ huynh' 
        }, { status: 500 })
      }

      console.log('✅ Parent registered successfully:', email)

      return NextResponse.json({ 
        success: true,
        user: {
          id: newParent.parentid,
          email: newParent.email,
          name: newParent.full_name,
          role: 'parent'
        },
        message: 'Đăng ký phụ huynh thành công'
      })

    } else if (role === 'child') {
      // Register as child
      // Validate required child fields
      if (!age || !parentEmail) {
        return NextResponse.json({ 
          error: 'Thiếu thông tin trẻ (tuổi, email phụ huynh)' 
        }, { status: 400 })
      }

      // Check if email already exists
      const { data: existingChild } = await supabase
        .from('child')
        .select('email')
        .eq('email', email)
        .single()

      if (existingChild) {
        return NextResponse.json({ 
          error: 'Email đã được sử dụng' 
        }, { status: 400 })
      }

      // Find parent by email
      const { data: parent } = await supabase
        .from('parent')
        .select('parentid')
        .eq('email', parentEmail)
        .single()

      if (!parent) {
        return NextResponse.json({ 
          error: 'Không tìm thấy phụ huynh với email này' 
        }, { status: 400 })
      }

      // Insert new child
      const { data: newChild, error: insertError } = await supabase
        .from('child')
        .insert({
          full_name: name,
          email: email,
          password: password, // In production, hash this!
          age: parseInt(age),
          parentid: parent.parentid,
          class: '' // Optional field, gender not in schema
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Error creating child:', insertError)
        return NextResponse.json({ 
          error: 'Không thể tạo tài khoản trẻ' 
        }, { status: 500 })
      }

      console.log('✅ Child registered successfully:', email)

      // Create devices if UIDs provided
      const devices = []
      if (device1Uid) {
        const { data: device1, error: device1Error } = await supabase
          .from('smartwatch')
          .insert({
            deviceid: device1Uid, // Use provided UID as deviceid
            childid: newChild.childid,
            bpm: null,
            ring_status: 0
          })
          .select()
          .single()

        if (!device1Error && device1) {
          devices.push({ ...device1, device_type: 'smartwatch' })
          console.log('✅ SmartWatch created:', device1Uid)
        } else {
          console.error('❌ Error creating smartwatch:', device1Error)
        }
      }

      if (device2Uid) {
        const { data: device2, error: device2Error } = await supabase
          .from('smartcamera')
          .insert({
            deviceid: device2Uid,
            childid: newChild.childid,
            liveid: ''
          })
          .select()
          .single()

        if (!device2Error && device2) {
          devices.push({ ...device2, device_type: 'smartcamera' })
          console.log('✅ SmartCamera created:', device2Uid)
        } else {
          console.error('❌ Error creating smartcamera:', device2Error)
        }
      }

      return NextResponse.json({ 
        success: true,
        user: {
          id: newChild.childid,
          email: newChild.email,
          name: newChild.full_name,
          role: 'child',
          age: newChild.age,
          parentId: newChild.parentid
        },
        devices: devices,
        message: 'Đăng ký trẻ thành công'
      })

    } else {
      return NextResponse.json({ 
        error: 'Vai trò không hợp lệ' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Registration error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({ 
      error: 'Lỗi server', 
      details: errorMessage
    }, { status: 500 })
  }
}
