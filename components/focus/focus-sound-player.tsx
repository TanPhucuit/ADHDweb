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
  audioUrl: string // In real app, this would be actual audio files
}

const soundTracks: SoundTrack[] = [
  {
    id: "rain",
    name: "Tiếng mưa nhẹ",
    description: "Âm thanh mưa rơi nhẹ nhàng, thư giãn",
    category: "nature",
    icon: <Cloud className="w-5 h-5" />,
    color: "bg-blue-500",
    benefits: ["Giảm căng thẳng", "Tăng tập trung", "Che tiếng ồn"],
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/13/audio_257112e4e2.mp3",
  },
  {
    id: "forest",
    name: "Rừng xanh",
    description: "Tiếng chim hót và lá cây xào xạc",
    category: "nature",
    icon: <TreePine className="w-5 h-5" />,
    color: "bg-green-500",
    benefits: ["Thư giãn tâm trí", "Kết nối thiên nhiên", "Giảm lo âu"],
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_4dedf1f94c.mp3",
  },
  {
    id: "ocean",
    name: "Sóng biển",
    description: "Âm thanh sóng biển vỗ bờ êm dịu",
    category: "nature",
    icon: <Waves className="w-5 h-5" />,
    color: "bg-cyan-500",
    benefits: ["Thư giãn sâu", "Cải thiện giấc ngủ", "Giảm stress"],
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/06/07/audio_67b94801f2.mp3",
  },
  {
    id: "white_noise",
    name: "White Noise",
    description: "Âm thanh trắng giúp che tiếng ồn",
    category: "white_noise",
    icon: <Zap className="w-5 h-5" />,
    color: "bg-gray-500",
    benefits: ["Che tiếng ồn", "Tăng tập trung", "Cải thiện học tập"],
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_74e0132d27.mp3",
  },
  {
    id: "pink_noise",
    name: "Pink Noise",
    description: "Âm thanh hồng, mềm mại hơn white noise",
    category: "white_noise",
    icon: <Heart className="w-5 h-5" />,
    color: "bg-pink-500",
    benefits: ["Cải thiện trí nhớ", "Giấc ngủ sâu", "Thư giãn"],
    audioUrl: "https://cdn.pixabay.com/download/audio/2024/07/30/audio_933e608c92.mp3",
  },
  {
    id: "focus_40hz",
    name: "Binaural 40Hz",
    description: "Tần số 40Hz giúp tăng cường tập trung",
    category: "binaural",
    icon: <Brain className="w-5 h-5" />,
    color: "bg-purple-500",
    benefits: ["Tăng gamma waves", "Cải thiện nhận thức", "Tập trung cao"],
    audioUrl: "https://cdn.pixabay.com/download/audio/2023/10/30/audio_c52efad173.mp3",
  },
  {
    id: "study_music",
    name: "Nhạc học tập",
    description: "Nhạc không lời giúp tập trung học bài",
    category: "ambient",
    icon: <Music className="w-5 h-5" />,
    color: "bg-indigo-500",
    benefits: ["Tăng động lực", "Duy trì tập trung", "Giảm mệt mỏi"],
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/08/02/audio_2dff3fee2c.mp3",
  },
  {
    id: "meditation",
    name: "Thiền định",
    description: "Âm thanh thiền giúp tĩnh tâm",
    category: "ambient",
    icon: <Heart className="w-5 h-5" />,
    color: "bg-orange-500",
    benefits: ["Tĩnh tâm", "Giảm lo âu", "Cân bằng cảm xúc"],
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/24/audio_181eb04d23.mp3",
  },
  {
    id: "lofi",
    name: "Lo-fi Beats",
    description: "Nhạc lo-fi nhẹ nhàng, phù hợp học tập",
    category: "ambient",
    icon: <Music className="w-5 h-5" />,
    color: "bg-rose-500",
    benefits: ["Tăng năng suất", "Tạo không khí thoải mái", "Duy trì động lực"],
    audioUrl: "https://cdn.pixabay.com/download/audio/2023/10/07/audio_b011ba079e.mp3",
  },
  {
    id: "cafe",
    name: "Quán cà phê",
    description: "Tiếng động quán cà phê ấm cúng",
    category: "ambient",
    icon: <Timer className="w-5 h-5" />,
    color: "bg-amber-500",
    benefits: ["Tạo môi trường làm việc", "Tăng sáng tạo", "Giảm cô đơn"],
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_12b3968e37.mp3",
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
  const [selectedCategory, setSelectedCategory] = useState<string>("nature")

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  const handlePlayingChangeCallback = useCallback(
    (isPlaying: boolean, trackName?: string) => {
      onPlayingChange?.(isPlaying, trackName)
    },
    [onPlayingChange],
  )

  useEffect(() => {
    // Auto-start with a focus-friendly track when Pomodoro starts
    if (autoStartWithPomodoro && !currentTrack) {
      const defaultTrack = soundTracks.find((track) => track.id === "rain")
      if (defaultTrack) {
        handleTrackSelect(defaultTrack)
      }
    }
  }, [autoStartWithPomodoro, currentTrack])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100
    }
  }, [volume, isMuted])

  useEffect(() => {
    handlePlayingChangeCallback(isPlaying, currentTrack?.name)
  }, [isPlaying, currentTrack?.name, handlePlayingChangeCallback])

  const handleTrackSelect = (track: SoundTrack) => {
    if (currentTrack?.id === track.id) {
      handlePlayPause()
      return
    }

    setCurrentTrack(track)
    setCurrentTime(0)

    if (audioRef.current) {
      audioRef.current.pause()
    }

    // Create new audio element with error handling
    const audio = new Audio()
    audio.loop = true // Most focus sounds should loop
    audio.volume = isMuted ? 0 : volume[0] / 100

    // Add error handling for missing audio files
    audio.addEventListener("error", (e) => {
      console.log("[v0] Audio loading error for track:", track.name, e)
      // Use a data URL for a silent audio track as fallback
      const silentAudio =
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmHgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
      audio.src = silentAudio
    })

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration)
    })

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime)
    })

    audio.addEventListener("ended", () => {
      setIsPlaying(false)
      setCurrentTime(0)
    })

    // Set the audio source - use placeholder for now since actual files don't exist
    audio.src = track.audioUrl

    audioRef.current = audio

    audio.play().catch((error) => {
      console.log("[v0] Audio play error:", error)
      setIsPlaying(false)
    })
    setIsPlaying(true)
  }

  const handlePlayPause = () => {
    if (!audioRef.current || !currentTrack) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch((error) => {
        console.log("[v0] Audio play error:", error)
        setIsPlaying(false)
      })
      setIsPlaying(true)
    }
  }

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setCurrentTime(0)
      setIsPlaying(false)
    }
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume[0] / 100
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

  return (
    <div className="space-y-6">
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
