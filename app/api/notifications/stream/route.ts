import { NextRequest, NextResponse } from 'next/server'

// Server-Sent Events for real-time notifications
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const parentId = searchParams.get('parentId')

  if (!parentId) {
    return NextResponse.json({ error: 'Parent ID required' }, { status: 400 })
  }

  // Create readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', parentId })}\n\n`)

      // Set up periodic heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`)
      }, 30000)

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        controller.close()
      })

      // Listen for new notifications (in production, this would be from database triggers or message queue)
      // For demo, we'll simulate with periodic checks
      const checkNotifications = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/notifications?userId=${parentId}`)
          if (response.ok) {
            const data = await response.json()
            const recentNotifications = data.notifications?.filter((n: any) => 
              new Date(n.created_at).getTime() > Date.now() - 60000 // Last minute
            )
            
            if (recentNotifications?.length > 0) {
              controller.enqueue(`data: ${JSON.stringify({ 
                type: 'notifications', 
                data: recentNotifications 
              })}\n\n`)
            }
          }
        } catch (error) {
          console.error('Error checking notifications:', error)
        }
      }

      const notificationChecker = setInterval(checkNotifications, 10000) // Check every 10 seconds

      request.signal.addEventListener('abort', () => {
        clearInterval(notificationChecker)
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}