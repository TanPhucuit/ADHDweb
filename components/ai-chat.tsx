"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Send, User, Loader2, Brain, Calendar, Award, Pill, TrendingUp, AlertCircle, ExternalLink } from "lucide-react"
import { apiService } from "@/lib/api-service"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import Link from "next/link"

interface ScheduleActivity {
  subject: string
  start_time: string
  end_time: string
  notes?: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
  actionCards?: ActionCard[]
  scheduleProposal?: ScheduleActivity[]
}

interface ActionCard {
  type: "schedule" | "reward" | "assessment" | "medication" | "focus"
  title: string
  description: string
  action: string
  href: string  // navigation destination
  data?: any
}

interface AIChatProps {
  context?: string
  childId?: string
}

export function AIChat({ context, childId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [childData, setChildData] = useState<any>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [applyingSchedule, setApplyingSchedule] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load child data and initialize chat
  useEffect(() => {
    if (childId) {
      loadChildData()
    }
  }, [childId])

  // Persist chat history to localStorage whenever messages change
  useEffect(() => {
    if (!childId || messages.length === 0) return
    localStorage.setItem(`adhd-chat-parent-${childId}`, JSON.stringify(messages.slice(-100)))
  }, [messages, childId])

  // Parse [SCHEDULE:{...}] tag from AI response using brace-balancing (handles nested JSON)
  // Falls back to parsing markdown time-table if tag not found and user asked for schedule
  const parseScheduleFromContent = (content: string, userMessage?: string): { cleaned: string; proposal: ScheduleActivity[] | null } => {
    // Method 1: Find [SCHEDULE:{...}] tag
    const markerIdx = content.indexOf('[SCHEDULE:')
    if (markerIdx !== -1) {
      const jsonStart = markerIdx + '[SCHEDULE:'.length
      let depth = 0
      let jsonEnd = -1
      for (let i = jsonStart; i < content.length; i++) {
        if (content[i] === '{') depth++
        else if (content[i] === '}') { depth--; if (depth === 0) { jsonEnd = i + 1; break } }
      }
      if (jsonEnd !== -1) {
        const closingBracket = content.indexOf(']', jsonEnd)
        if (closingBracket !== -1) {
          try {
            const parsed = JSON.parse(content.slice(jsonStart, jsonEnd))
            const activities: ScheduleActivity[] = parsed.activities || parsed
            if (Array.isArray(activities) && activities.length > 0) {
              const cleaned = (content.slice(0, markerIdx) + content.slice(closingBracket + 1)).trim()
              return { cleaned, proposal: activities }
            }
          } catch {}
        }
      }
    }

    // Method 2: Fallback — parse markdown table, extract ONLY academic subjects
    // Always attempt this when the response contains a time-range table
    {
      const subjectKeywords: [RegExp, string][] = [
        [/tiếng anh|english/i, 'Tiếng Anh'],
        [/tin học|tin\b/i, 'Tin học'],
        [/gdcd/i, 'GDCD'],
        [/toán/i, 'Toán'],
        [/ngữ văn|văn/i, 'Văn'],
        [/vật lý|\blý\b/i, 'Vật lý'],
        [/hóa học|\bhóa\b/i, 'Hóa học'],
        [/lịch sử|\bsử\b/i, 'Lịch sử'],
        [/địa lý|\bđịa\b/i, 'Địa lý'],
        [/sinh học|\bsinh\b/i, 'Sinh học'],
        [/nhạc|âm nhạc/i, 'Âm nhạc'],
        [/mỹ thuật|\bvẽ\b/i, 'Mỹ thuật'],
        [/thể dục/i, 'Thể dục'],
        [/tự học/i, 'Tự học'],
      ]
      const rowRegex = /\|\s*(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})\s*\|\s*([^|\n]+?)\s*\|/g
      const activities: ScheduleActivity[] = []
      let m
      while ((m = rowRegex.exec(content)) !== null) {
        const raw = m[3].trim()
        // Skip non-academic / lifestyle rows
        if (/thức dậy|ăn sáng|ăn trưa|ăn tối|ăn uống|chuẩn bị|tại trường|đến trường|về nhà|đi ngủ|\bngủ\b|nghỉ ngơi|nghỉ giải lao|giải lao|vui chơi|thể thao|tự do|giải trí|sinh hoạt|tắm|hoạt động thể|chơi game/i.test(raw)) continue
        // Find which academic subject this row is about
        let subject = ''
        for (const [pattern, name] of subjectKeywords) {
          if (pattern.test(raw)) { subject = name; break }
        }
        if (!subject) continue
        activities.push({ subject, start_time: m[1], end_time: m[2], notes: '' })
      }
      if (activities.length >= 2) return { cleaned: content, proposal: activities }
    }

    return { cleaned: content, proposal: null }
  }

  const loadChildData = async () => {
    if (!childId) {
      console.error('❌ Dr.AI: No childId provided')
      setIsDataLoading(false)
      return
    }
    
    try {
      setIsDataLoading(true)
      console.log('🤖 Dr.AI: Loading data for child:', childId)
      
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

      // Build VERY DETAILED analysis for Dr.AI context
      const medicationAdherence = medicationLogs.length > 0 
        ? Math.round((medicationLogs.filter((log: any) => log.taken).length / medicationLogs.length) * 100)
        : 0
      
      const recentActivities = medicationLogs.length
      const totalStars = rewardProfile?.totalPointsEarned || 0
      const currentLevel = rewardProfile?.level || 1
      
      // Calculate more specific stats
      const completedActivitiesCount = medicationLogs.filter((log: any) => log.taken).length
      const missedMedications = medicationLogs.filter((log: any) => !log.taken).length
      
      const data = {
        child: child || { name: "Bạn nhỏ", age: 8 },
        currentSession: null,
        todayReport: {
          focusScore: 72,
          completedActivities: recentActivities,
          medicationTaken: medicationAdherence > 70,
          behaviorRating: 4,
        },
        rewardProfile: {
          ...rewardProfile,
          totalPointsEarned: totalStars,
          currentPoints: totalStars,
          level: currentLevel,
          weeklyProgress: `${recentActivities} hoạt động hoàn thành tuần này`,
        },
        weeklyAssessment: {
          focusTrend: totalStars > 50 ? 'improving' : 'stable',
          strengths: ['Hoàn thành nhiệm vụ đúng hạn', 'Tuân thủ lịch uống thuốc'],
          challenges: ['Duy trì tập trung dài hạn', 'Quản lý cảm xúc'],
          recommendations: [
            'Tiếp tục sử dụng kỹ thuật Pomodoro',
            'Tăng cường thời gian nghỉ giữa các hoạt động',
            'Khuyến khích hoạt động thể chất',
          ],
        },
        medicationLogs: medicationLogs || [],
        stats: {
          medicationAdherence: `${medicationAdherence}%`,
          weeklyActivities: recentActivities,
          currentStreak: rewardProfile?.streakDays || 0,
          completedCount: completedActivitiesCount,
          missedCount: missedMedications,
          totalMedicationLogs: medicationLogs.length,
          rewardStars: totalStars,
          analysisDetail: `Trẻ đã hoàn thành ${completedActivitiesCount} lần uống thuốc, bỏ lỡ ${missedMedications} lần. Tỷ lệ tuân thủ: ${medicationAdherence}%. Tổng ${totalStars} ngôi sao thưởng, cấp độ ${currentLevel}.`,
        },
      }

      setChildData(data)

      // Restore chat history from localStorage if available
      const savedHistory = localStorage.getItem(`adhd-chat-parent-${childId}`)
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })))
            setIsDataLoading(false)
            return
          }
        } catch {}
      }

      // No history — show personalized welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: generateWelcomeMessage(data, context),
        timestamp: new Date(),
        suggestions: [
          "Phân tích tiến độ cải thiện của con",
          "Giúp tôi tạo lịch học phù hợp cho con",
          "Con tôi thường mất tập trung sau 15 phút, phải làm sao?",
          "Các phương pháp điều trị ADHD không dùng thuốc",
          "Làm thế nào để con tuân thủ lịch uống thuốc?",
        ],
      }

      setMessages([welcomeMessage])
    } catch (error) {
      console.error("❌ Error loading child data:", error)
      // Still set fallback data so chat can work
      const fallbackData = {
        child: { name: "Bạn nhỏ", age: 8, id: childId },
        currentSession: null,
        todayReport: null,
        rewardProfile: null,
        weeklyAssessment: null,
        medicationLogs: [],
      }
      setChildData(fallbackData)

      // Simple welcome without error message
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: "Xin chào! Tôi là Dr. AI, chuyên gia tư vấn ADHD cho phụ huynh. Tôi có thể giúp bạn phân tích tiến độ của con, tư vấn phương pháp điều trị, và lập kế hoạch học tập phù hợp.",
        timestamp: new Date(),
        suggestions: [
          "Phân tích tiến độ cải thiện của con",
          "Giúp tôi tạo lịch học phù hợp cho con",
          "Các phương pháp điều trị ADHD hiệu quả",
          "Làm thế nào để con tuân thủ lịch uống thuốc?",
        ],
      }
      setMessages([welcomeMessage])
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

  const generateActionCards = (userMessage: string, childData: any): ActionCard[] => {
    const cards: ActionCard[] = []
    const message = userMessage.toLowerCase()

    if (message.includes("lịch") || message.includes("thời gian") || message.includes("học")) {
      cards.push({
        type: "schedule",
        title: "Xếp lịch học cho con",
        description: "Tạo thời khóa biểu mới cho hôm nay",
        action: "Mở trang chủ",
        href: "/parent",
      })
    }

    if (message.includes("điểm") || message.includes("thưởng") || message.includes("động lực")) {
      cards.push({
        type: "reward",
        title: "Hệ thống thưởng",
        description: `Xem và quản lý điểm thưởng của con`,
        action: "Đến trang thưởng",
        href: "/parent/rewards",
      })
    }

    if (message.includes("đánh giá") || message.includes("tiến độ") || message.includes("adhd") || message.includes("báo cáo")) {
      cards.push({
        type: "assessment",
        title: "Báo cáo & Đánh giá",
        description: "Xem biểu đồ tiến độ và lịch sử hoạt động",
        action: "Xem báo cáo",
        href: "/parent/reports",
      })
    }

    if (message.includes("thuốc") || message.includes("medication") || message.includes("uống")) {
      cards.push({
        type: "medication",
        title: "Quản lý thuốc",
        description: "Thêm, xóa và theo dõi lịch uống thuốc của con",
        action: "Đến trang thuốc",
        href: "/parent/medication",
      })
    }

    if (message.includes("tập trung") || message.includes("focus") || message.includes("pomodoro")) {
      cards.push({
        type: "focus",
        title: "Theo dõi tập trung",
        description: "Xem biểu đồ điểm tập trung và xu hướng",
        action: "Xem báo cáo",
        href: "/parent/reports",
      })
    }

    return cards
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

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
              content: `Bạn là Dr. AI - chuyên gia tư vấn ADHD dành cho PHỤ HUYNH.

NHIỆM VỤ CHÍNH:
1. Tư vấn y tế & bệnh lý: Giải thích về ADHD, các mức độ, triệu chứng, phương pháp điều trị (thuốc, trị liệu hành vi, can thiệp giáo dục)
2. Phân tích tiến độ con: Đánh giá mức độ tập trung, tuân thủ thuốc, xu hướng cải thiện/suy giảm
3. Tư vấn chiến lược: Đề xuất phương pháp nuôi dạy con ADHD, quản lý hành vi, tạo môi trường học tập
4. Tạo lịch học: Giúp phụ huynh xây dựng thời khóa biểu phù hợp với con (cân bằng học/nghỉ, thời điểm uống thuốc, hoạt động thể chất)
5. Hỗ trợ gia đình: Cách giao tiếp với con ADHD, xử lý tình huống khó, giảm stress cho gia đình

DỮ LIỆU CON HIỆN TẠI:
${contextData.stats?.analysisDetail || JSON.stringify(contextData, null, 2)}

YÊU CẦU TRẢ LỜI:
- Dùng số liệu cụ thể khi phân tích tiến độ
- Đưa ra khuyến nghị có bước thực hiện rõ ràng
- Phân biệt rõ: thông tin chung vs. khuyến nghị cụ thể cho con
- Khi tư vấn thuốc: nhắc phụ huynh tham khảo bác sĩ chuyên khoa
- Tông giọng: chuyên nghiệp nhưng thông cảm, hỗ trợ

===== TÍNH NĂNG TẠO LỊCH HỌC =====
Khi phụ huynh yêu cầu tạo lịch học, HOẶC yêu cầu chỉnh sửa/điều chỉnh lịch đã đề xuất, phản hồi PHẢI gồm ĐÚNG 2 phần:

PHẦN 1 - Giải thích (bắt buộc): Mô tả ngắn về lịch học, lý do sắp xếp.

PHẦN 2 - JSON TAG (BẮT BUỘC - KHÔNG ĐƯỢC BỎ QUA):
Dòng CUỐI CÙNG của phản hồi PHẢI là dòng bắt đầu bằng [SCHEDULE: và kết thúc bằng }]
Ví dụ:
[SCHEDULE:{"activities":[{"subject":"Toán","start_time":"16:00","end_time":"17:00","notes":"Làm bài tập"},{"subject":"Tiếng Anh","start_time":"17:15","end_time":"18:00","notes":"Học từ vựng"},{"subject":"Văn","start_time":"18:10","end_time":"18:55","notes":"Ôn bài cũ"}]}]

QUY TẮC JSON (vi phạm = phản hồi bị hỏng):
- activities CHỈ chứa môn học thực sự: Toán, Văn, Tiếng Anh, Vật lý, Hóa học, Lịch sử, Địa lý, Sinh học, GDCD, Tin học, Âm nhạc, Mỹ thuật, Tự học
- KHÔNG đưa vào activities: Nghỉ ngơi, Giải lao, Ăn uống, Thể dục, Sinh hoạt cá nhân
- subject: tên ngắn gọn ("Toán" không phải "Ôn tập hoặc làm bài tập Toán")
- start_time / end_time: định dạng HH:MM, 24h (ví dụ "16:00" không phải "4:00 PM")
- Mỗi lần điều chỉnh lịch, PHẢI xuất lại [SCHEDULE:...] đầy đủ với lịch đã cập nhật

${context ? `Ngữ cảnh: ${context}` : ""}`,
            },
            ...messages.slice(-10).map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            { role: "user", content: currentInput },
          ],
        }),
      })

      console.log('📡 Sending chat request...')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Chat API error:', response.status, errorData)
        throw new Error(errorData.content || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Chat response received:', data)
      
      // Check if response has error
      if (data.error || !data.content) {
        console.error('❌ API returned error:', data.error)
        throw new Error(data.error || 'No content in response')
      }

      // Parse schedule proposal from response (pass user message for table fallback)
      const { cleaned, proposal } = parseScheduleFromContent(data.content, currentInput)
      // Generate action cards based on user message
      const actionCards = proposal ? [] : generateActionCards(currentInput, childData)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: cleaned,
        timestamp: new Date(),
        scheduleProposal: proposal || undefined,
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

  const applySchedule = async (messageId: string, activities: ScheduleActivity[]) => {
    if (!childId) return
    setApplyingSchedule(messageId)
    try {
      const res = await fetch('/api/parent/create-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, activities }),
      })
      const result = await res.json()
      if (res.ok) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant' as const,
          content: `✅ **Đã tạo lịch học thành công!**\n\nLịch học với ${activities.length} môn đã được lưu cho con. Con có thể xem trong trang lịch học của mình.`,
          timestamp: new Date(),
        }])
      } else {
        throw new Error(result.error || 'Lỗi không xác định')
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: `❌ Không thể tạo lịch học: ${err instanceof Error ? err.message : 'Lỗi không xác định'}. Vui lòng thử lại.`,
        timestamp: new Date(),
      }])
    } finally {
      setApplyingSchedule(null)
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
      {/* Header */}
      <div className="border-b bg-gray-50 px-1 sm:px-3 py-1.5 sm:py-2 flex items-center gap-2 flex-shrink-0">
        <Brain className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">Dr. AI - Tư vấn ADHD cho Phụ huynh</span>
        <Badge variant="secondary" className="text-xs px-1 py-0 h-5 flex-shrink-0 ml-auto">
          Sẵn sàng
        </Badge>
        {childId && messages.length > 1 && (
          <button
            onClick={() => {
              localStorage.removeItem(`adhd-chat-parent-${childId}`)
              setMessages([])
              loadChildData()
            }}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            title="Xóa lịch sử chat"
          >
            Xóa lịch sử
          </button>
        )}
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

              {/* Schedule Proposal */}
              {message.scheduleProposal && message.role === "assistant" && (
                <div className="ml-8 sm:ml-10 mt-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-semibold text-blue-800">Lịch học đề xuất</p>
                      <span className="text-xs text-blue-500 ml-auto">{message.scheduleProposal!.length} môn</span>
                    </div>
                    <div className="space-y-1.5">
                      {message.scheduleProposal.map((act, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm bg-white rounded-lg px-2 py-1.5 border border-blue-100">
                          <span className="text-blue-500 font-mono text-xs w-11 flex-shrink-0 pt-0.5">{act.start_time}–{act.end_time}</span>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-gray-800">{act.subject}</span>
                            {act.notes && <span className="text-gray-500 text-xs block truncate">{act.notes}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => applySchedule(message.id, message.scheduleProposal!)}
                      disabled={applyingSchedule === message.id}
                      className="w-full mt-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {applyingSchedule === message.id
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang tạo lịch...</>
                        : <><Calendar className="h-4 w-4" /> Áp dụng lịch học này cho con</>
                      }
                    </button>
                  </div>
                </div>
              )}

              {/* Action Cards */}
              {message.actionCards && message.role === "assistant" && (
                <div className="ml-8 sm:ml-10 space-y-1 sm:space-y-2">
                  <p className="text-xs text-gray-500 font-medium">Chức năng liên quan:</p>
                  <div className="grid gap-1 sm:gap-2">
                    {message.actionCards.map((card, index) => (
                      <Link key={index} href={card.href}>
                        <Card className="cursor-pointer hover:shadow-md hover:border-blue-300 transition-all">
                          <CardContent className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-blue-50 rounded-lg flex-shrink-0">{getActionIcon(card.type)}</div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium truncate">{card.title}</h4>
                                <p className="text-xs text-gray-600 truncate">{card.description}</p>
                              </div>
                              <ExternalLink className="w-3 h-3 text-blue-400 flex-shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
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
