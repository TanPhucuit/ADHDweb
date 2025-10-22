"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { VideoIcon, VideoOffIcon, ExpandIcon, ShrinkIcon, SettingsIcon } from "@/components/ui/icons"

interface CameraPreviewProps {
  childName?: string
  childId?: string
}

type StreamType = 'youtube' | 'raspi' | 'local' | 'none'

export function CameraPreview({ childName, childId }: CameraPreviewProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Live stream state
  const [liveId, setLiveId] = useState<string | null>(null)
  const [isLoadingLiveId, setIsLoadingLiveId] = useState(false)
  const [embedUrl, setEmbedUrl] = useState<string>("")
  const [streamType, setStreamType] = useState<StreamType>('none')
  const [raspiStreamUrl, setRaspiStreamUrl] = useState<string>("")
  const [streamError, setStreamError] = useState<string>("")

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

  // Fetch liveid from database when childId changes
  useEffect(() => {
    if (!childId) return

    const fetchLiveId = async () => {
      setIsLoadingLiveId(true)
      setStreamError("")
      try {
        const response = await fetch(`/api/camera/live?childId=${childId}`)
        const result = await response.json()
        
        console.log('API Response:', result)
        
        // API returns {data: {liveLink: "..."}} so we need to access result.data.liveLink
        const liveLink = result.data?.liveLink || result.liveLink
        
        if (liveLink) {
          setLiveId(liveLink)
          
          // Detect stream type based on URL
          const streamTypeDetected = detectStreamType(liveLink)
          setStreamType(streamTypeDetected)
          
          console.log('Detected stream type:', streamTypeDetected)
          console.log('Original URL:', liveLink)
          
          if (streamTypeDetected === 'youtube') {
            // Parse and set embed URL for YouTube
            const parsed = parseVideoEmbedUrl(liveLink)
            console.log('Parsed embed URL:', parsed)
            if (parsed) {
              setEmbedUrl(parsed)
            } else {
              console.warn('Could not parse YouTube URL:', liveLink)
              setStreamError('Không thể phân tích URL YouTube')
            }
          } else if (streamTypeDetected === 'raspi') {
            // For Raspi stream, use the URL directly
            setRaspiStreamUrl(liveLink)
            console.log('Raspi stream URL set:', liveLink)
          }
        } else {
          console.warn('No liveLink found in API response')
          setStreamType('none')
        }
      } catch (error) {
        console.error('Error fetching live ID:', error)
        setStreamError('Lỗi khi tải thông tin camera')
        setStreamType('none')
      } finally {
        setIsLoadingLiveId(false)
      }
    }

    fetchLiveId()
  }, [childId])

  const detectStreamType = (url: string): StreamType => {
    try {
      const urlLower = url.toLowerCase()
      
      // Check for YouTube
      if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
        return 'youtube'
      }
      
      // Check for Raspberry Pi stream (HTTP/HTTPS with common ports or paths)
      // Patterns: http://raspberrypi:8080/stream, http://192.168.x.x:8080, etc.
      if (urlLower.match(/^https?:\/\/.*(:\d+)?(\/stream|\/video|\.mjpg|\.mjpeg)/i)) {
        return 'raspi'
      }
      
      // Check for IP address with port (likely Raspi)
      if (urlLower.match(/^https?:\/\/(\d{1,3}\.){3}\d{1,3}(:\d+)?/)) {
        return 'raspi'
      }
      
      // Default to none
      return 'none'
    } catch (error) {
      console.error('Error detecting stream type:', error)
      return 'none'
    }
  }

  const parseVideoEmbedUrl = (url: string): string => {
    try {
      const u = new URL(url)
      
      // YouTube - youtube.com format
      if (u.hostname.includes("youtube.com")) {
        const v = u.searchParams.get("v")
        if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`
        if (u.pathname.startsWith("/embed/")) return url
      }
      
      // YouTube - youtu.be format
      if (u.hostname === "youtu.be") {
        // pathname is like "/yCGsJuZP8Ck", we need to remove the leading "/"
        const id = u.pathname.substring(1) // Remove leading slash
        if (id) {
          console.log('Extracted YouTube ID from youtu.be:', id)
          return `https://www.youtube.com/embed/${id}?autoplay=1`
        }
      }
      
      // For CNN and other video sites, return empty (cannot embed)
      if (u.hostname.includes("cnn.com")) {
        console.warn('CNN videos cannot be embedded in iframes due to security policies')
        return "" // CNN blocks iframe embedding
      }
      
      // For any other URL, try to use it directly (may not work due to CORS/X-Frame-Options)
      console.log('Using original URL for embedding:', url)
      return url
    } catch (error) {
      console.error('Error parsing video URL:', error)
      return ""
    }
  }

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
        <div className={`relative ${isFullscreen ? "h-[calc(100vh-120px)]" : "aspect-video"}`}>
          {isLoadingLiveId ? (
            // Loading state
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-gray-600">Đang tải camera live...</p>
              </div>
            </div>
          ) : streamError ? (
            // Error state
            <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
              <div className="text-center space-y-4 p-6">
                <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto">
                  <VideoOffIcon className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium text-red-700 mb-2">Lỗi kết nối</h4>
                  <p className="text-sm text-red-600">{streamError}</p>
                </div>
              </div>
            </div>
          ) : isStreaming ? (
            // Local camera stream
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover bg-gray-900" />
          ) : streamType === 'youtube' && embedUrl ? (
            // YouTube live stream
            <iframe
              src={embedUrl}
              title="Camera Live Stream"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : streamType === 'raspi' && raspiStreamUrl ? (
            // Raspberry Pi stream (MJPEG or HLS)
            <div className="w-full h-full relative bg-black">
              <img 
                src={raspiStreamUrl}
                alt="Raspberry Pi Camera Stream"
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error('Error loading Raspi stream:', e)
                  setStreamError('Không thể kết nối đến camera Raspberry Pi. Vui lòng kiểm tra URL và kết nối.')
                }}
              />
              {/* Fallback: If image fails, try video element */}
              <video
                className="hidden w-full h-full object-contain"
                autoPlay
                muted
                playsInline
                onError={(e) => {
                  console.error('Video element also failed:', e)
                }}
              >
                <source src={raspiStreamUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : liveId && !embedUrl ? (
            // Link exists but cannot be embedded (e.g., CNN)
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-yellow-300 rounded-full flex items-center justify-center mx-auto">
                  <VideoOffIcon className="w-8 h-8 text-yellow-700" />
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Không thể nhúng video</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Video không hỗ trợ nhúng trực tiếp. Vui lòng mở link bên dưới.
                  </p>
                  <a 
                    href={liveId} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    Mở video trong tab mới →
                  </a>
                </div>
              </div>
            </div>
          ) : (
            // No camera/stream available
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
                  <VideoOffIcon className="w-8 h-8 text-gray-500" />
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Camera không hoạt động</h4>
                  <p className="text-sm text-gray-500">
                    {hasPermission === false ? "Không có quyền truy cập camera" : "Không có camera live"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Live indicator - Local stream */}
          {isStreaming && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
          )}

          {/* Recording time - Local stream */}
          {isStreaming && (
            <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs font-mono">
              {new Date().toLocaleTimeString()}
            </div>
          )}

          {/* Live Stream indicator - YouTube */}
          {streamType === 'youtube' && embedUrl && !isStreaming && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              YOUTUBE LIVE
            </div>
          )}

          {/* Live Stream indicator - Raspberry Pi */}
          {streamType === 'raspi' && raspiStreamUrl && !isStreaming && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              RASPI LIVE
            </div>
          )}
        </div>

        {/* Info Panel */}
        {liveId && !isLoadingLiveId && (
          <div className="p-3 bg-gray-50 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <div className={`w-2 h-2 rounded-full ${streamType === 'raspi' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>
                  {streamType === 'youtube' && 'Đang phát live từ YouTube'}
                  {streamType === 'raspi' && 'Đang phát live từ Raspberry Pi'}
                  {streamType === 'none' && 'Nguồn không xác định'}
                </span>
              </div>
              <span className="text-gray-500 text-xs truncate max-w-[200px]" title={liveId}>
                {liveId}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
