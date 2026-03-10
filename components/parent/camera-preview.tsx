"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { VideoIcon, VideoOffIcon, ExpandIcon, ShrinkIcon, SettingsIcon } from "@/components/ui/icons"

interface CameraPreviewProps {
  childName?: string
  childId?: string
}

// mjpeg = img tag stream, iframe = embedded web player (MediaMTX, HLS page, etc.)
type StreamType = 'youtube' | 'mjpeg' | 'iframe' | 'rtsp' | 'none'

export function CameraPreview({ childName, childId }: CameraPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Live stream state
  const [dbUrl, setDbUrl] = useState<string>("")
  const [activeUrl, setActiveUrl] = useState<string>("")
  const [isLoadingLiveId, setIsLoadingLiveId] = useState(false)
  const [streamType, setStreamType] = useState<StreamType>('none')
  const [streamError, setStreamError] = useState<string>("")

  // Settings panel
  const [showSettings, setShowSettings] = useState(false)
  const [manualUrl, setManualUrl] = useState<string>("")

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (!childId) return
    const fetchLiveId = async () => {
      setIsLoadingLiveId(true)
      setStreamError("")
      try {
        const response = await fetch(`/api/camera/live?childId=${childId}`)
        const result = await response.json()
        const liveLink = result.data?.liveLink || result.liveLink || "https://raspberrypi-2.tail224a11.ts.net/cam/"
        setDbUrl(liveLink)
        setManualUrl(liveLink)
        applyUrl(liveLink)
      } catch {
        setStreamError('Lỗi khi tải thông tin camera')
        setStreamType('none')
      } finally {
        setIsLoadingLiveId(false)
      }
    }
    fetchLiveId()
  }, [childId])

  const detectStreamType = (url: string): StreamType => {
    const u = url.trim().toLowerCase()
    if (!u) return 'none'
    if (u.startsWith('rtsp://') || u.startsWith('rtsps://')) return 'rtsp'
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube'
    // MJPEG streams usually end with .mjpg / .mjpeg or have mjpeg in path
    if (u.match(/\.(mjpg|mjpeg)(\?.*)?$/) || u.includes('/stream.mjpg') || u.includes('action=stream')) return 'mjpeg'
    // Any other http/https URL → embed in iframe (covers MediaMTX, HLS pages, etc.)
    if (u.startsWith('http://') || u.startsWith('https://')) return 'iframe'
    return 'none'
  }

  const buildEmbedUrl = (url: string, type: StreamType): string => {
    if (type !== 'youtube') return url
    try {
      const u = new URL(url)
      if (u.hostname === 'youtu.be') {
        const id = u.pathname.substring(1)
        return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : ""
      }
      if (u.hostname.includes('youtube.com')) {
        const v = u.searchParams.get('v')
        if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`
        if (u.pathname.startsWith('/embed/')) return url
      }
    } catch {}
    return url
  }

  const applyUrl = (url: string) => {
    setStreamError("")
    const type = detectStreamType(url)
    setStreamType(type)
    setActiveUrl(buildEmbedUrl(url, type))
  }

  const handleApplyManual = () => {
    if (!manualUrl.trim()) return
    applyUrl(manualUrl.trim())
    setShowSettings(false)
  }

  const badgeLabel: Record<StreamType, string | null> = {
    youtube: 'YOUTUBE LIVE',
    mjpeg: 'RASPI LIVE',
    iframe: 'RASPI LIVE',
    rtsp: null,
    none: null,
  }

  const badgeColor: Record<StreamType, string> = {
    youtube: 'bg-red-500',
    mjpeg: 'bg-green-500',
    iframe: 'bg-green-500',
    rtsp: '',
    none: '',
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
            <Button
              variant="ghost" size="sm"
              onClick={() => setIsFullscreen(f => !f)}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <ShrinkIcon className="w-4 h-4" /> : <ExpandIcon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost" size="sm"
              onClick={() => setShowSettings(s => !s)}
              className="text-white hover:bg-white/20"
            >
              <SettingsIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 bg-gray-50 border-b space-y-3">
            <p className="text-xs font-semibold text-gray-600">Cấu hình nguồn camera</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualUrl}
                onChange={e => setManualUrl(e.target.value)}
                placeholder="https://raspberrypi-2.tail224a11.ts.net/cam/"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                onKeyDown={e => e.key === 'Enter' && handleApplyManual()}
              />
              <button
                onClick={handleApplyManual}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Áp dụng
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Hỗ trợ: HTTP (MediaMTX, HLS), MJPEG, YouTube. RTSP cần relay qua MediaMTX.
            </p>
            {dbUrl && dbUrl !== manualUrl && (
              <button
                onClick={() => { setManualUrl(dbUrl); applyUrl(dbUrl); setShowSettings(false) }}
                className="text-xs text-blue-500 hover:underline"
              >
                Khôi phục URL từ database: {dbUrl}
              </button>
            )}
          </div>
        )}

        {/* Video Container */}
        <div className={`relative ${isFullscreen ? "h-[calc(100vh-120px)]" : "aspect-video"}`}>
          {isLoadingLiveId ? (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-600">Đang tải camera...</p>
              </div>
            </div>

          ) : streamError ? (
            <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
              <div className="text-center space-y-3 p-6">
                <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto">
                  <VideoOffIcon className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="font-medium text-red-700">Lỗi kết nối</h4>
                <p className="text-sm text-red-600">{streamError}</p>
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Nhập URL thủ công
                </button>
              </div>
            </div>

          ) : streamType === 'youtube' && activeUrl ? (
            <iframe
              src={activeUrl}
              title="Camera Live Stream"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

          ) : streamType === 'iframe' && activeUrl ? (
            // MediaMTX WebRTC page, HLS player pages, etc.
            <iframe
              src={activeUrl}
              title="Camera Live Stream"
              className="w-full h-full border-0"
              allow="autoplay; fullscreen"
              allowFullScreen
            />

          ) : streamType === 'mjpeg' && activeUrl ? (
            // MJPEG stream via img tag
            <div className="w-full h-full bg-black flex items-center justify-center">
              <img
                src={activeUrl}
                alt="MJPEG Camera Stream"
                className="w-full h-full object-contain"
                onError={() => setStreamError('Không thể kết nối MJPEG stream. Kiểm tra URL và kết nối mạng.')}
              />
            </div>

          ) : streamType === 'rtsp' ? (
            // RTSP cannot be played directly in browser
            <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-6">
              <div className="text-center space-y-3 max-w-xs">
                <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto">
                  <VideoOffIcon className="w-8 h-8 text-amber-700" />
                </div>
                <h4 className="font-semibold text-amber-800">RTSP không hỗ trợ trực tiếp</h4>
                <p className="text-sm text-amber-700">
                  Trình duyệt không thể phát RTSP. Cài <b>MediaMTX</b> trên Raspberry Pi và dùng URL WebRTC:
                </p>
                <code className="block text-xs bg-amber-100 rounded px-2 py-1 text-amber-900 break-all">
                  http://&lt;ip&gt;:8889/&lt;stream&gt;
                </code>
              </div>
            </div>

          ) : (
            // No stream configured
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
                  <VideoOffIcon className="w-8 h-8 text-gray-500" />
                </div>
                <h4 className="font-medium text-gray-700">Chưa có camera</h4>
                <p className="text-sm text-gray-500">Nhấn cài đặt để nhập URL stream</p>
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Cài đặt URL
                </button>
              </div>
            </div>
          )}

          {/* Live badge */}
          {badgeLabel[streamType] && !streamError && activeUrl && (
            <div className={`absolute top-3 left-3 flex items-center gap-2 ${badgeColor[streamType]} text-white px-2 py-1 rounded-full text-xs font-medium`}>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {badgeLabel[streamType]}
            </div>
          )}
        </div>

        {/* Info bar */}
        {activeUrl && streamType !== 'none' && !isLoadingLiveId && (
          <div className="p-3 bg-gray-50 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <div className={`w-2 h-2 rounded-full ${streamType === 'rtsp' ? 'bg-amber-500' : 'bg-green-500'}`} />
                <span>
                  {streamType === 'youtube' && 'YouTube Live'}
                  {streamType === 'mjpeg' && 'MJPEG — Raspberry Pi'}
                  {streamType === 'iframe' && 'Đang phát live từ Raspberry Pi'}
                  {streamType === 'rtsp' && 'RTSP (cần relay)'}
                </span>
              </div>
              <span className="text-gray-400 text-xs truncate max-w-[200px]" title={activeUrl}>
                {activeUrl}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
