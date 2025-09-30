"use client"

import type { Child } from "@/lib/types"
import { useState, useEffect } from "react"
import { dataStore } from "@/lib/data-store"
import { Watch, Battery, Wifi, WifiOff, Bluetooth, Signal } from "lucide-react"

interface DeviceStatusProps {
  child: Child
}

export function DeviceStatus({ child }: DeviceStatusProps) {
  const [device, setDevice] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDevice = async () => {
      const deviceData = await dataStore.getDevice(child.id)
      setDevice(deviceData)
      setIsLoading(false)
    }

    loadDevice()

    // Update device status every 30 seconds
    const interval = setInterval(loadDevice, 30000)
    return () => clearInterval(interval)
  }, [child.id])

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!device) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="text-center py-4">
          <Watch className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Không tìm thấy thiết bị</p>
        </div>
      </div>
    )
  }

  const getBatteryColor = (level: number) => {
    if (level > 50) return "text-green-600"
    if (level > 20) return "text-yellow-600"
    return "text-red-600"
  }

  const getBatteryBgColor = (level: number) => {
    if (level > 50) return "bg-green-500"
    if (level > 20) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-600"
      case "disconnected":
        return "text-red-600"
      case "syncing":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "Đang kết nối"
      case "disconnected":
        return "Mất kết nối"
      case "syncing":
        return "Đang đồng bộ"
      default:
        return "Không xác định"
    }
  }

  const timeSinceSync = device.lastSync ? Math.floor((Date.now() - new Date(device.lastSync).getTime()) / 60000) : null

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Watch className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{device.name}</h2>
            <p className="text-sm text-gray-600">Smartwatch • v{device.firmwareVersion}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {device.status === "connected" ? (
            <Wifi className="w-5 h-5 text-green-600" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-600" />
          )}
          <span className={`text-sm font-medium ${getStatusColor(device.status)}`}>{getStatusText(device.status)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Battery Status */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Battery className={`w-5 h-5 ${getBatteryColor(device.batteryLevel)}`} />
              <span className="text-sm font-medium text-gray-700">Pin</span>
            </div>
            <span className={`text-lg font-bold ${getBatteryColor(device.batteryLevel)}`}>{device.batteryLevel}%</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getBatteryBgColor(device.batteryLevel)}`}
              style={{ width: `${device.batteryLevel}%` }}
            />
          </div>

          <p className="text-xs text-gray-500 mt-2">{device.batteryLevel > 20 ? "Pin đủ dùng" : "Cần sạc pin"}</p>
        </div>

        {/* Connection Status */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Signal className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Kết nối</span>
          </div>

          <div className="flex items-center space-x-2 mb-2">
            <div
              className={`w-2 h-2 rounded-full ${device.status === "connected" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
            />
            <span className={`text-sm font-medium ${getStatusColor(device.status)}`}>
              {getStatusText(device.status)}
            </span>
          </div>

          <p className="text-xs text-gray-500">Bluetooth • WiFi</p>
        </div>

        {/* Sync Status */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Bluetooth className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Đồng bộ</span>
          </div>

          <p className="text-sm font-medium text-gray-900">
            {timeSinceSync !== null ? (timeSinceSync < 1 ? "Vừa xong" : `${timeSinceSync} phút trước`) : "Chưa đồng bộ"}
          </p>

          <p className="text-xs text-gray-500 mt-1">Dữ liệu mới nhất</p>
        </div>
      </div>

      {/* Device Actions */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Trạng thái thiết bị</span>
          <div className="flex space-x-2">
            <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
              Đồng bộ ngay
            </button>
            <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
              Cài đặt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
