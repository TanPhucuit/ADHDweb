"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Camera, Smartphone, User, Lock } from "lucide-react"

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [showLogin, setShowLogin] = useState(true)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticating(true)
    setError('')

    console.log('🚀 Form submitted! Login data:', loginData)

    try {
      console.log('🔐 Attempting login with:', loginData.email)
      
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log('✅ Login successful:', result.user)
        
        // Save user to localStorage
        localStorage.setItem('adhd-dashboard-user', JSON.stringify(result.user))
        
        // Redirect to child dashboard with unique URL for each child
        const childUrl = `/child?user=${result.user.id}&name=${encodeURIComponent(result.user.name)}`
        console.log('🔗 Redirecting to unique child URL:', childUrl)
        window.location.href = childUrl
      } else {
        console.log('❌ Login failed:', result.error)
        setError(result.error || 'Invalid email or password')
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      setError('Connection error. Please try again.')
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleStartScan = () => {
    setIsScanning(true)
    // Simulate QR scan process
    setTimeout(() => {
      // Redirect to pairing page after "scanning"
      window.location.href = "/pairing"
    }, 2000)
  }

  return (
    <Card className="w-full shadow-xl border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          {showLogin ? (
            <User className="w-10 h-10 text-primary" />
          ) : isScanning ? (
            <Camera className="w-10 h-10 text-primary animate-pulse" />
          ) : (
            <QrCode className="w-10 h-10 text-primary" />
          )}
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-heading text-balance">
            {showLogin ? "Đăng nhập" : isScanning ? "Đang quét mã QR..." : "Quét mã QR"}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-pretty">
            {showLogin 
              ? "Nhập email và mật khẩu để truy cập dashboard"
              : isScanning
                ? "Đang tìm kiếm đồng hồ thông minh..."
                : "Quét mã QR trên đồng hồ thông minh để bắt đầu ghép nối"}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {showLogin ? (
          <>
            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="minhan@child.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Mật khẩu</label>
                <input
                  id="password"
                  type="password"
                  placeholder="demo123"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isAuthenticating}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isAuthenticating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Đăng nhập
                  </>
                )}
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Tài khoản demo:</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• minhan@child.com / demo123</p>
                <p>• thaomy@child.com / demo123</p>
                <p>• bacnam@child.com / demo123</p>
              </div>
            </div>

            <Button
              onClick={() => setShowLogin(false)}
              className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
            >
              Hoặc quét mã QR
            </Button>
          </>
        ) : !isScanning ? (
          <>
            {/* Instructions */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Hướng dẫn:</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">1</span>
                  </div>
                  <span>Bật đồng hồ thông minh và vào menu "Ghép nối"</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">2</span>
                  </div>
                  <span>Mã QR sẽ hiển thị trên màn hình đồng hồ</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">3</span>
                  </div>
                  <span>Nhấn nút bên dưới và hướng camera vào mã QR</span>
                </div>
              </div>
            </div>

            {/* Demo QR Code */}
            <div className="bg-muted rounded-lg p-6 text-center">
              <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-3 flex items-center justify-center border-2 border-dashed border-border">
                <QrCode className="w-16 h-16 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Mã QR mẫu</p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleStartScan}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 transform hover:scale-[1.02]"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Bắt đầu quét
              </Button>
              
              <Button
                onClick={() => setShowLogin(true)}
                className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              >
                Hoặc đăng nhập bằng email
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-48 h-48 bg-black/10 rounded-lg mx-auto flex items-center justify-center border-2 border-primary/20">
              <div className="w-32 h-32 border-2 border-primary rounded-lg animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">Hướng camera vào mã QR trên đồng hồ thông minh</p>
            
            <Button
              onClick={() => {setIsScanning(false); setShowLogin(true)}}
              className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
            >
              Quay lại đăng nhập
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
