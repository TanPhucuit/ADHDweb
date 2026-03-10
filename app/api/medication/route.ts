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
    daysOfWeek: item.days_of_week || '0,1,2,3,4,5,6',
    session: item.session || 'morning',
    createdAt: getVietnamTime(),
    updatedAt: getVietnamTime(),
  }
}

function getTodayVN(): { date: string; dow: number } {
  // Vietnam time (UTC+7)
  const now = new Date()
  const vn = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  const date = vn.toISOString().slice(0, 10)
  const dow = vn.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  return { date, dow }
}

// GET - list medications for a child, filtered by today's day of week, auto-reset daily
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

    const all = data ?? []

    if (childId && all.length > 0) {
      const { date: todayDate, dow: todayDow } = getTodayVN()

      // Auto-reset medications where last_reset_date < today (new day started)
      const needsReset = all.filter(item =>
        item.last_reset_date !== todayDate && item.status === 'taken'
      )
      if (needsReset.length > 0) {
        await supabase
          .from('medicine_notification')
          .update({ status: 'pending', last_reset_date: todayDate })
          .in('med_id', needsReset.map((i: any) => i.med_id))
        // Patch in-memory so we don't need another fetch
        needsReset.forEach(item => {
          item.status = 'pending'
          item.last_reset_date = todayDate
        })
      }

      // Mark last_reset_date for meds that haven't been reset yet today (but status is already pending)
      const needsDateMark = all.filter(item => item.last_reset_date !== todayDate && item.status !== 'taken')
      if (needsDateMark.length > 0) {
        await supabase
          .from('medicine_notification')
          .update({ last_reset_date: todayDate })
          .in('med_id', needsDateMark.map((i: any) => i.med_id))
        needsDateMark.forEach(item => { item.last_reset_date = todayDate })
      }

      // Filter to only medications scheduled for today's day of week
      const todayMeds = all.filter(item => {
        const days = (item.days_of_week || '0,1,2,3,4,5,6').split(',').map(Number)
        return days.includes(todayDow)
      })

      return NextResponse.json({ data: todayMeds.map(toApiFormat) })
    }

    return NextResponse.json({ data: all.map(toApiFormat) })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - create new medication OR update existing OR reset all to pending
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  try {
    const body = await request.json()
    const { id, childId, medicationName, dosage, time, notes, status, action, daysOfWeek, session } = body

    // --- Reset all medications for a child to pending (start of new day) ---
    if (action === 'reset_all' && childId) {
      const { date: todayDate, dow: todayDow } = getTodayVN()
      const { error } = await supabase
        .from('medicine_notification')
        .update({ status: 'pending', last_reset_date: todayDate })
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

    const { date: todayDate } = getTodayVN()
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
        days_of_week: daysOfWeek || '0,1,2,3,4,5,6',
        session: session || 'morning',
        last_reset_date: todayDate,
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
