"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Watch, Wifi, Battery, Edit2, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Device {
  id: string
  name: string
  model: string
  status: "online" | "offline"
  battery: number
  lastSync: string
}

export function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "ASW-2024-XYZ",
      name: "Đồng hồ của Minh An",
      model: "ADHD Smart Watch v2",
      status: "online",
      battery: 78,
      lastSync: "2 phút trước",
    },
  ])

  const [editingDevice, setEditingDevice] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const { toast } = useToast()

  const handleRename = (deviceId: string, currentName: string) => {
    setEditingDevice(deviceId)
    setEditName(currentName)
  }

  const saveRename = () => {
    setDevices((prev) => prev.map((device) => (device.id === editingDevice ? { ...device, name: editName } : device)))
    setEditingDevice(null)
    toast({
      title: "Đã đổi tên thành công!",
      description: "Tên thiết bị đã được cập nhật.",
    })
  }

  const handleUnpair = (deviceId: string) => {
    setDevices((prev) => prev.filter((device) => device.id !== deviceId))
    toast({
      title: "Đã hủy ghép nối!",
      description: "Thiết bị đã được gỡ khỏi tài khoản.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2">
          <Watch className="w-5 h-5 text-primary" />
          Quản lý thiết bị
        </CardTitle>
        <CardDescription>Danh sách các thiết bị đã kết nối với tài khoản</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {devices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Watch className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có thiết bị nào được kết nối</p>
            <Button className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Thêm thiết bị mới
            </Button>
          </div>
        ) : (
          <>
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Watch className="w-6 h-6 text-primary" />
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    {editingDevice === device.id ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8 w-full sm:w-48"
                          onKeyPress={(e) => e.key === "Enter" && saveRename()}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveRename}>
                            Lưu
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingDevice(null)}>
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <h3 className="font-medium truncate">{device.name}</h3>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
                      <span className="truncate">{device.model}</span>
                      <span className="truncate">ID: {device.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Status and Battery */}
                  <div className="flex flex-col sm:text-right space-y-1 flex-1 sm:flex-none">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          device.status === "online" ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      <Badge variant={device.status === "online" ? "default" : "secondary"} className="text-xs">
                        {device.status === "online" ? "Trực tuyến" : "Ngoại tuyến"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Battery className="w-4 h-4" />
                        <span>{device.battery}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wifi className="w-4 h-4" />
                        <span>{device.lastSync}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRename(device.id, device.name)}
                      disabled={editingDevice !== null}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive bg-transparent h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hủy ghép nối thiết bị?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn hủy ghép nối "{device.name}"? Hành động này không thể hoàn tác và bạn
                            sẽ cần ghép nối lại thiết bị.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleUnpair(device.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Xác nhận hủy
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full gap-2 bg-transparent">
              <Plus className="w-4 h-4" />
              Thêm thiết bị mới
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
