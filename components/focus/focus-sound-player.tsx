"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Heart,
  Waves,
  TreePine,
  Cloud,
  Zap,
  Music,
  Brain,
  Timer,
} from "lucide-react"

interface SoundTrack {
  id: string
  name: string
  description: string
  category: "nature" | "white_noise" | "binaural" | "ambient"
  icon: React.ReactNode
  color: string
  duration?: number // in seconds, undefined for loops
  benefits: string[]
  youtubeId: string // YouTube video ID
}

const soundTracks: SoundTrack[] = [
  {
    id: "lofi_study",
    name: "Lofi Study Music",
    description: "Nhạc lo-fi giúp tập trung học tập",
    category: "ambient",
    icon: <Music className="w-5 h-5" />,
    color: "bg-indigo-500",
    benefits: ["Tăng tập trung", "Giảm căng thẳng", "Tạo không khí học tập"],
    youtubeId: "RG2IK8oRZNA",
  },
  {
    id: "peaceful_piano",
    name: "Peaceful Piano",
    description: "Nhạc piano êm dịu, thư giãn",
    category: "ambient",
    icon: <Music className="w-5 h-5" />,
    color: "bg-purple-500",
    benefits: ["Thư giãn tâm trí", "Cải thiện sáng tạo", "Giảm lo âu"],
    youtubeId: "qQzf-xzZO7M",
  },
  {
    id: "study_beats",
    name: "Study Beats",
    description: "Nhạc nền tập trung cho học tập",
    category: "ambient",
    icon: <Brain className="w-5 h-5" />,
    color: "bg-rose-500",
    benefits: ["Tăng hiệu suất", "Duy trì động lực", "Tập trung sâu"],
    youtubeId: "R1r9nLYcqBU",
  },
]

interface FocusSoundPlayerProps {
  onPlayingChange?: (isPlaying: boolean, trackName?: string) => void
  autoStartWithPomodoro?: boolean
}

export function FocusSoundPlayer({ onPlayingChange, autoStartWithPomodoro = false }: FocusSoundPlayerProps) {
  const [currentTrack, setCurrentTrack] = useState<SoundTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([70])
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>("ambient")

  const playerRef = useRef<any>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  const handlePlayingChangeCallback = useCallback(
    (isPlaying: boolean, trackName?: string) => {
      onPlayingChange?.(isPlaying, trackName)
    },
    [onPlayingChange],
  )

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }
  }, [])

  useEffect(() => {
    // Auto-start with a focus-friendly track when Pomodoro starts
    if (autoStartWithPomodoro && !currentTrack) {
      const defaultTrack = soundTracks[0]
      if (defaultTrack) {
        handleTrackSelect(defaultTrack)
      }
    }
  }, [autoStartWithPomodoro, currentTrack])

  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      const vol = isMuted ? 0 : volume[0]
      playerRef.current.setVolume(vol)
    }
  }, [volume, isMuted])

  useEffect(() => {
    handlePlayingChangeCallback(isPlaying, currentTrack?.name)
  }, [isPlaying, currentTrack?.name, handlePlayingChangeCallback])

  useEffect(() => {
    // Update progress
    if (isPlaying && playerRef.current?.getCurrentTime) {
      progressInterval.current = setInterval(() => {
        if (playerRef.current?.getCurrentTime && playerRef.current?.getDuration) {
          setCurrentTime(playerRef.current.getCurrentTime())
          setDuration(playerRef.current.getDuration())
        }
      }, 1000)
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [isPlaying])

  const onPlayerReady = (event: any) => {
    playerRef.current = event.target
    playerRef.current.setVolume(volume[0])
    if (isPlaying) {
      playerRef.current.playVideo()
    }
  }

  const onPlayerStateChange = (event: any) => {
    // 1 = playing, 2 = paused, 0 = ended
    if (event.data === 1) {
      setIsPlaying(true)
    } else if (event.data === 2) {
      setIsPlaying(false)
    } else if (event.data === 0) {
      // Ended - loop the video
      playerRef.current?.playVideo()
    }
  }

  const handleTrackSelect = (track: SoundTrack) => {
    if (currentTrack?.id === track.id) {
      handlePlayPause()
      return
    }

    setCurrentTrack(track)
    setCurrentTime(0)
    setIsPlaying(true)

    // If player exists, load new video
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(track.youtubeId)
      playerRef.current.playVideo()
    }
  }

  const handlePlayPause = () => {
    if (!playerRef.current || !currentTrack) return

    if (isPlaying) {
      playerRef.current.pauseVideo()
      setIsPlaying(false)
    } else {
      playerRef.current.playVideo()
      setIsPlaying(true)
    }
  }

  const handleStop = () => {
    if (playerRef.current) {
      playerRef.current.pauseVideo()
      playerRef.current.seekTo(0)
      setCurrentTime(0)
      setIsPlaying(false)
    }
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
    if (playerRef.current?.setVolume) {
      playerRef.current.setVolume(isMuted ? 0 : newVolume[0])
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const categories = [
    { id: "nature", name: "Thiên nhiên", icon: <TreePine className="w-4 h-4" /> },
    { id: "white_noise", name: "White Noise", icon: <Zap className="w-4 h-4" /> },
    { id: "binaural", name: "Binaural", icon: <Brain className="w-4 h-4" /> },
    { id: "ambient", name: "Nhạc nền", icon: <Music className="w-4 h-4" /> },
  ]

  const filteredTracks = soundTracks.filter((track) => track.category === selectedCategory)

  // Initialize YouTube Player
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initPlayer = () => {
      if ((window as any).YT && (window as any).YT.Player && !playerRef.current) {
        playerRef.current = new (window as any).YT.Player('youtube-player', {
          height: '1',
          width: '1',
          videoId: soundTracks[0].youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            loop: 1,
            playlist: soundTracks[0].youtubeId,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
        })
      }
    }

    if ((window as any).YT) {
      initPlayer()
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Hidden YouTube Player */}
      <div style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}>
        <div id="youtube-player" />
      </div>

      {/* Current Playing Card */}
      {currentTrack && (
        <Card className="border-2 border-blue-200 bg-white/95 backdrop-blur shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className={`p-3 rounded-full ${currentTrack.color} text-white shadow-lg`}>{currentTrack.icon}</div>
              <span className="font-bold text-gray-900 drop-shadow-sm">🎵 Đang phát: {currentTrack.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-base text-gray-800 font-semibold drop-shadow-sm">{currentTrack.description}</p>

              {/* Benefits */}
              <div className="flex flex-wrap gap-2">
                {currentTrack.benefits.map((benefit, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-sm font-bold border-2 border-blue-400 text-blue-900 bg-blue-100 drop-shadow-sm"
                  >
                    {benefit}
                  </Badge>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={handlePlayPause}
                  size="lg"
                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>

                <Button
                  onClick={handleStop}
                  variant="outline"
                  size="sm"
                  className="border-2 border-gray-300 font-bold hover:bg-gray-100 bg-transparent"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-2 flex-1">
                  <Button onClick={toggleMute} variant="ghost" size="sm" className="hover:bg-gray-100">
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-gray-700" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-gray-700" />
                    )}
                  </Button>
                  <Slider
                    value={volume}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="flex-1 max-w-32"
                  />
                  <span className="text-sm font-bold text-gray-800 w-12">{volume[0]}%</span>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-gray-900 drop-shadow-sm">
                  <span>{formatTime(currentTime)}</span>
                  <span>{duration > 0 ? formatTime(duration) : "∞"}</span>
                </div>
                {duration > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sound Library */}
      <Card className="border-2 border-purple-200 bg-white/95 backdrop-blur shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Music className="w-6 h-6 text-purple-600" />
            <span className="font-bold text-gray-900 drop-shadow-sm">🎼 Thư viện âm thanh tập trung</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center gap-2 font-bold text-gray-800 data-[state=active]:bg-white data-[state=active]:text-purple-800 data-[state=active]:shadow-md rounded-lg drop-shadow-sm"
                >
                  {category.icon}
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTracks.map((track) => (
                    <Card
                      key={track.id}
                      className={`cursor-pointer transition-all hover:shadow-lg border-2 bg-white/90 backdrop-blur ${
                        currentTrack?.id === track.id
                          ? "ring-4 ring-purple-400 border-purple-300"
                          : "border-gray-200 hover:border-purple-200"
                      }`}
                      onClick={() => handleTrackSelect(track)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-full ${track.color} text-white flex-shrink-0 shadow-lg`}>
                            {track.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2 drop-shadow-sm">
                              {track.name}
                              {currentTrack?.id === track.id && isPlaying && (
                                <div className="flex gap-1">
                                  <div className="w-1 h-4 bg-purple-500 rounded-full animate-pulse" />
                                  <div className="w-1 h-4 bg-purple-500 rounded-full animate-pulse delay-100" />
                                  <div className="w-1 h-4 bg-purple-500 rounded-full animate-pulse delay-200" />
                                </div>
                              )}
                            </h4>
                            <p className="text-sm text-gray-700 font-semibold mt-1 drop-shadow-sm">
                              {track.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {track.benefits.slice(0, 2).map((benefit, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs font-bold bg-gray-200 text-gray-800 border border-gray-400 drop-shadow-sm"
                                >
                                  {benefit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-2 border-green-200 bg-white/95 backdrop-blur shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Timer className="w-6 h-6 text-green-600" />
            <span className="font-bold text-gray-900 drop-shadow-sm">💡 Mẹo sử dụng âm thanh tập trung</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
              <p className="text-gray-900 font-semibold drop-shadow-sm">
                <strong className="text-blue-800">Âm thanh thiên nhiên:</strong> Tốt nhất cho việc đọc sách và làm bài
                tập yêu cầu sự tập trung cao.
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-3 h-3 bg-purple-500 rounded-full mt-1 flex-shrink-0" />
              <p className="text-gray-900 font-semibold drop-shadow-sm">
                <strong className="text-purple-800">Binaural beats:</strong> Sử dụng tai nghe để có hiệu quả tốt nhất,
                giúp tăng cường hoạt động não bộ.
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-3 h-3 bg-gray-500 rounded-full mt-1 flex-shrink-0" />
              <p className="text-gray-900 font-semibold drop-shadow-sm">
                <strong className="text-gray-800">White/Pink Noise:</strong> Hiệu quả trong việc che tiếng ồn xung
                quanh, tạo môi trường học tập yên tĩnh.
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="w-3 h-3 bg-orange-500 rounded-full mt-1 flex-shrink-0" />
              <p className="text-gray-900 font-semibold drop-shadow-sm">
                <strong className="text-orange-800">Âm lượng:</strong> Giữ ở mức 30-50% để không làm mất tập trung, có
                thể điều chỉnh theo sở thích cá nhân.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
