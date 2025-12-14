"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, Mail, Lock, Eye, EyeOff, User } from "lucide-react"
import Link from "next/link"

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState<"parent" | "child">("parent")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    // Child-specific fields
    parentEmail: "",
    age: "",
    device1Uid: "",
    device2Uid: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu không khớp!")
      return
    }
    if (!formData.agreeToTerms) {
      alert("Vui lòng đồng ý với điều khoản sử dụng!")
      return
    }

    setIsLoading(true)

    try {
      // Call register API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: role,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          age: formData.age,
          parentEmail: formData.parentEmail,
          device1Uid: formData.device1Uid,
          device2Uid: formData.device2Uid,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Đăng ký thất bại')
        setIsLoading(false)
        return
      }

      // Show success message and stay on page
      alert(data.message || 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.')
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
        parentEmail: "",
        age: "",
        device1Uid: "",
        device2Uid: "",
      })
      
      setIsLoading(false)
    } catch (error) {
      console.error('Registration error:', error)
      alert('Lỗi kết nối. Vui lòng thử lại!')
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full shadow-xl border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-heading text-balance">Tạo tài khoản mới</CardTitle>
          <CardDescription className="text-muted-foreground text-pretty">
            Bắt đầu hành trình theo dõi sự phát triển của con bạn
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Role Selector */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => setRole("parent")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              role === "parent"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Phụ huynh
          </button>
          <button
            type="button"
            onClick={() => setRole("child")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              role === "child"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Con cái
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              {role === "parent" ? "Tên phụ huynh" : "Tên của bạn"}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                className="pl-10 h-12 bg-background border-border focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          {role === "child" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm font-medium">
                    Độ tuổi
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="12"
                    value={formData.age}
                    onChange={(e) => updateFormData("age", e.target.value)}
                    className="h-12 bg-background border-border focus:border-primary transition-colors"
                    required={role === "child"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentEmail" className="text-sm font-medium">
                  Email phụ huynh quản lý
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="parentEmail"
                    type="email"
                    placeholder="parent@email.com"
                    value={formData.parentEmail}
                    onChange={(e) => updateFormData("parentEmail", e.target.value)}
                    className="pl-10 h-12 bg-background border-border focus:border-primary transition-colors"
                    required={role === "child"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">UID thiết bị (tùy chọn)</Label>
                <Input
                  id="device1Uid"
                  placeholder="Thiết bị 1"
                  value={formData.device1Uid}
                  onChange={(e) => updateFormData("device1Uid", e.target.value)}
                  className="h-12 bg-background border-border focus:border-primary transition-colors"
                />
                <Input
                  id="device2Uid"
                  placeholder="Thiết bị 2"
                  value={formData.device2Uid}
                  onChange={(e) => updateFormData("device2Uid", e.target.value)}
                  className="h-12 bg-background border-border focus:border-primary transition-colors"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className="pl-10 h-12 bg-background border-border focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Mật khẩu
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => updateFormData("password", e.target.value)}
                className="pl-10 pr-10 h-12 bg-background border-border focus:border-primary transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Xác nhận mật khẩu
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                className="pl-10 pr-10 h-12 bg-background border-border focus:border-primary transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => updateFormData("agreeToTerms", checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground">
              Tôi đồng ý với{" "}
              <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">
                điều khoản sử dụng
              </Link>{" "}
              và{" "}
              <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">
                chính sách bảo mật
              </Link>
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 transform hover:scale-[1.02]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Đang tạo tài khoản...
              </div>
            ) : (
              "Tạo tài khoản"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <Separator />
        <div className="text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link href="/" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Đăng nhập ngay
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
