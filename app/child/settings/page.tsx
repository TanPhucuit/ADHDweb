"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { dataStore } from "@/lib/data-store"
import type { Child } from "@/lib/types"
import { ChildHeader } from "@/components/child/child-header"
import { GoBackButton } from "@/components/ui/go-back-button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Palette, Volume2, Eye } from "lucide-react"

export default function ChildSettingsPage() {
  const { user, loading } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [settings, setSettings] = useState({
    backgroundColor: "gradient-purple-pink",
    fontSize: 14, // Reduced default font size
    soundEnabled: true,
    notificationsEnabled: true,
    highContrast: false,
    animationsEnabled: true,
  })

  useEffect(() => {
    if (user) {
      const childData = dataStore.getChildById("child-1")
      setChild(childData)
    }
  }, [user])

  const backgroundOptions = [
    { id: "gradient-purple-pink", name: "💜 Tím hồng", class: "from-purple-400 via-pink-400 to-orange-400" },
    { id: "gradient-blue-green", name: "💙 Xanh lam", class: "from-blue-400 via-cyan-400 to-green-400" },
    { id: "gradient-orange-red", name: "🧡 Cam đỏ", class: "from-orange-400 via-red-400 to-pink-400" },
    { id: "gradient-green-blue", name: "💚 Xanh lá", class: "from-green-400 via-teal-400 to-blue-400" },
    { id: "solid-light", name: "🤍 Sáng", class: "from-gray-50 to-gray-100" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
        <LoadingSpinner />
      </div>
    )
  }

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
        <div className="text-center text-white px-4">
          <div className="text-4xl sm:text-6xl mb-4">🔒</div>
          <h2 className="text-lg sm:text-2xl font-heading font-bold mb-2 drop-shadow-lg">Chưa có quyền truy cập</h2>
          <p className="text-sm sm:text-base font-medium drop-shadow">Hãy nhờ bố mẹ thiết lập tài khoản cho con</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${backgroundOptions.find((bg) => bg.id === settings.backgroundColor)?.class || "from-purple-400 via-pink-400 to-orange-400"}`}
    >
      <ChildHeader child={child} />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <GoBackButton className="text-white hover:bg-white/20 font-bold drop-shadow" />

        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-heading font-bold text-white mb-2 drop-shadow-lg">
            ⚙️ Cài đặt của {child.name}
          </h1>
          <p className="text-white/95 text-sm sm:text-lg font-medium drop-shadow">
            Tùy chỉnh giao diện theo ý thích của con
          </p>
        </div>

        {/* Background Settings */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-heading">
              <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />🎨 Màu nền
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {backgroundOptions.map((option) => (
                <div
                  key={option.id}
                  className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.backgroundColor === option.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                  onClick={() => setSettings({ ...settings, backgroundColor: option.id })}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${option.class}`}></div>
                    <div>
                      <p className="font-heading font-bold text-base sm:text-lg text-gray-800">{option.name}</p>
                      {settings.backgroundColor === option.id && (
                        <p className="text-xs sm:text-sm text-purple-600 font-bold">✅ Đang sử dụng</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-heading">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />👀 Hiển thị
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="space-y-3">
              <Label className="text-base sm:text-lg font-heading font-bold text-gray-800">📏 Kích thước chữ</Label>
              <div className="px-2 sm:px-4">
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={(value) => setSettings({ ...settings, fontSize: value[0] })}
                  max={20} // Reduced max font size
                  min={12}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs sm:text-sm text-gray-600 mt-2 font-medium">
                  <span>Nhỏ</span>
                  <span className="font-bold text-gray-800">Hiện tại: {settings.fontSize}px</span>
                  <span>Lớn</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
              <div>
                <Label className="text-sm sm:text-lg font-heading font-bold text-gray-800">🔍 Độ tương phản cao</Label>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Giúp chữ dễ đọc hơn</p>
              </div>
              <Switch
                checked={settings.highContrast}
                onCheckedChange={(checked) => setSettings({ ...settings, highContrast: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
              <div>
                <Label className="text-sm sm:text-lg font-heading font-bold text-gray-800">✨ Hiệu ứng động</Label>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Bật/tắt các hiệu ứng chuyển động</p>
              </div>
              <Switch
                checked={settings.animationsEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, animationsEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sound & Notifications */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-heading">
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />🔊 Âm thanh & Thông báo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
              <div>
                <Label className="text-sm sm:text-lg font-heading font-bold text-gray-800">🎵 Âm thanh</Label>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Bật/tắt âm thanh trong ứng dụng</p>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
              <div>
                <Label className="text-sm sm:text-lg font-heading font-bold text-gray-800">🔔 Thông báo</Label>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Nhận thông báo nhắc nhở</p>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, notificationsEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="text-center pt-4">
          <Button
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 font-heading font-bold text-sm sm:text-lg px-6 sm:px-8 py-2 sm:py-3 shadow-lg"
          >
            💾 Lưu cài đặt
          </Button>
        </div>
      </main>
    </div>
  )
}
