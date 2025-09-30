import { type NextRequest, NextResponse } from "next/server"
import { generateAIResponse } from "@/lib/openai-client"

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    const response = await generateAIResponse(messages)

    return NextResponse.json({
      content: response,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chat API Error:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        content: "Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau.",
      },
      { status: 500 },
    )
  }
}
