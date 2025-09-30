import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, model } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    // Test the API key with a simple request
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: "Test connection - respond with 'OK'",
          },
        ],
        max_tokens: 10,
      }),
    })

    if (response.ok) {
      return NextResponse.json({ status: "success", message: "Connection successful" })
    } else {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        {
          status: "error",
          message: errorData.error?.message || "Invalid API key or connection failed",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Test connection error:", error)
    return NextResponse.json({ status: "error", message: "Connection test failed" }, { status: 500 })
  }
}
