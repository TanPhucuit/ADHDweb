import { SettingsHeader } from "@/components/settings/settings-header"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { DeviceManagement } from "@/components/settings/device-management"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { GoalSettings } from "@/components/settings/goal-settings"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Key, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SettingsHeader />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Cài đặt API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cấu hình OpenAI API key để sử dụng trợ lý AI</p>
                <p className="text-xs text-muted-foreground mt-1">Định dạng thông minh, loại bỏ markdown thô</p>
              </div>
              <Link href="/settings/api">
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                  Cấu hình
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <ProfileSettings />

        {/* Device Management */}
        <DeviceManagement />

        {/* Notification Settings */}
        <NotificationSettings />

        {/* Goal Settings */}
        <GoalSettings />
      </main>
    </div>
  )
}
