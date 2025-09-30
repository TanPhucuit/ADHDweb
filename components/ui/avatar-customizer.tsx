"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Palette, Shirt, Glasses, Upload, Camera } from "lucide-react"

interface AvatarCustomizerProps {
  currentAvatar?: string
  userName: string
  onAvatarChange?: (avatar: AvatarConfig) => void
}

interface AvatarConfig {
  uploadedImage?: string
  skinTone: string
  hairStyle: string
  hairColor: string
  clothing: string
  accessory: string
  background: string
}

const skinTones = ["#FDBCB4", "#F1C27D", "#E0AC69", "#C68642", "#8D5524", "#975A3E"]
const hairStyles = ["short", "long", "curly", "spiky", "bald", "ponytail"]
const hairColors = ["#8B4513", "#FFD700", "#000000", "#FF6347", "#9370DB", "#32CD32"]
const clothingOptions = ["tshirt", "hoodie", "dress", "suit", "casual", "sporty"]
const accessories = ["none", "glasses", "hat", "crown", "headband", "earrings"]
const backgrounds = ["gradient-blue", "gradient-purple", "gradient-green", "gradient-orange", "gradient-pink"]

export function AvatarCustomizer({ currentAvatar, userName, onAvatarChange }: AvatarCustomizerProps) {
  const [config, setConfig] = useState<AvatarConfig>({
    skinTone: skinTones[0],
    hairStyle: "short",
    hairColor: hairColors[0],
    clothing: "tshirt",
    accessory: "none",
    background: "gradient-blue",
  })

  const [isOpen, setIsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleSave = () => {
    onAvatarChange?.(config)
    setIsOpen(false)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file ảnh!")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước ảnh không được vượt quá 5MB!")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setConfig((prev) => ({ ...prev, uploadedImage: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const getAvatarDisplay = () => {
    if (config.uploadedImage || imagePreview) {
      return (
        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow-lg border-4 border-white">
          <img src={config.uploadedImage || imagePreview || ""} alt="Avatar" className="w-full h-full object-cover" />
        </div>
      )
    }

    const emojiMap: Record<string, string> = {
      short: "👦",
      long: "👧",
      curly: "👶",
      spiky: "🧒",
      bald: "👨‍🦲",
      ponytail: "👩",
    }

    return (
      <div
        className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${
          config.background === "gradient-blue"
            ? "from-blue-400 to-purple-500"
            : config.background === "gradient-purple"
              ? "from-purple-400 to-pink-500"
              : config.background === "gradient-green"
                ? "from-green-400 to-blue-500"
                : config.background === "gradient-orange"
                  ? "from-orange-400 to-red-500"
                  : "from-pink-400 to-purple-500"
        } flex items-center justify-center text-6xl shadow-lg`}
      >
        {emojiMap[config.hairStyle] || "👤"}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <AvatarImage src={config.uploadedImage || currentAvatar || "/placeholder.svg"} alt={userName} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-lg">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
            <Palette className="w-2 h-2 text-white" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">🎨 Tùy chỉnh Avatar</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="space-y-4">
            <Card className="p-6 text-center">
              {getAvatarDisplay()}
              <h3 className="font-heading text-lg mt-4">{userName}</h3>

              {/* Image upload section */}
              <div className="mt-4 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Tải ảnh lên
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImagePreview(null)
                      setConfig((prev) => ({ ...prev, uploadedImage: undefined }))
                    }}
                    disabled={!config.uploadedImage && !imagePreview}
                  >
                    <Camera className="w-4 h-4" />
                    Xóa ảnh
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Hỗ trợ JPG, PNG. Tối đa 5MB</p>
              </div>
            </Card>
          </div>

          {/* Customization Options */}
          <div className="space-y-6">
            {!config.uploadedImage && !imagePreview && (
              <>
                {/* Skin Tone */}
                <div>
                  <h4 className="font-heading text-sm mb-3 flex items-center gap-2">
                    <span>🎨</span> Màu da
                  </h4>
                  <div className="grid grid-cols-6 gap-2">
                    {skinTones.map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setConfig((prev) => ({ ...prev, skinTone: tone }))}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          config.skinTone === tone ? "border-primary scale-110" : "border-gray-200"
                        }`}
                        style={{ backgroundColor: tone }}
                      />
                    ))}
                  </div>
                </div>

                {/* Hair Style */}
                <div>
                  <h4 className="font-heading text-sm mb-3 flex items-center gap-2">
                    <span>💇</span> Kiểu tóc
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {hairStyles.map((style) => (
                      <Button
                        key={style}
                        variant={config.hairStyle === style ? "default" : "outline"}
                        size="sm"
                        onClick={() => setConfig((prev) => ({ ...prev, hairStyle: style }))}
                        className="text-xs"
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Hair Color */}
                <div>
                  <h4 className="font-heading text-sm mb-3 flex items-center gap-2">
                    <span>🎨</span> Màu tóc
                  </h4>
                  <div className="grid grid-cols-6 gap-2">
                    {hairColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setConfig((prev) => ({ ...prev, hairColor: color }))}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          config.hairColor === color ? "border-primary scale-110" : "border-gray-200"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Clothing */}
                <div>
                  <h4 className="font-heading text-sm mb-3 flex items-center gap-2">
                    <Shirt className="w-4 h-4" /> Trang phục
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {clothingOptions.map((clothing) => (
                      <Button
                        key={clothing}
                        variant={config.clothing === clothing ? "default" : "outline"}
                        size="sm"
                        onClick={() => setConfig((prev) => ({ ...prev, clothing }))}
                        className="text-xs"
                      >
                        {clothing}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Accessories */}
                <div>
                  <h4 className="font-heading text-sm mb-3 flex items-center gap-2">
                    <Glasses className="w-4 h-4" /> Phụ kiện
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {accessories.map((accessory) => (
                      <Button
                        key={accessory}
                        variant={config.accessory === accessory ? "default" : "outline"}
                        size="sm"
                        onClick={() => setConfig((prev) => ({ ...prev, accessory }))}
                        className="text-xs"
                      >
                        {accessory}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Background */}
            <div>
              <h4 className="font-heading text-sm mb-3 flex items-center gap-2">
                <span>🌈</span> Nền
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {backgrounds.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setConfig((prev) => ({ ...prev, background: bg }))}
                    className={`h-8 rounded-lg border-2 transition-all ${
                      config.background === bg ? "border-primary scale-105" : "border-gray-200"
                    } ${
                      bg === "gradient-blue"
                        ? "bg-gradient-to-r from-blue-400 to-purple-500"
                        : bg === "gradient-purple"
                          ? "bg-gradient-to-r from-purple-400 to-pink-500"
                          : bg === "gradient-green"
                            ? "bg-gradient-to-r from-green-400 to-blue-500"
                            : bg === "gradient-orange"
                              ? "bg-gradient-to-r from-orange-400 to-red-500"
                              : "bg-gradient-to-r from-pink-400 to-purple-500"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Helpful message when image is uploaded */}
            {(config.uploadedImage || imagePreview) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Ảnh đã được tải lên! Các tùy chọn tùy chỉnh sẽ được ẩn khi sử dụng ảnh riêng.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            💾 Lưu Avatar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
