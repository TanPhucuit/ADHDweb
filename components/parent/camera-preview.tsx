"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { VideoIcon, VideoOffIcon, ExpandIcon, ShrinkIcon, SettingsIcon } from "@/components/ui/icons"

interface CameraPreviewProps {
  childName?: string
}

export function CameraPreview({ childName }: CameraPreviewProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // Check camera permission on mount
    checkCameraPermission()

    return () => {
      // Cleanup stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: "camera" as PermissionName })
      setHasPermission(result.state === "granted")
    } catch (error) {
      console.log("Permission API not supported")
      setHasPermission(null)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsStreaming(true)
        setHasPermission(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setHasPermission(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsStreaming(false)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 ${
        isFullscreen ? "fixed inset-4 z-50 bg-black" : "bg-white shadow-lg border border-gray-200"
      }`}
    >
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center gap-2">
            <VideoIcon className="w-5 h-5" />
            <h3 className="font-medium">Camera Preview {childName && `- ${childName}`}</h3>
          </div>

          <div className="flex items-center gap-2">
            {isStreaming && (
              <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                {isFullscreen ? <ShrinkIcon className="w-4 h-4" /> : <ExpandIcon className="w-4 h-4" />}
              </Button>
            )}

            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <SettingsIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Video Container */}
        <div className={`relative ${isFullscreen ? "h-[calc(100vh-120px)]" : "h-48 sm:h-64"}`}>
          {isStreaming ? (
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover bg-gray-900" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
                  <VideoOffIcon className="w-8 h-8 text-gray-500" />
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Camera không hoạt động</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    {hasPermission === false ? "Không có quyền truy cập camera" : "Nhấn để bắt đầu theo dõi"}
                  </p>

                  {hasPermission !== false && (
                    <Button onClick={startCamera} className="bg-blue-500 hover:bg-blue-600">
                      <VideoIcon className="w-4 h-4 mr-2" />
                      Bật Camera
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Live indicator */}
          {isStreaming && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
          )}

          {/* Recording time */}
          {isStreaming && (
            <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs font-mono">
              {new Date().toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Controls */}
        {isStreaming && (
          <div className="p-3 bg-gray-50 border-t flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Đang kết nối
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={stopCamera}
              className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
            >
              <VideoOffIcon className="w-4 h-4 mr-2" />
              Tắt Camera
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
