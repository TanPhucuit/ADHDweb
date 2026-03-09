"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, User, Loader2, BookOpen, Lightbulb, Star, Music, Timer, ImagePlus, Mic, MicOff, X } from "lucide-react"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import type { ActiveStudySession } from "@/lib/study-session-store"
import { dispatchToolAction } from "@/lib/study-session-store"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  imagePreview?: string   // base64 data URL shown in the bubble
  timestamp: Date
  suggestions?: string[]
  actions?: ParsedAction[]
}

interface ParsedAction {
  type: "play_music" | "set_timer" | "stop_music" | "stop_timer"
  label: string
  params?: Record<string, string | number>
}

interface StudyChatProps {
  childId?: string
  childName?: string
  activeSession?: ActiveStudySession | null
  onTimerSet?: (minutes: number) => void
  onMusicPlay?: (category: string) => void
}

// Parse [TOOL:action:param] tags from AI response
function parseActions(content: string): { cleaned: string; actions: ParsedAction[] } {
  const actions: ParsedAction[] = []
  const cleaned = content.replace(/\[TOOL:([^\]]+)\]/g, (_match, raw) => {
    const parts = raw.split(":")
    const type = parts[0]
    const param = parts[1]
    if (type === "play_music") {
      actions.push({ type: "play_music", label: `Phát nhạc ${param || "lo-fi"}`, params: { category: param || "ambient" } })
    } else if (type === "set_timer") {
      const mins = parseInt(param) || 25
      actions.push({ type: "set_timer", label: `Cài timer ${mins} phút`, params: { minutes: mins } })
    } else if (type === "stop_music") {
      actions.push({ type: "stop_music", label: "Tắt nhạc" })
    } else if (type === "stop_timer") {
      actions.push({ type: "stop_timer", label: "Dừng timer" })
    }
    return "" // strip from display
  })
  return { cleaned: cleaned.trim(), actions }
}

function buildSystemPrompt(session: ActiveStudySession | null | undefined): string {
  const subjectContext = session
    ? `\n\nHỌC SINH ĐANG HỌC: **${session.subject}** (thời lượng ${session.durationMinutes} phút)\nHãy ưu tiên hỗ trợ và giải thích về môn học này.`
    : ""

  return `Bạn là "Bạn học AI" - trợ lý học tập thân thiện dành riêng cho học sinh có ADHD.${subjectContext}

NHIỆM VỤ CỦA BẠN:
- Giúp học sinh hiểu bài, giải thích bài tập, trả lời câu hỏi học tập
- Tư vấn phương pháp học tập hiệu quả (Pomodoro, sơ đồ tư duy, ghi chú màu sắc, chia nhỏ bài học...)
- Hướng dẫn cách cải thiện sự tập trung và ghi nhớ
- Đưa ra lời khuyên về ADHD phù hợp với lứa tuổi học sinh
- Động viên, khen ngợi và khuyến khích học sinh

ĐỊNH DẠNG ĐẦU RA:
- Dùng **in đậm** cho khái niệm quan trọng
- Dùng công thức toán trong dấu $...$ ví dụ: $\\frac{1}{2}$ hay $a^2 + b^2 = c^2$
- Dùng block math cho công thức dài: $$...$$
- Dùng danh sách (-) cho các bước
- Giải thích ngắn gọn, rõ ràng

HÀNH ĐỘNG TỰ ĐỘNG:
Khi học sinh yêu cầu, hãy thêm tag hành động vào cuối câu trả lời:
- Mở nhạc lo-fi: [TOOL:play_music:ambient]
- Mở nhạc thiên nhiên: [TOOL:play_music:nature]
- Mở tiếng ồn trắng: [TOOL:play_music:white-noise]
- Cài timer (ví dụ 25 phút): [TOOL:set_timer:25]
- Tắt nhạc: [TOOL:stop_music]

PHONG CÁCH:
- Ngôn ngữ thân thiện, vui vẻ, dễ hiểu
- Chia nhỏ giải thích thành các bước
- Dùng ví dụ thực tế
- Tránh làm học sinh cảm thấy áp lực

KHÔNG LÀM:
- Không làm bài hộ hoàn toàn - hướng dẫn để học sinh tự làm
- Không tư vấn y tế hay điều chỉnh thuốc
- Không chỉ trích hay làm học sinh tự ti

Trả lời bằng tiếng Việt, ngắn gọn và đầy năng lượng tích cực!`
}

export function StudyChat({ childId, childName, activeSession, onTimerSet, onMusicPlay }: StudyChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)  // base64 data URL
  const [isRecording, setIsRecording] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {

    const subjectHint = activeSession ? ` Mình thấy bạn đang học **${activeSession.subject}** - mình sẵn sàng giúp!` : ""
    const suggestions = activeSession
      ? [
          `Giải thích bài ${activeSession.subject} cho mình`,
          "Mở nhạc lo-fi cho mình học",
          `Cài timer ${activeSession.durationMinutes} phút`,
          "Cách ghi nhớ bài nhanh hơn",
          "Mình đang mất tập trung, giúp mình với",
        ]
      : [
          "Giải thích cho mình về phân số",
          "Cách học thuộc bài nhanh hơn",
          "Mình mất tập trung khi học phải làm sao?",
          "Mở nhạc lo-fi cho mình học",
          "Cài timer 25 phút",
        ]

    const welcome: Message = {
      id: "welcome",
      role: "assistant",
      content: `Chào ${childName || "bạn"}! 👋 Mình là **Bạn học AI** - người bạn đồng hành trong việc học của bạn!${subjectHint}\n\n✨ Mình có thể giúp bạn:\n• Giải thích bài học khó hiểu (kể cả công thức toán!)\n• Tìm cách học hiệu quả hơn\n• Mở nhạc tập trung theo yêu cầu\n• Cài timer học tập cho bạn\n\nBạn đang cần giúp gì nào? 📚`,
      timestamp: new Date(),
      suggestions,
    }
    setMessages([welcome])
  }, [childName, activeSession?.subject])

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (viewport) viewport.scrollTop = viewport.scrollHeight
    }
  }, [messages])

  const handleAction = useCallback((action: ParsedAction) => {
    if (action.type === "play_music") {
      const category = (action.params?.category as string) || "ambient"
      dispatchToolAction({ type: "play_music", category })
      onMusicPlay?.(category)
    } else if (action.type === "set_timer") {
      const minutes = (action.params?.minutes as number) || 25
      dispatchToolAction({ type: "set_timer", minutes })
      onTimerSet?.(minutes)
    } else if (action.type === "stop_music") {
      dispatchToolAction({ type: "stop_music" })
    } else if (action.type === "stop_timer") {
      dispatchToolAction({ type: "stop_timer" })
    }
  }, [onMusicPlay, onTimerSet])

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    inputRef.current?.focus()
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    // reset so same file can be re-selected
    e.target.value = ""
  }

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      alert("Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói. Hãy dùng Chrome hoặc Edge nhé!")
      return
    }
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
      return
    }
    const rec = new SR()
    rec.lang = "vi-VN"
    rec.interimResults = false
    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput((prev) => (prev ? prev + " " + transcript : transcript))
    }
    rec.onend = () => setIsRecording(false)
    rec.onerror = () => setIsRecording(false)
    recognitionRef.current = rec
    rec.start()
    setIsRecording(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && !imagePreview) || isLoading) return

    const capturedImage = imagePreview
    const currentInput = input.trim()

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: currentInput || "(gửi hình ảnh)",
      imagePreview: capturedImage ?? undefined,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setImagePreview(null)
    setIsLoading(true)

    try {
      const systemPrompt = buildSystemPrompt(activeSession)

      // Build the last user message (may include an image)
      const lastUserContent: any = capturedImage
        ? [
            { type: "image_url", image_url: { url: capturedImage, detail: "auto" } },
            { type: "text", text: currentInput || "Hãy phân tích hình ảnh này và giúp mình nhé!" },
          ]
        : currentInput

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.slice(-8).map((msg) => ({ role: msg.role, content: msg.content })),
            { role: "user", content: lastUserContent },
          ],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.content || `HTTP ${response.status}`)
      }

      const data = await response.json()
      if (!data.content) throw new Error("No content in response")

      const { cleaned, actions } = parseActions(data.content)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: cleaned,
        timestamp: new Date(),
        actions: actions.length > 0 ? actions : undefined,
      }
      setMessages((prev) => [...prev, assistantMessage])
      actions.forEach((action) => handleAction(action))
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Oi, có lỗi rồi! Thử lại nhé bạn ơi.\n\n${error instanceof Error ? error.message : "Lỗi không xác định"}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-sky-50 to-blue-50 px-3 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-sky-800">Bạn học AI</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              {activeSession ? (
                <span className="text-xs text-sky-600">Đang học: <b>{activeSession.subject}</b></span>
              ) : (
                <span className="text-xs text-sky-600">Sẵn sàng giúp bạn!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-2 sm:px-3 py-3 min-h-0">
        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="h-3.5 w-3.5 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[90%] sm:max-w-[82%] rounded-2xl px-3 py-2 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-br-sm"
                      : "bg-white border border-sky-100 text-gray-900 shadow-sm rounded-bl-sm"
                  }`}
                >
                  {message.imagePreview && (
                    <img
                      src={message.imagePreview}
                      alt="uploaded"
                      className="rounded-xl mb-2 max-h-48 max-w-full object-contain border border-white/30"
                    />
                  )}
                  {message.role === "assistant" ? (
                    <MarkdownRenderer content={message.content} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  )}
                  <p className={`text-xs mt-1 ${message.role === "user" ? "text-sky-100" : "text-gray-400"}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 text-sky-600" />
                  </div>
                )}
              </div>

              {/* Action buttons from AI */}
              {message.actions && message.actions.length > 0 && (
                <div className="ml-9 flex flex-wrap gap-1.5">
                  {message.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAction(action)}
                      className="flex items-center gap-1 bg-sky-100 hover:bg-sky-200 text-sky-700 text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors border border-sky-200"
                    >
                      {action.type === "play_music" || action.type === "stop_music" ? (
                        <Music className="w-3 h-3" />
                      ) : (
                        <Timer className="w-3 h-3" />
                      )}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestion chips */}
              {message.suggestions && message.role === "assistant" && (
                <div className="ml-9 space-y-1">
                  <div className="flex items-center gap-1">
                    <Lightbulb className="h-3 w-3 text-yellow-500" />
                    <p className="text-xs text-gray-500 font-medium">Bạn có thể hỏi:</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-6 bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100 px-2 py-1 rounded-full"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Star className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="bg-white border border-sky-100 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                  <span className="text-sm text-gray-500">Bạn học AI đang suy nghĩ...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-gradient-to-r from-sky-50 to-blue-50 p-2 sm:p-3 flex-shrink-0 space-y-2">
        {/* Image preview strip */}
        {imagePreview && (
          <div className="relative inline-block">
            <img src={imagePreview} alt="preview" className="h-20 rounded-xl object-contain border border-sky-200" />
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

        <form onSubmit={handleSubmit} className="flex gap-1.5">
          {/* Image upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex-shrink-0 p-2 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 text-sky-600 disabled:opacity-40 transition-colors"
            title="Gửi hình ảnh"
          >
            <ImagePlus className="h-4 w-4" />
          </button>

          {/* Microphone button */}
          <button
            type="button"
            onClick={toggleMic}
            disabled={isLoading}
            className={`flex-shrink-0 p-2 rounded-xl border transition-colors ${
              isRecording
                ? "border-red-400 bg-red-50 text-red-600 animate-pulse"
                : "border-sky-200 bg-white hover:bg-sky-50 text-sky-600"
            } disabled:opacity-40`}
            title={isRecording ? "Dừng ghi âm" : "Nói để nhập văn bản"}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={activeSession ? `Hỏi về môn ${activeSession.subject}...` : "Hỏi về bài học, cách học, hay bất cứ điều gì..."}
            disabled={isLoading}
            className="flex-1 bg-white text-sm border-sky-200 focus-visible:ring-sky-400"
          />
          <Button
            type="submit"
            disabled={isLoading || (!input.trim() && !imagePreview)}
            className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 px-3 sm:px-4"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
