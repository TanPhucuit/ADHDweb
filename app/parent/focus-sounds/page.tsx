"use client"

import { useAuth } from "@/lib/auth"
import { useEffect, useState, useCallback } from "react"
import { dataStore } from "@/lib/data-store"
import type { Child } from "@/lib/types"
import { DashboardHeader } from "@/components/parent/dashboard-header"
import { ChildSelector } from "@/components/parent/child-selector"
import { FocusSoundPlayer } from "@/components/focus/focus-sound-player"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Brain, Heart, Volume2 } from "lucide-react"

export default function ParentFocusSoundsPage() {
  const { user, loading } = useAuth()
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<{ isPlaying: boolean; trackName?: string }>({
    isPlaying: false,
  })

  useEffect(() => {
    if (user) {
      const userChildren = dataStore.getChildrenByParent(user.id)
      setChildren(userChildren)

      if (userChildren.length > 0 && !selectedChild) {
        setSelectedChild(userChildren[0])
      }
    }
  }, [user, selectedChild])

  const handlePlayingChange = useCallback((isPlaying: boolean, trackName?: string) => {
    setCurrentlyPlaying({ isPlaying, trackName })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <ChildSelector children={children} selectedChild={selectedChild} onChildSelect={setSelectedChild} />

        {/* Current Status */}
        {currentlyPlaying.isPlaying && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 text-white rounded-full">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-green-800">Đang phát âm thanh tập trung</p>
                  <p className="text-sm text-green-600">{currentlyPlaying.trackName}</p>
                </div>
                <Badge className="bg-green-500 ml-auto">Đang hoạt động</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedChild && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Music className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Âm thanh tập trung cho {selectedChild.name}</h1>
                <p className="text-gray-600">Quản lý và theo dõi việc sử dụng âm thanh hỗ trợ tập trung</p>
              </div>
            </div>

            {/* Benefits Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Brain className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-medium mb-1">Tăng tập trung</h3>
                  <p className="text-sm text-muted-foreground">Giúp con duy trì sự chú ý lâu hơn</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <h3 className="font-medium mb-1">Giảm căng thẳng</h3>
                  <p className="text-sm text-muted-foreground">Tạo cảm giác thư giãn khi học</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Volume2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-medium mb-1">Che tiếng ồn</h3>
                  <p className="text-sm text-muted-foreground">Tạo môi trường học tập yên tĩnh</p>
                </CardContent>
              </Card>
            </div>

            <FocusSoundPlayer onPlayingChange={handlePlayingChange} />
          </div>
        )}

        {children.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👶</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Chưa có con nào được thêm</h2>
            <p className="text-gray-500 mb-6">Hãy thêm thông tin con của bạn để bắt đầu theo dõi</p>
          </div>
        )}
      </main>
    </div>
  )
}
