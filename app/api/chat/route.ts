import { type NextRequest, NextResponse } from "next/server"
import { generateAIResponse } from "@/lib/openai-client"

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Chat API: Receiving request')
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      console.error('❌ Chat API: Invalid messages format')
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    console.log('📝 Chat API: Processing', messages.length, 'messages')
    const response = await generateAIResponse(messages)
    console.log('✅ Chat API: Response generated successfully')

    return NextResponse.json({
      content: response,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("💥 Chat API Error:", error)
    console.error('Error details:', error.message, error.stack)

    // Return user-friendly error based on error type
    let errorMessage = "Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau."
    
    if (error.message?.includes('API key')) {
      errorMessage = "Lỗi xác thực API key. Vui lòng kiểm tra cài đặt."
    } else if (error.message?.includes('rate limit')) {
      errorMessage = "Đã vượt quá giới hạn sử dụng. Vui lòng thử lại sau."
    } else if (error.message?.includes('timeout')) {
      errorMessage = "Yêu cầu hết thời gian chờ. Vui lòng thử lại."
    }

    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        content: errorMessage,
      },
      { status: 500 },
    )
  }
}
