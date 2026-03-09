import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getVietnamTime } from '@/lib/vietnam-time'

function toScheduledTime(timeStr: string): Date {
  const today = new Date()
  const [h, m, s] = (timeStr || '08:00:00').split(':').map(Number)
  return new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m, s || 0)
}

function toApiFormat(item: any) {
  return {
    id: item.med_id,
    childId: item.childid,
    medicationName: item.medicine_name,
    dosage: item.frequency || '1 viên',
    scheduledTime: toScheduledTime(item.time).toISOString(),
    status: item.status,
    takenTime: item.status === 'taken' ? getVietnamTime() : null,
    notes: item.note,
    createdAt: getVietnamTime(),
    updatedAt: getVietnamTime(),
  }
}

// GET - list medications for a child
export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')

    let query = supabase
      .from('medicine_notification')
      .select('*')
      .order('time', { ascending: true })

    if (childId) {
      query = query.eq('childid', parseInt(childId))
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data: (data ?? []).map(toApiFormat) })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - create new medication OR update existing OR reset all to pending
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  try {
    const body = await request.json()
    const { id, childId, medicationName, dosage, time, notes, status, action } = body

    // --- Reset all medications for a child to pending (start of new day) ---
    if (action === 'reset_all' && childId) {
      const { error } = await supabase
        .from('medicine_notification')
        .update({ status: 'pending' })
        .eq('childid', parseInt(childId))
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, message: 'Đã đặt lại trạng thái thuốc cho ngày mới' })
    }

    // --- Update existing medication (mark taken / change status) ---
    if (id) {
      const updateData: any = {}
      if (status) updateData.status = status
      if (notes !== undefined) updateData.note = notes

      const { data, error } = await supabase
        .from('medicine_notification')
        .update(updateData)
        .eq('med_id', id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data: toApiFormat(data) })
    }

    // --- Create new medication ---
    if (!childId || !medicationName) {
      return NextResponse.json({ error: 'childId and medicationName required' }, { status: 400 })
    }

    const timeValue = time || '08:00:00'
    const { data, error } = await supabase
      .from('medicine_notification')
      .insert({
        childid: parseInt(childId),
        medicine_name: medicationName,
        frequency: dosage || '1 viên',
        time: timeValue,
        status: 'pending',
        note: notes || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: toApiFormat(data) }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - remove a medication
export async function DELETE(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { error } = await supabase
      .from('medicine_notification')
      .delete()
      .eq('med_id', parseInt(id))

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
