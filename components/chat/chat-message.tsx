"use client"

import { Bot, User } from "lucide-react"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-primary/10"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
      </div>

      {/* Message Content */}
      <div
        className={`rounded-lg p-3 max-w-[80%] ${isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"}`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}

        {/* Timestamp */}
        <div className={`text-xs mt-2 ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {message.timestamp.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  )
}
