"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Watch, Wifi, CheckCircle, Loader2 } from "lucide-react"
import { PairingSuccess } from "./pairing-success"

export function PairingFlow() {
  const [step, setStep] = useState<"pairing" | "connecting" | "success">("pairing")
  const [watchName, setWatchName] = useState("Đồng hồ của Minh An")
  const [isLoading, setIsLoading] = useState(false)

  const watchId = "ASW-2024-XYZ"

  const handlePairing = async () => {
    setIsLoading(true)
    setStep("connecting")

    // Simulate pairing process
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setStep("success")
    setIsLoading(false)
  }

  const handleComplete = () => {
    // Redirect to dashboard
    window.location.href = "/dashboard"
  }

  if (step === "success") {
    return <PairingSuccess watchName={watchName} onComplete={handleComplete} />
  }

  return (
    <Card className="w-full shadow-xl border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          {step === "connecting" ? (
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          ) : (
            <Watch className="w-10 h-10 text-primary" />
          )}
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-heading text-balance">
            {step === "connecting" ? "Đang kết nối..." : "Ghép nối với Đồng hồ Thông minh"}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-pretty">
            {step === "connecting"
              ? "Vui lòng đợi trong khi chúng tôi thiết lập kết nối"
              : "Thiết lập kết nối với đồng hồ thông minh của con bạn"}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === "pairing" && (
          <>
            {/* Device ID Display */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">ID Thiết bị được phát hiện</Label>
              <div className="flex items-center justify-center p-4 bg-muted rounded-lg border-2 border-dashed border-border">
                <div className="text-center space-y-2">
                  <Wifi className="w-6 h-6 text-primary mx-auto" />
                  <div className="font-mono text-lg font-semibold">{watchId}</div>
                  <Badge variant="secondary" className="text-xs">
                    Đồng hồ thông minh ADHD
                  </Badge>
                </div>
              </div>
            </div>

            {/* Device Name Input */}
            <div className="space-y-2">
              <Label htmlFor="watchName" className="text-sm font-medium">
                Đặt tên cho đồng hồ
              </Label>
              <Input
                id="watchName"
                type="text"
                value={watchName}
                onChange={(e) => setWatchName(e.target.value)}
                placeholder="Ví dụ: Đồng hồ của Minh An"
                className="h-12 bg-background border-border focus:border-primary transition-colors"
              />
              <p className="text-xs text-muted-foreground">Tên này sẽ giúp bạn dễ dàng nhận biết thiết bị</p>
            </div>

            {/* Device Info */}
            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Thông tin thiết bị:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Model: ADHD Smart Watch v2</div>
                <div>Firmware: 2.1.4</div>
                <div>Pin: 95%</div>
                <div>Tín hiệu: Mạnh</div>
              </div>
            </div>
          </>
        )}

        {step === "connecting" && (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className="text-lg font-semibold">Đang thiết lập kết nối</div>
                <div className="text-sm text-muted-foreground">
                  Đồng hồ: <span className="font-medium">{watchName}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  ID: <span className="font-mono">{watchId}</span>
                </div>
              </div>

              {/* Connection Steps */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Xác thực thiết bị</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span>Đồng bộ dữ liệu</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-4 h-4 rounded-full border-2 border-muted" />
                  <span>Hoàn tất thiết lập</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {step === "pairing" && (
        <CardFooter>
          <Button
            onClick={handlePairing}
            disabled={isLoading || !watchName.trim()}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 transform hover:scale-[1.02]"
          >
            <Watch className="w-4 h-4 mr-2" />
            Xác nhận Ghép nối
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
