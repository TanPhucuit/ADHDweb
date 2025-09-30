"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DeviceConnectionModal } from "./device-connection-modal"

interface DeviceCheckWrapperProps {
  children: React.ReactNode
}

export function DeviceCheckWrapper({ children }: DeviceCheckWrapperProps) {
  const [showDeviceModal, setShowDeviceModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasDevices, setHasDevices] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkUserDevices()
  }, [])

  const checkUserDevices = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      // Check if user has any connected devices
      const { data: devices, error } = await supabase
        .from("devices")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_connected", true)

      if (error) {
        console.error("Error checking devices:", error)
        setIsLoading(false)
        return
      }

      const hasConnectedDevices = devices && devices.length > 0
      setHasDevices(hasConnectedDevices)

      // Show device connection modal if no devices found
      if (!hasConnectedDevices) {
        setShowDeviceModal(true)
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error in device check:", error)
      setIsLoading(false)
    }
  }

  const handleDeviceConnected = (device: any) => {
    setHasDevices(true)
    setShowDeviceModal(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      {children}
      <DeviceConnectionModal
        isOpen={showDeviceModal}
        onClose={() => setShowDeviceModal(false)}
        onDeviceConnected={handleDeviceConnected}
      />
    </>
  )
}
