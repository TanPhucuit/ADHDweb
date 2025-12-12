import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// GET - Fetch all devices for parent's children
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    
    if (!parentId) {
      return NextResponse.json({ error: 'Parent ID is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    console.log('🔍 Fetching children for parent:', parentId)
    
    // Get all children for this parent - try both column names
    let children = await supabase
      .from('child')
      .select('childid, full_name')
      .eq('parentid', parseInt(parentId))
      .then(res => res.data)
    
    // If no children found with parentid, try parent_id
    if (!children || children.length === 0) {
      children = await supabase
        .from('child')
        .select('childid, full_name')
        .eq('parent_id', parseInt(parentId))
        .then(res => res.data)
    }
    
    console.log('👶 Found children:', children?.length || 0)

    if (!children || children.length === 0) {
      return NextResponse.json({ 
        success: true,
        devices: []
      })
    }

    // Get all devices for these children from both smartwatch and smartcamera tables
    const childIds = children.map(c => c.childid)
    console.log('🔍 Looking for devices with child_ids:', childIds)
    
    // Query smartwatch table
    const { data: smartwatches, error: watchError } = await supabase
      .from('smartwatch')
      .select('*')
      .in('childid', childIds)
    
    if (watchError) {
      console.error('❌ Error fetching smartwatches:', watchError)
    }
    
    // Query smartcamera table  
    const { data: cameras, error: cameraError } = await supabase
      .from('smartcamera')
      .select('*')
      .in('childid', childIds)
    
    if (cameraError) {
      console.error('❌ Error fetching cameras:', cameraError)
    }
    
    console.log('📱 Smartwatches found:', smartwatches?.length || 0)
    console.log('📷 Cameras found:', cameras?.length || 0)
    
    // Combine devices from both tables
    const devices = [
      ...(smartwatches || []).map(w => ({
        id: w.deviceid,
        child_id: w.childid,
        device_uid: w.deviceid?.toString(),
        device_name: 'SmartWatch',
        device_type: 'smartwatch',
        bpm: w.bpm,
        ring_status: w.ring_status
      })),
      ...(cameras || []).map(c => ({
        id: c.deviceid,
        child_id: c.childid,
        device_uid: c.deviceid,
        device_name: 'SmartCamera',
        device_type: 'smartcamera',
        liveid: c.liveid
      }))
    ]
    
    console.log('📱 Total devices combined:', devices.length)

    // Combine devices with child names and ensure device_type is set
    const devicesWithChildNames = (devices || []).map(device => {
      // Try both child_id and childid columns
      const childId = device.child_id || device.childid
      const child = children.find(c => c.childid === childId)
      // Default to smartwatch if device_type is missing
      const deviceType = device.device_type || (
        device.device_name?.toLowerCase().includes('camera') ? 'smartcamera' : 'smartwatch'
      )
      return {
        ...device,
        childName: child?.full_name || 'Unknown',
        device_type: deviceType,
      }
    })

    console.log(`📱 Found ${devicesWithChildNames.length} devices:`, 
      devicesWithChildNames.map(d => `${d.device_name} (${d.device_type})`).join(', ')
    )

    return NextResponse.json({ 
      success: true,
      devices: devicesWithChildNames
    })

  } catch (error) {
    console.error('Error in GET parent devices API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage
    }, { status: 500 })
  }
}

// PUT - Update device (for parent to edit child's device)
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
    console.error('Error in PUT parent devices API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage
    }, { status: 500 })
  }
}
