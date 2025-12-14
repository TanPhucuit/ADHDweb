"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { getDashboardRoute } from "@/lib/navigation"

// Real login function that calls backend API with role
async function login(email: string, password: string, role: string) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }),
    })

    const data = await response.json()

    if (data.success && data.user) {
      localStorage.setItem('adhd-dashboard-user', JSON.stringify(data.user))
      return true
    } else {
      console.error('Login failed:', data.error)
      console.error('Login error:', 'Email:', email, 'Password:', password, 'Role:', role)
      return false
    }
  } catch (error) {
    console.error('Login error:', error)
    return false
  }
}

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("child") // Default to child
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(email, password, role)
      if (success) {
        const storedUser = localStorage.getItem("adhd-dashboard-user")
        if (storedUser) {
          const loggedInUser = JSON.parse(storedUser)
          const dashboardRoute = getDashboardRoute(loggedInUser)
          router.replace(dashboardRoute)
        }
      } else {
        setError("Email hoặc mật khẩu không đúng")
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi đăng nhập")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">ADHD Smart Assistant</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Loại tài khoản</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="child">👶 Trẻ em</option>
              <option value="parent">👨‍👩‍👧‍👦 Phụ huynh</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Chưa có tài khoản? </span>
          <a href="/register" className="text-primary hover:underline font-medium">
            Đăng ký ngay
          </a>
        </div>
      </CardContent>
    </Card>
  )
}