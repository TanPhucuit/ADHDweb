"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { User, Heart, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ProfileSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    parentName: "Nguyễn Văn A",
    parentEmail: "nguyenvana@email.com",
    parentPhone: "0123456789",
    childName: "Minh An",
    childAge: "8",
    childNotes: "Con có xu hướng mất tập trung khi học Toán, nhưng rất tập trung với Tiếng Anh.",
  })

  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Đã lưu thành công!",
      description: "Thông tin hồ sơ đã được cập nhật.",
    })

    setIsLoading(false)
  }

  const updateProfileData = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Thông tin hồ sơ
        </CardTitle>
        <CardDescription>Quản lý thông tin cá nhân của bạn và con</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Parent Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src="/parent-avatar.png" alt="Parent" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Camera className="w-4 h-4" />
              Đổi ảnh
            </Button>
          </div>

          <h3 className="font-heading font-semibold">Thông tin phụ huynh</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parentName">Họ và tên</Label>
              <Input
                id="parentName"
                value={profileData.parentName}
                onChange={(e) => updateProfileData("parentName", e.target.value)}
                placeholder="Nhập họ và tên"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentEmail">Email</Label>
              <Input
                id="parentEmail"
                type="email"
                value={profileData.parentEmail}
                onChange={(e) => updateProfileData("parentEmail", e.target.value)}
                placeholder="Nhập email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentPhone">Số điện thoại</Label>
              <Input
                id="parentPhone"
                value={profileData.parentPhone}
                onChange={(e) => updateProfileData("parentPhone", e.target.value)}
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>
        </div>

        {/* Child Information */}
        <div className="space-y-4 pt-6 border-t">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-semibold">Thông tin con</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="childName">Tên con</Label>
              <Input
                id="childName"
                value={profileData.childName}
                onChange={(e) => updateProfileData("childName", e.target.value)}
                placeholder="Nhập tên con"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="childAge">Tuổi</Label>
              <Input
                id="childAge"
                value={profileData.childAge}
                onChange={(e) => updateProfileData("childAge", e.target.value)}
                placeholder="Nhập tuổi"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="childNotes">Ghi chú về con</Label>
            <Textarea
              id="childNotes"
              value={profileData.childNotes}
              onChange={(e) => updateProfileData("childNotes", e.target.value)}
              placeholder="Ví dụ: Sở thích, khó khăn trong học tập, điều cần lưu ý..."
              rows={3}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </CardContent>
    </Card>
  )
}
