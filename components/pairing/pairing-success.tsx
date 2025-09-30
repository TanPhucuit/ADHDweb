"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react"

interface PairingSuccessProps {
  watchName: string
  onComplete: () => void
}

export function PairingSuccess({ watchName, onComplete }: PairingSuccessProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Trigger confetti animation
    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card className="w-full shadow-xl border-0 bg-card/80 backdrop-blur-sm relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/4 w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute top-0 left-1/2 w-2 h-2 bg-secondary rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="absolute top-0 right-1/4 w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
          <div
            className="absolute top-1/4 left-1/3 w-1 h-1 bg-green-500 rounded-full animate-ping"
            style={{ animationDelay: "0.6s" }}
          />
          <div
            className="absolute top-1/4 right-1/3 w-1 h-1 bg-blue-500 rounded-full animate-ping"
            style={{ animationDelay: "0.8s" }}
          />
        </div>
      )}

      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center relative">
          <CheckCircle className="w-10 h-10 text-primary" />
          <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-500 animate-pulse" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-heading text-balance text-primary">Kết nối thành công!</CardTitle>
          <CardDescription className="text-muted-foreground text-pretty">
            Đồng hồ thông minh đã được ghép nối và sẵn sàng sử dụng
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Success Details */}
        <div className="bg-primary/5 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="font-medium">Thiết bị đã kết nối</span>
          </div>
          <div className="pl-7 space-y-1">
            <div className="text-sm">
              <span className="text-muted-foreground">Tên thiết bị:</span>{" "}
              <span className="font-medium">{watchName}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Trạng thái:</span>{" "}
              <span className="text-primary font-medium">Đang hoạt động</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Đồng bộ:</span>{" "}
              <span className="text-primary font-medium">Hoàn tất</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Bước tiếp theo:</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span>Khám phá bảng điều khiển theo dõi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span>Thiết lập mục tiêu tập trung hàng ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span>Tùy chỉnh thông báo và nhắc nhở</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={onComplete}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 transform hover:scale-[1.02]"
        >
          Bắt đầu theo dõi
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  )
}
