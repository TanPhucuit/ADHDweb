import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// No mock data - only use Supabase database

// GET - Get all medication logs from Supabase database ONLY
export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')

    console.log('🔍 Fetching medication logs from database for child:', childId)

    let query = supabase
      .from('medicine_notification')
      .select('*')
      .order('med_id', { ascending: false })

    if (childId) {
      // Use correct field name from database schema
      query = query.eq('childid', parseInt(childId))
    }

    const { data, error } = await query
    
    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 })
    }

    console.log('✅ Found', data?.length || 0, 'medication logs in database')

    // Convert database format to API format
    const medications = data?.map(item => {
      // Handle time field - it's in HH:MM:SS format, convert to today's date with that time
      let scheduledTime
      try {
        const today = new Date()
        const timeStr = item.time || '08:00:00'
        const [hours, minutes, seconds] = timeStr.split(':').map(Number)
        scheduledTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, seconds || 0)
      } catch (e) {
        // Fallback to current time if parsing fails
        scheduledTime = new Date()
      }

      return {
        id: item.med_id,
        childId: item.childid,
        medicationName: item.medicine_name,
        dosage: item.frequency || '1 viên', // Use frequency field as dosage info
        scheduledTime: scheduledTime.toISOString(),
        status: item.status,
        takenTime: item.status === 'taken' ? new Date().toISOString() : null,
        notes: item.note,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }) || []

    return NextResponse.json({ data: medications })
  } catch (error) {
    console.error('💥 Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create or update medication log in Supabase database ONLY
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  
  try {
    const body = await request.json()
    const { id, childId, medicationName, dosage, scheduledTime, status, takenTime, notes } = body

    console.log('💊 Processing medication log:', { id, childId, status })

    if (id) {
      // Update existing log in database
      const updateData: any = {}

      if (status) updateData.status = status
      if (notes) updateData.note = notes

      const { data, error } = await supabase
        .from('medicine_notification')
        .update(updateData)
        .eq('med_id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Database update error:', error)
        return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 })
      }

      console.log('✅ Medication log updated in database:', data.med_id)

      // Convert database format to API format
      let scheduledTime
      try {
        const today = new Date()
        const timeStr = data.time || '08:00:00'
        const [hours, minutes, seconds] = timeStr.split(':').map(Number)
        scheduledTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, seconds || 0)
      } catch (e) {
        scheduledTime = new Date()
      }

      const medication = {
        id: data.med_id,
        childId: data.childid,
        medicationName: data.medicine_name,
        dosage: data.frequency || '1 viên',
        scheduledTime: scheduledTime.toISOString(),
        status: data.status,
        takenTime: data.status === 'taken' ? new Date().toISOString() : null,
        notes: data.note,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      return NextResponse.json({ data: medication })
    } else {
      // For now, we don't support creating new medications since we don't know the full schema
      return NextResponse.json({ error: 'Creating new medications not supported yet' }, { status: 400 })
    }
  } catch (error) {
    console.error('💥 Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}