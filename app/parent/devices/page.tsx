"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoBackButton } from "@/components/ui/go-back-button"
import { Smartphone, Edit2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Device {
  id: number
  child_id: number
  device_uid: string
  device_name: string
  created_at: string
  childName: string
}

export default function ParentDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [parentId, setParentId] = useState<string | null>(null)
  const [editingDevice, setEditingDevice] = useState<number | null>(null)
  const [editUid, setEditUid] = useState("")
  const [editName, setEditName] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const storedUser = localStorage.getItem('adhd-dashboard-user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        if (userData.role === 'parent') {
          const parentIdStr = userData?.id ? String(userData.id) : ''
          setParentId(parentIdStr)
          if (parentIdStr) fetchDevices(parentIdStr)
        }
      } catch (e) {
        console.error('Error parsing user:', e)
      }
    }
    setLoading(false)
  }, [])

  const fetchDevices = async (id: string) => {
    try {
      console.log('📱 Fetching devices for parent:', id)
      const response = await fetch(`/api/parent/devices?parentId=${id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('📱 Devices fetched:', data.devices?.length || 0, 'devices', data.devices)
        setDevices(data.devices || [])
        
        if (!data.devices || data.devices.length === 0) {
          console.warn('⚠️ No devices found for parent. Check:')
          console.warn('1. Parent has children in database')
          console.warn('2. Children have devices in database')
          console.warn('3. Column names match (child_id, parentid)')
        }
      } else {
        console.error('❌ Failed to fetch devices:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('❌ Error fetching devices:', error)
    }
  }

  const handleEdit = (device: Device) => {
    setEditingDevice(device.id)
    setEditUid(device.device_uid)
    setEditName(device.device_name)
  }

  const handleSave = async (deviceId: number) => {
    if (!parentId) return
    
    try {
      setSaving(true)
      const response = await fetch(`/api/parent/devices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          device_uid: editUid,
          device_name: editName,
        }),
      })

      if (response.ok) {
        toast({
          title: "Cập nhật thành công",
          description: "Thông tin thiết bị đã được cập nhật",
        })
        fetchDevices(parentId)
        setEditingDevice(null)
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
        <GoBackButton />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-blue-600" />
              Quản lý thiết bị của con
            </CardTitle>
            <CardDescription>
              Xem và chỉnh sửa thông tin thiết bị của con bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {devices.map((device) => (
              <Card key={device.id} className="bg-gray-50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-8 h-8 text-primary" />
                      <div>
                        <h3 className="font-medium">{device.device_name}</h3>
                        <p className="text-sm text-muted-foreground">Của: {device.childName}</p>
                      </div>
                    </div>
                    {editingDevice === device.id ? (
                      <Button
                        size="sm"
                        onClick={() => handleSave(device.id)}
                        disabled={saving}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Lưu
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(device)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Sửa
                      </Button>
                    )}
                  </div>

                  {editingDevice === device.id ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`name-${device.id}`}>Tên thiết bị</Label>
                        <Input
                          id={`name-${device.id}`}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Tên thiết bị"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`uid-${device.id}`}>UID thiết bị</Label>
                        <Input
                          id={`uid-${device.id}`}
                          value={editUid}
                          onChange={(e) => setEditUid(e.target.value)}
                          placeholder="UID thiết bị"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>UID: {device.device_uid || '(chưa thiết lập)'}</p>
                      <p>ID: {device.id}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {devices.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Chưa có thiết bị nào
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
