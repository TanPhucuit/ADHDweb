"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { GoBackButton } from "@/components/ui/go-back-button"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { QrCodeIcon, SmartphoneIcon, Edit2, Trash2, Plus, Battery, Wifi, Settings } from "@/components/ui/icons"
import { useToast } from "@/hooks/use-toast"

interface Device {
  id: string
  name: string
  model: string
  status: "online" | "offline"
  battery: number
  lastSync: string
  childName: string
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "ASW-2024-001",
      name: "Đồng hồ của Minh An",
      model: "ADHD Smart Watch v2",
      status: "online",
      battery: 78,
      lastSync: "2 phút trước",
      childName: "Nguyễn Minh An",
    },
    {
      id: "ASW-2024-002",
      name: "Đồng hồ của Thu Hà",
      model: "ADHD Smart Watch v2",
      status: "offline",
      battery: 45,
      lastSync: "1 giờ trước",
      childName: "Nguyễn Thu Hà",
    },
  ])

  const [editingDevice, setEditingDevice] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [showAddDevice, setShowAddDevice] = useState(false)
  const [newDeviceName, setNewDeviceName] = useState("")
  const [newChildName, setNewChildName] = useState("")
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

  const handleAddDevice = () => {
    if (!newDeviceName || !newChildName) return

    const newDevice: Device = {
      id: `ASW-2024-${String(devices.length + 1).padStart(3, "0")}`,
      name: newDeviceName,
      model: "ADHD Smart Watch v2",
      status: "online",
      battery: 100,
      lastSync: "Vừa xong",
      childName: newChildName,
    }

    setDevices((prev) => [...prev, newDevice])
    setNewDeviceName("")
    setNewChildName("")
    setShowAddDevice(false)

    toast({
      title: "Đã thêm thiết bị thành công!",
      description: `Thiết bị "${newDeviceName}" đã được kết nối.`,
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <GoBackButton />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SmartphoneIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Quản lý thiết bị</h1>
            <p className="text-muted-foreground">Quản lý smartwatch và thiết bị kết nối</p>
          </div>
        </div>

        <Dialog open={showAddDevice} onOpenChange={setShowAddDevice}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Thêm thiết bị
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCodeIcon className="w-5 h-5" />
                Thêm thiết bị mới
              </DialogTitle>
              <DialogDescription>Quét mã QR trên smartwatch để kết nối thiết bị</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* QR Scanner Placeholder */}
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <QrCodeIcon className="w-16 h-16 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Hướng camera vào mã QR</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="device-name">Tên thiết bị</Label>
                <Input
                  id="device-name"
                  placeholder="VD: Đồng hồ của con"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="child-name">Tên con</Label>
                <Input
                  id="child-name"
                  placeholder="VD: Nguyễn Văn A"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDevice(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddDevice} disabled={!newDeviceName || !newChildName}>
                Kết nối thiết bị
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Device List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SmartphoneIcon className="w-5 h-5" />
            Danh sách thiết bị ({devices.length})
          </CardTitle>
          <CardDescription>Tất cả thiết bị smartwatch đã kết nối với tài khoản</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {devices.length === 0 ? (
            <div className="text-center py-12">
              <SmartphoneIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Chưa có thiết bị nào</h3>
              <p className="text-muted-foreground mb-4">Thêm smartwatch đầu tiên để bắt đầu theo dõi con</p>
              <Button onClick={() => setShowAddDevice(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Thêm thiết bị đầu tiên
              </Button>
            </div>
          ) : (
            devices.map((device) => (
              <div
                key={device.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <SmartphoneIcon className="w-6 h-6 text-primary" />
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
                      <div>
                        <h3 className="font-medium truncate">{device.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">Của: {device.childName}</p>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
                      <span className="truncate">{device.model}</span>
                      <span className="truncate">ID: {device.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-4">
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

                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent">
                      <Settings className="w-4 h-4" />
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
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
