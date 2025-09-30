"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Watch, Battery, Wifi } from "lucide-react"

export function DeviceStatusCard() {
  const batteryLevel = 78
  const isOnline = true
  const lastSync = "2 phút trước"

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <Watch className="w-5 h-5 text-primary" />
          Trạng thái thiết bị
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium">{isOnline ? "Đang hoạt động" : "Ngoại tuyến"}</span>
            <Badge variant={isOnline ? "default" : "secondary"} className="text-xs">
              {isOnline ? "LIVE" : "OFFLINE"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm">
                <span>Pin</span>
                <span className="font-medium">{batteryLevel}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    batteryLevel > 50 ? "bg-primary" : batteryLevel > 20 ? "bg-yellow-500" : "bg-destructive"
                  }`}
                  style={{ width: `${batteryLevel}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Đồng bộ cuối</p>
              <p className="text-sm font-medium">{lastSync}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
