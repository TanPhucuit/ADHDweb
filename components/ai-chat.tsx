"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Send, User, Loader2, Brain, Calendar, Award, Pill, TrendingUp, AlertCircle, Settings } from "lucide-react"
import { apiService } from "@/lib/api-service"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import Link from "next/link"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
  actionCards?: ActionCard[]
}

interface ActionCard {
  type: "schedule" | "reward" | "assessment" | "medication" | "focus"
  title: string
  description: string
  action: string
  data?: any
}

interface AIChatProps {
  context?: string
  childId?: string
}

export function AIChat({ context, childId = "child-1" }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [childData, setChildData] = useState<any>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [apiConfigured, setApiConfigured] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkApiConfiguration()
  }, [])

  const checkApiConfiguration = () => {
    if (typeof window !== "undefined") {
      const apiKey = localStorage.getItem("openai_api_key") || process.env.OPENAI_API_KEY
      setApiConfigured(!!apiKey)
    }
  }

  // Load child data and initialize chat
  useEffect(() => {
    loadChildData()
  }, [childId])

  const loadChildData = async () => {
    try {
      setIsDataLoading(true)
      
      // Load real data from API instead of dataStore
      let child = null
      let rewardProfile = null
      let medicationLogs = []
      
      try {
        // Try to get real data from API
        const [rewards, medications] = await Promise.all([
          apiService.getRewardPoints(childId).catch(() => null),
          apiService.getMedicationLogs(childId).catch(() => [])
        ])
        
        // Create child object
        child = {
          name: "Bạn nhỏ",
          age: 11,
          id: childId
        }
        
        // Create reward profile from API data
        if (rewards) {
          rewardProfile = {
            totalPointsEarned: rewards.totalStars,
            currentPoints: rewards.totalStars,
            level: Math.floor(rewards.totalStars / 50) + 1,
            streakDays: 0,
            dailyStickers: { unicorn: rewards.breakdown?.scheduleActivities || 0 },
            dailyBadges: { superStar: rewards.breakdown?.medicationLogs || 0 }
          }
        }
        
        medicationLogs = medications || []
        
      } catch (error) {
        console.error("Error loading real data:", error)
        // Use fallback data
        child = { name: "Bạn nhỏ", age: 8 }
        rewardProfile = null
        medicationLogs = []
      }

      const data = {
        child: child || { name: "Bạn nhỏ", age: 8 },
        currentSession: null, // TODO: Get from API when available
        todayReport: null, // TODO: Get from API when available
        rewardProfile,
        weeklyAssessment: null, // TODO: Get from API when available
        medicationLogs: medicationLogs || [],
      }

      setChildData(data)

      // Initialize with personalized welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: generateWelcomeMessage(data, context),
        timestamp: new Date(),
        suggestions: [
          "Làm thế nào để cải thiện khả năng tập trung?",
          "Tạo lịch trình học tập phù hợp",
          "Tư vấn về thuốc ADHD",
          "Phương pháp Pomodoro có hiệu quả không?",
          "Cách xây dựng thói quen tích cực",
        ],
      }

      setMessages([welcomeMessage])
    } catch (error) {
      console.error("Error loading child data:", error)
      const fallbackData = {
        child: { name: "Bạn nhỏ", age: 8 },
        currentSession: null,
        todayReport: null,
        rewardProfile: null,
        weeklyAssessment: null,
        medicationLogs: [],
      }
      setChildData(fallbackData)

      const errorMessage: Message = {
        id: "error",
        role: "assistant",
        content:
          "Xin chào! Tôi là Dr. AI, trợ lý ADHD của bạn. Hiện tại có một số vấn đề khi tải dữ liệu, nhưng tôi vẫn có thể hỗ trợ bạn với các câu hỏi về ADHD.",
        timestamp: new Date(),
        suggestions: [
          "Làm thế nào để cải thiện khả năng tập trung?",
          "Tạo lịch trình học tập phù hợp",
          "Tư vấn về thuốc ADHD",
          "Phương pháp Pomodoro có hiệu quả không?",
        ],
      }
      setMessages([errorMessage])
    } finally {
      setIsDataLoading(false)
    }
  }

  const generateWelcomeMessage = (data: any, context?: string) => {
    const { child, todayReport, rewardProfile, weeklyAssessment } = data

    let message = `Xin chào! Tôi là Dr. AI, trợ lý chuyên về ADHD của ${child?.name || "bạn"}. `

    if (context) {
      message += `Tôi sẽ hỗ trợ bạn với ${context}. `
    }

    if (todayReport?.totalFocusTime && todayReport?.averageFocusScore) {
      message += `\n\n📊 **Tình hình hôm nay:**\n`
      message += `• Thời gian tập trung: ${todayReport.totalFocusTime} phút\n`
      message += `• Điểm tập trung trung bình: ${todayReport.averageFocusScore}/100\n`
    }

    if (rewardProfile?.currentPoints && rewardProfile?.level) {
      message += `\n🏆 **Điểm thưởng hiện tại:** ${rewardProfile.currentPoints} điểm (Cấp ${rewardProfile.level})\n`
    }

    if (weeklyAssessment?.overallProgress) {
      const progress = weeklyAssessment.overallProgress
      const progressEmoji =
        progress === "excellent" ? "🌟" : progress === "good" ? "👍" : progress === "fair" ? "⚡" : "🔄"
      message += `\n${progressEmoji} **Tiến độ tuần này:** ${getProgressText(progress)}\n`
    }

    message += `\n💡 Tôi có thể giúp bạn về:\n• Tư vấn cải thiện tập trung\n• Lập kế hoạch học tập\n• Quản lý hành vi ADHD\n• Hướng dẫn sử dụng thuốc\n• Kỹ thuật thư giãn và tập trung`

    return message
  }

  const getProgressText = (progress: string) => {
    switch (progress) {
      case "excellent":
        return "Xuất sắc"
      case "good":
        return "Tốt"
      case "fair":
        return "Khá"
      case "needs_attention":
        return "Cần chú ý"
      default:
        return "Đang theo dõi"
    }
  }

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    inputRef.current?.focus()
  }

  const handleActionCard = async (card: ActionCard) => {
    let response = ""

    switch (card.type) {
      case "schedule":
        response =
          "Tôi sẽ giúp bạn tạo lịch trình học tập phù hợp. Hãy cho tôi biết môn học và thời gian bạn muốn sắp xếp."
        break
      case "reward":
        response = `Bạn hiện có ${childData?.rewardProfile?.currentPoints || 0} điểm. Tôi có thể gợi ý một số phần thưởng phù hợp hoặc cách kiếm thêm điểm.`
        break
      case "assessment":
        response = "Tôi sẽ phân tích tình hình ADHD của bạn dựa trên dữ liệu gần đây và đưa ra khuyến nghị cụ thể."
        break
      case "medication":
        response = "Tôi có thể tư vấn về việc sử dụng thuốc ADHD, tác dụng phụ và cách theo dõi hiệu quả điều trị."
        break
      case "focus":
        response =
          "Hãy cùng tôi khám phá các kỹ thuật cải thiện tập trung như Pomodoro, mindfulness và tạo môi trường học tập tối ưu."
        break
    }

    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
  }

  const generateActionCards = (userMessage: string, childData: any): ActionCard[] => {
    const cards: ActionCard[] = []
    const message = userMessage.toLowerCase()

    if (message.includes("lịch") || message.includes("thời gian") || message.includes("học")) {
      cards.push({
        type: "schedule",
        title: "Tạo lịch trình học tập",
        description: "Lập kế hoạch học tập cá nhân hóa",
        action: "Tạo lịch trình",
      })
    }

    if (message.includes("điểm") || message.includes("thưởng") || message.includes("động lực")) {
      cards.push({
        type: "reward",
        title: "Hệ thống thưởng",
        description: `${childData?.rewardProfile?.currentPoints || 0} điểm hiện có`,
        action: "Xem phần thưởng",
      })
    }

    if (message.includes("đánh giá") || message.includes("tiến độ") || message.includes("adhd")) {
      cards.push({
        type: "assessment",
        title: "Đánh giá ADHD",
        description: "Phân tích tình hình và đưa ra khuyến nghị",
        action: "Xem đánh giá",
      })
    }

    if (message.includes("thuốc") || message.includes("medication") || message.includes("uống")) {
      cards.push({
        type: "medication",
        title: "Quản lý thuốc",
        description: "Tư vấn và theo dõi việc dùng thuốc",
        action: "Xem lịch uống thuốc",
      })
    }

    if (message.includes("tập trung") || message.includes("focus") || message.includes("pomodoro")) {
      cards.push({
        type: "focus",
        title: "Cải thiện tập trung",
        description: "Kỹ thuật và phương pháp tăng cường tập trung",
        action: "Học kỹ thuật",
      })
    }

    return cards
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (!apiConfigured) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "⚠️ **Cần cấu hình API Key**\n\nĐể sử dụng tính năng trò chuyện với AI, bạn cần cấu hình OpenAI API Key. Vui lòng:\n\n1. Nhấp vào nút **Cài đặt API** ở góc trên bên phải\n2. Nhập API Key từ OpenAI\n3. Lưu cài đặt và quay lại\n\nTrong thời gian chờ, tôi có thể cung cấp một số lời khuyên cơ bản về ADHD.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input.trim()
    setInput("")
    setIsLoading(true)

    try {
      const contextData = childData
        ? {
            childName: childData.child?.name || "Bạn nhỏ",
            age: childData.child?.age || 8,
            currentFocusScore: childData.todayReport?.averageFocusScore || null,
            totalFocusTime: childData.todayReport?.totalFocusTime || null,
            rewardPoints: childData.rewardProfile?.currentPoints || null,
            adhdSeverity: childData.weeklyAssessment?.adhdSeverityScore || null,
            overallProgress: childData.weeklyAssessment?.overallProgress || null,
            medicationStatus: childData.medicationLogs?.length > 0 ? "active" : "none",
          }
        : {}

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `Bạn là Dr. AI, một chuyên gia tư vấn ADHD chuyên nghiệp và thân thiện. 
              
              Thông tin về trẻ:
              ${JSON.stringify(contextData, null, 2)}
              
              Hãy trả lời bằng tiếng Việt, sử dụng thông tin trên để đưa ra lời khuyên cá nhân hóa. 
              Luôn tích cực, khuyến khích và đưa ra các gợi ý thực tế. 
              Nếu cần tư vấn y tế chuyên sâu, hãy khuyên gặp bác sĩ chuyên khoa.
              
              ${context ? `Context thêm: ${context}` : ""}`,
            },
            ...messages.slice(-5).map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            { role: "user", content: currentInput },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Generate action cards based on user message
      const actionCards = generateActionCards(currentInput, childData)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này.",
        timestamp: new Date(),
        actionCards: actionCards.length > 0 ? actionCards : undefined,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❌ **Lỗi kết nối**\n\nXin lỗi, đã có lỗi xảy ra khi kết nối với AI:\n\n${error instanceof Error ? error.message : "Lỗi không xác định"}\n\nVui lòng:\n1. Kiểm tra kết nối internet\n2. Đảm bảo API Key được cấu hình đúng\n3. Thử lại sau ít phút\n\nTrong thời gian chờ, bạn có thể xem các gợi ý bên dưới.`,
        timestamp: new Date(),
        suggestions: ["Cài đặt API Key", "Xem hướng dẫn sử dụng", "Liên hệ hỗ trợ"],
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      // Focus back to input
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case "schedule":
        return <Calendar className="h-4 w-4" />
      case "reward":
        return <Award className="h-4 w-4" />
      case "assessment":
        return <TrendingUp className="h-4 w-4" />
      case "medication":
        return <Pill className="h-4 w-4" />
      case "focus":
        return <Brain className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  if (isDataLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with API Settings Link */}
      <div className="border-b bg-gray-50 px-1 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
          <Brain className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">Dr. AI - Trợ lý ADHD</span>
          {!apiConfigured && (
            <Badge variant="destructive" className="text-xs px-1 py-0 h-5 flex-shrink-0">
              Cần API
            </Badge>
          )}
          {apiConfigured && (
            <Badge variant="secondary" className="text-xs px-1 py-0 h-5 flex-shrink-0">
              Sẵn sàng
            </Badge>
          )}
        </div>
        <Link href="/settings/api">
          <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-7 flex-shrink-0">
            <Settings className="h-3 w-3 sm:mr-1" />
            <span className="hidden sm:inline">Cài đặt API</span>
          </Button>
        </Link>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-1 sm:px-3 py-2 sm:py-3 min-h-0">
        <div className="space-y-2 sm:space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[95%] sm:max-w-[85%] ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      : "bg-white border border-gray-200 text-gray-900 shadow-sm"
                  } rounded-lg p-2 sm:p-3`}
                >
                  {message.role === "assistant" ? (
                    <MarkdownRenderer content={message.content} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  )}
                  <p className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {message.suggestions && message.role === "assistant" && (
                <div className="ml-8 sm:ml-10 space-y-1 sm:space-y-2">
                  <p className="text-xs text-gray-500 font-medium">Gợi ý câu hỏi:</p>
                  <div className="flex flex-wrap gap-1">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-6 sm:h-7 bg-transparent px-2 py-1"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Cards */}
              {message.actionCards && message.role === "assistant" && (
                <div className="ml-8 sm:ml-10 space-y-1 sm:space-y-2">
                  <p className="text-xs text-gray-500 font-medium">Hành động gợi ý:</p>
                  <div className="grid gap-1 sm:gap-2">
                    {message.actionCards.map((card, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleActionCard(card)}
                      >
                        <CardContent className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-50 rounded-lg flex-shrink-0">{getActionIcon(card.type)}</div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium truncate">{card.title}</h4>
                              <p className="text-xs text-gray-600 truncate">{card.description}</p>
                            </div>
                            <Badge variant="outline" className="text-xs px-1 py-0 h-5 flex-shrink-0">
                              {card.action}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-600">Dr. AI đang suy nghĩ...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-gray-50 p-1.5 sm:p-3 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi Dr. AI về ADHD, học tập..."
            disabled={isLoading}
            className="flex-1 bg-white text-sm"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-3 sm:px-4"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
