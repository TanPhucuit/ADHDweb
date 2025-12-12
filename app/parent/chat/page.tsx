"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Clock, AlertCircle, ArrowLeft, Settings } from "lucide-react"
import { AIChat } from "@/components/ai-chat"
import { dataStore } from "@/lib/data-store"
import Link from "next/link"

export default function ParentChatPage() {
  const [children, setChildren] = useState<any[]>([])
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [parentUser, setParentUser] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("[v0] Loading parent chat data...")
        // Get user from localStorage (real auth)
        const storedUser = localStorage.getItem('adhd-dashboard-user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setParentUser(userData)
          console.log('🔐 Parent user loaded for chat:', userData)
          
          // Fetch real children from API
          const response = await fetch(`/api/parent/children?parentId=${userData.id}`)
          if (response.ok) {
            const data = await response.json()
            const childrenData = data.children || []
            setChildren(childrenData)
            if (childrenData.length > 0) {
              setSelectedChild(childrenData[0])
              console.log('👶 Selected child for Dr.AI:', childrenData[0])
            }
          }
        }
      } catch (error) {
        console.error("[v0] Error loading parent chat data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/parent">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Tư vấn AI ADHD</h1>
              <p className="text-sm text-muted-foreground">Chuyên gia AI hỗ trợ gia đình 24/7</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/settings/api">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Cài đặt API
              </Button>
            </Link>
            <Badge variant="secondary">Trực tuyến</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Child Selector Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Chọn con
                </CardTitle>
                <CardDescription>Chọn con để nhận tư vấn cụ thể</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {children.length > 0 ? (
                  children.map((child) => (
                    <Button
                      key={child.id}
                      variant={selectedChild?.id === child.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedChild(child)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        {child.name}
                      </div>
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có thông tin con</p>
                )}

                <Separator />

                {/* Quick Tips */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Gợi ý câu hỏi:</h4>
                  <div className="space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      Làm thế nào để cải thiện sự tập trung?
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      Chiến lược quản lý hành vi
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      Lập kế hoạch học tập hiệu quả
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      Tạo thời khóa biểu phù hợp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[700px]">
              <CardContent className="h-full p-0">
                <AIChat
                  context={
                    selectedChild ? `Đang tư vấn cho trẻ: ${selectedChild.name}, tuổi: ${selectedChild.age}` : undefined
                  }
                  childId={selectedChild?.id ? String(selectedChild.id) : undefined}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-medium">Lịch sử trò chuyện</h3>
                  <p className="text-sm text-muted-foreground">Xem lại các cuộc trò chuyện trước</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-orange-500" />
                <div>
                  <h3 className="font-medium">Cảnh báo quan trọng</h3>
                  <p className="text-sm text-muted-foreground">Nhận thông báo về các vấn đề cần chú ý</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-medium">Kết nối chuyên gia</h3>
                  <p className="text-sm text-muted-foreground">Liên hệ với chuyên gia tâm lý</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
