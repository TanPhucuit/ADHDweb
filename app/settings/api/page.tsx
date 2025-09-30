"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Key, CheckCircle, AlertCircle, Eye, EyeOff, Save, TestTube } from "lucide-react"
import Link from "next/link"

export default function APISettingsPage() {
  const [apiKey, setApiKey] = useState("")
  const [model, setModel] = useState("gpt-4o-mini")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    // Load saved settings from localStorage
    const savedApiKey = localStorage.getItem("openai_api_key")
    const savedModel = localStorage.getItem("openai_model")

    if (savedApiKey) setApiKey(savedApiKey)
    if (savedModel) setModel(savedModel)
  }, [])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setSaveStatus("idle")

    try {
      // Save to localStorage (in production, this should be saved securely on server)
      localStorage.setItem("openai_api_key", apiKey)
      localStorage.setItem("openai_model", model)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSaveStatus("success")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (error) {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setConnectionStatus("error")
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus("idle")

    try {
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiKey,
          model: model,
        }),
      })

      if (response.ok) {
        setConnectionStatus("success")
      } else {
        setConnectionStatus("error")
      }
    } catch (error) {
      setConnectionStatus("error")
    } finally {
      setIsTestingConnection(false)
      setTimeout(() => setConnectionStatus("idle"), 5000)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Cài đặt API</h1>
                <p className="text-sm text-gray-600">Cấu hình OpenAI API cho trợ lý AI</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Cài đặt nâng cao
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* API Key Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Cấu hình OpenAI API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-600">
                  Nhập API key từ OpenAI. Bạn có thể lấy tại{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    platform.openai.com
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gpt-4o-mini">GPT-4o Mini (Khuyến nghị)</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
                <p className="text-xs text-gray-600">GPT-4o Mini được khuyến nghị cho hiệu suất tốt và chi phí thấp</p>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection || !apiKey.trim()}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <TestTube className="w-4 h-4" />
                  {isTestingConnection ? "Đang kiểm tra..." : "Kiểm tra kết nối"}
                  {getStatusIcon(connectionStatus)}
                </Button>

                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving || !apiKey.trim()}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Đang lưu..." : "Lưu cài đặt"}
                  {getStatusIcon(saveStatus)}
                </Button>
              </div>

              {connectionStatus === "success" && (
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>Kết nối thành công! API key hoạt động bình thường.</AlertDescription>
                </Alert>
              )}

              {connectionStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>Không thể kết nối. Vui lòng kiểm tra lại API key và thử lại.</AlertDescription>
                </Alert>
              )}

              {saveStatus === "success" && (
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>Cài đặt đã được lưu thành công!</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* AI Response Formatting Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt định dạng phản hồi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Tính năng định dạng thông minh:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Tự động loại bỏ ký tự markdown thô (*, #, **)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Hiển thị bảng thời khóa biểu đẹp mắt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Format danh sách và gạch đầu dòng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Tự động in đậm, in nghiêng phù hợp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Highlight thông tin quan trọng</span>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Lưu ý bảo mật:</strong> API key được lưu trữ cục bộ trên thiết bị của bạn. Không chia sẻ API
                  key với người khác.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Usage Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn sử dụng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div>
                <strong>1. Lấy API Key:</strong>
                <p>Truy cập platform.openai.com → API Keys → Create new secret key</p>
              </div>
              <div>
                <strong>2. Chọn Model:</strong>
                <p>GPT-4o Mini: Nhanh, rẻ, phù hợp cho hầu hết tác vụ</p>
                <p>GPT-4o: Chất lượng cao hơn, phù hợp cho tác vụ phức tạp</p>
              </div>
              <div>
                <strong>3. Kiểm tra kết nối:</strong>
                <p>Luôn test API key trước khi sử dụng để đảm bảo hoạt động</p>
              </div>
              <div>
                <strong>4. Bảo mật:</strong>
                <p>Không chia sẻ API key, thay đổi định kỳ nếu cần</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
