"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { QrCodeIcon, SmartphoneIcon, CheckIcon } from "@/components/ui/icons"
import QRCode from "qrcode"

interface DeviceConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  onDeviceConnected: (device: any) => void
}

export function DeviceConnectionModal({ isOpen, onClose, onDeviceConnected }: DeviceConnectionModalProps) {
  const [step, setStep] = useState<"scan" | "name" | "child-setup">("scan")
  const [deviceName, setDeviceName] = useState("")
  const [childName, setChildName] = useState("")
  const [childAge, setChildAge] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [pairingCode, setPairingCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen && step === "scan") {
      generatePairingCode()
    }
  }, [isOpen, step])

  const generatePairingCode = async () => {
    const code = Math.random().toString(36).substring(2, 15)
    setPairingCode(code)

    // Generate QR code with pairing information
    const pairingData = {
      type: "adhd_assistant_pairing",
      code: code,
      timestamp: Date.now(),
    }

    try {
      const qrUrl = await QRCode.toDataURL(JSON.stringify(pairingData))
      setQrCodeUrl(qrUrl)
    } catch (error) {
      console.error("Error generating QR code:", error)
    }
  }

  const handleDeviceNaming = async () => {
    if (!deviceName.trim()) return

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Create device record
      const { data: device, error } = await supabase
        .from("devices")
        .insert({
          user_id: user.id,
          device_name: deviceName,
          device_type: "smartwatch",
          device_id: `smartwatch_${pairingCode}`,
          pairing_code: pairingCode,
          is_connected: true,
          last_connected_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      setStep("child-setup")
    } catch (error) {
      console.error("Error creating device:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChildSetup = async () => {
    if (!childName.trim()) return

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Get the device we just created
      const { data: device } = await supabase.from("devices").select("*").eq("pairing_code", pairingCode).single()

      if (!device) throw new Error("Device not found")

      // Create child profile
      const { data: childProfile, error } = await supabase
        .from("child_profiles")
        .insert({
          parent_id: user.id,
          device_id: device.id,
          child_name: childName,
          age: childAge ? Number.parseInt(childAge) : null,
        })
        .select()
        .single()

      if (error) throw error

      onDeviceConnected({ device, childProfile })
      onClose()
    } catch (error) {
      console.error("Error creating child profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case "scan":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-64 h-64 bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <QrCodeIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              <p className="mt-4 text-sm text-gray-600">Quét mã QR này bằng smartwatch để kết nối</p>
              <p className="text-xs text-gray-500 mt-2">
                Mã ghép nối: <span className="font-mono font-bold">{pairingCode}</span>
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => setStep("name")} className="w-full">
                <CheckIcon className="w-4 h-4 mr-2" />
                Đã quét thành công
              </Button>
              <Button variant="outline" onClick={generatePairingCode} className="w-full bg-transparent">
                Tạo mã mới
              </Button>
            </div>
          </div>
        )

      case "name":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <SmartphoneIcon className="w-16 h-16 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold">Đặt tên cho thiết bị</h3>
              <p className="text-sm text-gray-600">Đặt tên dễ nhớ cho smartwatch của bạn</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="device-name">Tên thiết bị</Label>
                <Input
                  id="device-name"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="VD: Smartwatch của Minh"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("scan")} className="flex-1">
                  Quay lại
                </Button>
                <Button onClick={handleDeviceNaming} disabled={!deviceName.trim() || isLoading} className="flex-1">
                  {isLoading ? "Đang xử lý..." : "Tiếp tục"}
                </Button>
              </div>
            </div>
          </div>
        )

      case "child-setup":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Tạo tài khoản cho con</h3>
              <p className="text-sm text-gray-600">Thiết lập thông tin cơ bản cho con bạn</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="child-name">Tên con</Label>
                <Input
                  id="child-name"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="VD: Nguyễn Minh An"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="child-age">Tuổi (tùy chọn)</Label>
                <Input
                  id="child-age"
                  type="number"
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  placeholder="VD: 8"
                  className="mt-1"
                  min="3"
                  max="18"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("name")} className="flex-1">
                  Quay lại
                </Button>
                <Button onClick={handleChildSetup} disabled={!childName.trim() || isLoading} className="flex-1">
                  {isLoading ? "Đang tạo..." : "Hoàn thành"}
                </Button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kết nối Smartwatch</DialogTitle>
        </DialogHeader>

        <Card>
          <CardContent className="pt-6">{renderStepContent()}</CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
