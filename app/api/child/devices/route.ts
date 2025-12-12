import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET - Fetch all devices for a child
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    
    if (!childId) {
      return NextResponse.json({ error: 'Child ID is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data: devices, error } = await supabase
      .from('devices')
      .select('*')
      .eq('child_id', parseInt(childId))
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching devices:', error)
      return NextResponse.json({ 
        error: 'Error fetching devices',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      devices: devices || []
    })

  } catch (error) {
    console.error('Error in GET devices API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage
    }, { status: 500 })
  }
}

// POST - Add a new device
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { childId, device_uid, device_name } = body
    
    if (!childId) {
      return NextResponse.json({ error: 'Child ID is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data: device, error } = await supabase
      .from('devices')
      .insert({
        child_id: parseInt(childId),
        device_uid: device_uid || '',
        device_name: device_name || 'Thiết bị mới',
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding device:', error)
      return NextResponse.json({ 
        error: 'Error adding device',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      device
    })

  } catch (error) {
    console.error('Error in POST devices API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage
    }, { status: 500 })
  }
}

// PUT - Update device
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, device_uid, device_name } = body
    
    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data: device, error } = await supabase
      .from('devices')
      .update({
        device_uid,
        device_name,
      })
      .eq('id', deviceId)
      .select()
      .single()

    if (error) {
      console.error('Error updating device:', error)
      return NextResponse.json({ 
        error: 'Error updating device',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      device
    })

  } catch (error) {
    console.error('Error in PUT devices API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage
    }, { status: 500 })
  }
}

// DELETE - Remove device
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')
    
    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('id', parseInt(deviceId))

    if (error) {
      console.error('Error deleting device:', error)
      return NextResponse.json({ 
        error: 'Error deleting device',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Device deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE devices API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage
    }, { status: 500 })
  }
}
