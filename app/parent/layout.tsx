import type React from "react"
import { DeviceCheckWrapper } from "@/components/device/device-check-wrapper"

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DeviceCheckWrapper>{children}</DeviceCheckWrapper>
}
