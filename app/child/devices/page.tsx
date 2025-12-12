"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Smartphone, Save, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Device {
  id: number
  child_id: number
  device_uid: string
  device_name: string
  created_at: string
}

export default function ChildDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [childId, setChildId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Get child ID from localStorage
    const storedUser = localStorage.getItem('adhd-dashboard-user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        if (userData.role === 'child') {
          const childIdStr = userData?.id ? String(userData.id) : ''
          setChildId(childIdStr)
          if (childIdStr) fetchDevices(childIdStr)
        }
      } catch (e) {
        console.error('Error parsing user:', e)
      }
    }
    setLoading(false)
  }, [])

  const fetchDevices = async (id: string) => {
    try {
      const response = await fetch(`/api/child/devices?childId=${id}`)
      if (response.ok) {
        const data = await response.json()
        setDevices(data.devices || [])
      }
    } catch (error) {
      console.error('Error fetching devices:', error)
    }
  }

  const handleUpdateDevice = async (deviceId: number, newUid: string, newName: string) => {
    if (!childId) return
    
    try {
      setSaving(true)
      const response = await fetch(`/api/child/devices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          device_uid: newUid,
          device_name: newName,
        }),
      })

      if (response.ok) {
        toast({
          title: "Cập nhật thành công",
          description: "Thông tin thiết bị đã được cập nhật",
        })
        fetchDevices(childId)
      } else {
        throw new Error('Failed to update device')
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thiết bị",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAddDevice = async () => {
    if (!childId) return
    
    try {
      setSaving(true)
      const response = await fetch(`/api/child/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          device_uid: '',
          device_name: `Thiết bị ${devices.length + 1}`,
        }),
      })

      if (response.ok) {
        toast({
          title: "Thêm thiết bị thành công",
          description: "Thiết bị mới đã được thêm vào danh sách",
        })
        fetchDevices(childId)
      } else {
        throw new Error('Failed to add device')
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm thiết bị",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDevice = async (deviceId: number) => {
    if (!childId) return
    if (!confirm('Bạn có chắc muốn xóa thiết bị này?')) return
    
    try {
      setSaving(true)
      const response = await fetch(`/api/child/devices?deviceId=${deviceId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Xóa thành công",
          description: "Thiết bị đã được xóa",
        })
        fetchDevices(childId)
      } else {
        throw new Error('Failed to delete device')
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa thiết bị",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-blue-600" />
              Quản lý thiết bị
            </CardTitle>
            <CardDescription>
              Quản lý các thiết bị kết nối của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {devices.map((device, index) => (
              <DeviceCard
                key={device.id}
                device={device}
                onUpdate={handleUpdateDevice}
                onDelete={handleDeleteDevice}
                saving={saving}
              />
            ))}

            {devices.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Chưa có thiết bị nào được đăng ký
              </div>
            )}

            <Button
              onClick={handleAddDevice}
              disabled={saving}
              className="w-full"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm thiết bị mới
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface DeviceCardProps {
  device: Device
  onUpdate: (id: number, uid: string, name: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
  saving: boolean
}

function DeviceCard({ device, onUpdate, onDelete, saving }: DeviceCardProps) {
  const [uid, setUid] = useState(device.device_uid)
  const [name, setName] = useState(device.device_name)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = async () => {
    await onUpdate(device.id, uid, name)
    setIsEditing(false)
  }

  return (
    <Card className="bg-gray-50">
      <CardContent className="p-4 space-y-3">
        <div className="grid gap-3">
          <div>
            <Label htmlFor={`name-${device.id}`}>Tên thiết bị</Label>
            <Input
              id={`name-${device.id}`}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setIsEditing(true)
              }}
              placeholder="Ví dụ: iPhone của bé"
            />
          </div>
          <div>
            <Label htmlFor={`uid-${device.id}`}>UID thiết bị</Label>
            <Input
              id={`uid-${device.id}`}
              value={uid}
              onChange={(e) => {
                setUid(e.target.value)
                setIsEditing(true)
              }}
              placeholder="Nhập UID thiết bị"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!isEditing || saving}
            size="sm"
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            Lưu thay đổi
          </Button>
          <Button
            onClick={() => onDelete(device.id)}
            disabled={saving}
            size="sm"
            variant="destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
