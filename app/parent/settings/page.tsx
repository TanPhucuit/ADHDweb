"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, User, Bell, Shield, Smartphone, Users, AlertTriangle } from "@/components/ui/icons"
import { GoBackButton } from "@/components/ui/go-back-button"
import { dataStore } from "@/lib/data-store"

export default function ParentSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [children, setChildren] = useState<any[]>([
    {
      id: 1,
      name: "Nguyễn Minh An",
      age: 10,
      grade: "Lớp 5",
      status: "active",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState({
    dailyReports: true,
    focusAlerts: true,
    sessionReminders: true,
    weeklyProgress: true,
    emergencyAlerts: true,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("[v0] Loading parent settings data...")
        const currentUser = dataStore.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          const childrenData = dataStore.getChildrenByParent(currentUser.id)
          setChildren(childrenData)
        }
      } catch (error) {
        console.error("[v0] Error loading parent settings data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto p-3 sm:p-6">
        <div className="text-center">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <GoBackButton />
          <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Cài đặt phụ huynh</h1>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              Quản lý tài khoản và tùy chỉnh trải nghiệm của bạn
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
        <Tabs defaultValue="children" className="space-y-4 sm:space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className="grid grid-cols-5 bg-white rounded-lg p-1 min-w-full">
              <TabsTrigger value="profile" className="text-xs sm:text-sm px-1 sm:px-3">
                Hồ sơ
              </TabsTrigger>
              <TabsTrigger value="children" className="text-xs sm:text-sm px-1 sm:px-3">
                Quản lý con
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs sm:text-sm px-1 sm:px-3">
                Thông báo
              </TabsTrigger>
              <TabsTrigger value="privacy" className="text-xs sm:text-sm px-1 sm:px-3">
                Bảo mật
              </TabsTrigger>
              <TabsTrigger value="devices" className="text-xs sm:text-sm px-1 sm:px-3">
                Thiết bị
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-4 sm:space-y-6">
            <Card className="w-full overflow-hidden">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  Thông tin cá nhân
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Cập nhật thông tin hồ sơ của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm">
                      Họ và tên
                    </Label>
                    <Input id="name" defaultValue={user?.name || ""} placeholder="Nhập họ và tên" className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email || ""}
                      placeholder="Nhập email"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm">
                      Số điện thoại
                    </Label>
                    <Input
                      id="phone"
                      defaultValue={user?.phone || ""}
                      placeholder="Nhập số điện thoại"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm">
                      Vai trò
                    </Label>
                    <Input id="role" defaultValue="Phụ huynh" disabled className="text-sm" />
                  </div>
                </div>
                <Button className="w-full sm:w-auto text-sm">Lưu thay đổi</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Children Management */}
          <TabsContent value="children" className="space-y-4 sm:space-y-6">
            <Card className="bg-yellow-50 border-yellow-200 w-full overflow-hidden">
              <CardHeader className="p-3 sm:p-6 pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base sm:text-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  Quản lý con ({children.length})
                </CardTitle>
                <CardDescription className="text-gray-600 text-xs sm:text-sm">
                  Thêm, chỉnh sửa thông tin con và cài đặt giám sát
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                {children.length > 0 ? (
                  children.map((child) => (
                    <div key={child.id} className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-lg truncate">{child.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                              {child.age} tuổi • {child.grade}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 flex-shrink-0">
                          <Badge className="bg-green-100 text-green-700 border-green-200 px-2 sm:px-3 py-1 text-xs">
                            Đang hoạt động
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent text-xs sm:text-sm px-2 sm:px-3"
                          >
                            Chỉnh sửa
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <Users className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <p className="text-muted-foreground text-sm">Chưa có thông tin con</p>
                    <Button className="mt-3 sm:mt-4 text-sm">Thêm con</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
            <Card className="w-full overflow-hidden">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  Cài đặt thông báo
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Tùy chỉnh các loại thông báo bạn muốn nhận
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <Label className="text-sm font-medium">Báo cáo hàng ngày</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">Nhận báo cáo tiến độ học tập hàng ngày</p>
                    </div>
                    <Switch
                      checked={notifications.dailyReports}
                      onCheckedChange={(value) => handleNotificationChange("dailyReports", value)}
                      className="flex-shrink-0"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <Label className="text-sm font-medium">Cảnh báo tập trung</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Thông báo khi con gặp khó khăn tập trung
                      </p>
                    </div>
                    <Switch
                      checked={notifications.focusAlerts}
                      onCheckedChange={(value) => handleNotificationChange("focusAlerts", value)}
                      className="flex-shrink-0"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <Label className="text-sm font-medium">Nhắc nhở buổi học</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">Nhắc nhở trước khi bắt đầu buổi học</p>
                    </div>
                    <Switch
                      checked={notifications.sessionReminders}
                      onCheckedChange={(value) => handleNotificationChange("sessionReminders", value)}
                      className="flex-shrink-0"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <Label className="text-sm font-medium">Báo cáo tuần</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">Tổng kết tiến độ hàng tuần</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyProgress}
                      onCheckedChange={(value) => handleNotificationChange("weeklyProgress", value)}
                      className="flex-shrink-0"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        Cảnh báo khẩn cấp
                        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                      </Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Thông báo các tình huống cần can thiệp ngay
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emergencyAlerts}
                      onCheckedChange={(value) => handleNotificationChange("emergencyAlerts", value)}
                      className="flex-shrink-0"
                    />
                  </div>
                </div>

                <Button className="w-full sm:w-auto text-sm">Lưu cài đặt thông báo</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Security */}
          <TabsContent value="privacy" className="space-y-4 sm:space-y-6">
            <Card className="w-full overflow-hidden">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  Bảo mật & Quyền riêng tư
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Quản lý cài đặt bảo mật và quyền riêng tư
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-sm">
                      Mật khẩu hiện tại
                    </Label>
                    <Input id="current-password" type="password" className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm">
                      Mật khẩu mới
                    </Label>
                    <Input id="new-password" type="password" className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm">
                      Xác nhận mật khẩu mới
                    </Label>
                    <Input id="confirm-password" type="password" className="text-sm" />
                  </div>
                  <Button className="w-full sm:w-auto text-sm">Đổi mật khẩu</Button>
                </div>

                <Separator />

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-medium text-sm sm:text-base">Quyền riêng tư dữ liệu</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-sm flex-1">Chia sẻ dữ liệu để cải thiện dịch vụ</Label>
                      <Switch className="flex-shrink-0" />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-sm flex-1">Nhận email marketing</Label>
                      <Switch className="flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Device Management */}
          <TabsContent value="devices" className="space-y-4 sm:space-y-6">
            <Card className="bg-yellow-50 border-yellow-200 w-full overflow-hidden">
              <CardHeader className="p-3 sm:p-6 pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base sm:text-lg">
                  <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
                  Quản lý thiết bị
                </CardTitle>
                <CardDescription className="text-gray-600 text-xs sm:text-sm">
                  Xem và quản lý các thiết bị đã đăng nhập
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">iPhone</h3>
                          <h4 className="font-medium text-gray-800 text-sm">15 Pro</h4>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">Đăng nhập lần cuối: 2 phút trước</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0">
                        <Badge className="bg-orange-500 text-white px-2 sm:px-3 py-1 text-xs">Thiết bị hiện tại</Badge>
                        <span className="text-xs sm:text-sm text-gray-500">Đăng xuất</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">MacBook</h3>
                          <h4 className="font-medium text-gray-800 text-sm">Pro</h4>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">Đăng nhập lần cuối: 1 ngày trước</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0">
                        <span className="text-xs sm:text-sm text-blue-600">Đăng xuất</span>
                        <span className="text-xs sm:text-sm text-gray-500">Đăng xuất</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4 sm:my-6" />

                <Button
                  variant="destructive"
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 sm:py-3 text-sm"
                >
                  Đăng xuất tất cả thiết bị
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
