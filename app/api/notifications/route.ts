import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory store for demo
let notifications: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, childId, type, title, message, metadata } = body

    console.log('📢 Creating notification:', { userId, childId, type, title, message })

    const notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from_user_id: childId,
      to_user_id: userId,
      type,
      title,
      message,
      is_read: false,
      metadata: metadata || null,
      created_at: new Date().toISOString()
    }

    notifications.push(notification)
    console.log('✅ Notification created successfully')
    console.log('📋 Total notifications in store:', notifications.length)

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error('❌ Error in notifications API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    console.log('📋 Fetching notifications for user:', userId)
    console.log('📋 Current notifications in store:', notifications.length)

    const userNotifications = notifications
      .filter(notif => notif.to_user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)

    console.log('✅ Found notifications:', userNotifications.length)

    return NextResponse.json({ notifications: userNotifications })
  } catch (error) {
    console.error('❌ Error in notifications GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, isRead } = body

    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId is required' }, { status: 400 })
    }

    const notificationIndex = notifications.findIndex(notif => notif.id === notificationId)
    if (notificationIndex === -1) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    notifications[notificationIndex].is_read = isRead
    notifications[notificationIndex].updated_at = new Date().toISOString()

    return NextResponse.json({ success: true, notification: notifications[notificationIndex] })
  } catch (error) {
    console.error('❌ Error in notifications PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')

    if (action === 'clear') {
      if (userId) {
        const beforeCount = notifications.filter(notif => notif.to_user_id === userId).length
        notifications = notifications.filter(notif => notif.to_user_id !== userId)
        console.log(`🗑️ Cleared ${beforeCount} notifications for user: ${userId}`)
        return NextResponse.json({ success: true, message: `Cleared ${beforeCount} notifications for user ${userId}` })
      } else {
        const beforeCount = notifications.length
        notifications.length = 0
        console.log(`🗑️ Cleared ${beforeCount} notifications`)
        return NextResponse.json({ success: true, message: `Cleared ${beforeCount} notifications` })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('❌ Error in notifications DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}