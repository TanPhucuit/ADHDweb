"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bell, Mail, Smartphone, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NotificationSettings {
  focusAlerts: boolean
  focusThreshold: number
  dailySummary: boolean
  weeklyReport: boolean
  deviceOffline: boolean
  lowBattery: boolean
  interventionSuccess: boolean
  pushNotifications: boolean
  emailNotifications: boolean
  smsNotifications: boolean
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    focusAlerts: true,
    focusThreshold: 40,
    dailySummary: true,
    weeklyReport: true,
    deviceOffline: true,
    lowBattery: true,
    interventionSuccess: false,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const updateSetting = (key: keyof NotificationSettings, value: boolean | number) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Đã lưu cài đặt!",
      description: "Tùy chọn thông báo đã được cập nhật.",
    })

    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Cài đặt thông báo
        </CardTitle>
        <CardDescription>Tùy chỉnh các loại thông báo bạn muốn nhận</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alert Settings */}
        <div className="space-y-4">
          <h3 className="font-heading font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            Cảnh báo tập trung
          </h3>

          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="focusAlerts">Cảnh báo khi mất tập trung</Label>
                <p className="text-sm text-muted-foreground">
                  Nhận thông báo khi điểm tập trung giảm xuống dưới ngưỡng
                </p>
              </div>
              <Switch
                id="focusAlerts"
                checked={settings.focusAlerts}
                onCheckedChange={(checked) => updateSetting("focusAlerts", checked)}
              />
            </div>

            {settings.focusAlerts && (
              <div className="space-y-2">
                <Label htmlFor="focusThreshold">Ngưỡng cảnh báo (%)</Label>
                <Input
                  id="focusThreshold"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.focusThreshold}
                  onChange={(e) => updateSetting("focusThreshold", Number.parseInt(e.target.value) || 0)}
                  className="w-24"
                />
                <p className="text-xs text-muted-foreground">
                  Cảnh báo khi điểm tập trung dưới {settings.focusThreshold}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Report Settings */}
        <div className="space-y-4">
          <h3 className="font-heading font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Báo cáo định kỳ
          </h3>

          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="dailySummary">Tóm tắt hàng ngày</Label>
                <p className="text-sm text-muted-foreground">Nhận báo cáo tổng kết cuối ngày</p>
              </div>
              <Switch
                id="dailySummary"
                checked={settings.dailySummary}
                onCheckedChange={(checked) => updateSetting("dailySummary", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="weeklyReport">Báo cáo tuần</Label>
                <p className="text-sm text-muted-foreground">Nhận phân tích chi tiết hàng tuần</p>
              </div>
              <Switch
                id="weeklyReport"
                checked={settings.weeklyReport}
                onCheckedChange={(checked) => updateSetting("weeklyReport", checked)}
              />
            </div>
          </div>
        </div>

        {/* Device Settings */}
        <div className="space-y-4">
          <h3 className="font-heading font-semibold flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" />
            Thiết bị
          </h3>

          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="deviceOffline">Thiết bị ngoại tuyến</Label>
                <p className="text-sm text-muted-foreground">Cảnh báo khi đồng hồ mất kết nối</p>
              </div>
              <Switch
                id="deviceOffline"
                checked={settings.deviceOffline}
                onCheckedChange={(checked) => updateSetting("deviceOffline", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="lowBattery">Pin yếu</Label>
                <p className="text-sm text-muted-foreground">Thông báo khi pin dưới 20%</p>
              </div>
              <Switch
                id="lowBattery"
                checked={settings.lowBattery}
                onCheckedChange={(checked) => updateSetting("lowBattery", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="interventionSuccess">Thành công can thiệp</Label>
                <p className="text-sm text-muted-foreground">Thông báo khi can thiệp có hiệu quả</p>
              </div>
              <Switch
                id="interventionSuccess"
                checked={settings.interventionSuccess}
                onCheckedChange={(checked) => updateSetting("interventionSuccess", checked)}
              />
            </div>
          </div>
        </div>

        {/* Delivery Methods */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-heading font-semibold">Phương thức nhận thông báo</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="pushNotifications">Thông báo đẩy</Label>
              <Switch
                id="pushNotifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email</Label>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="smsNotifications">SMS</Label>
              <Switch
                id="smsNotifications"
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => updateSetting("smsNotifications", checked)}
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? "Đang lưu..." : "Lưu cài đặt"}
        </Button>
      </CardContent>
    </Card>
  )
}
