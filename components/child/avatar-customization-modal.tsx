"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { UploadIcon, TrashIcon, XIcon } from "@/components/ui/icons"

interface AvatarCustomizationModalProps {
  isOpen: boolean
  onClose: () => void
  childName: string
  currentAvatar?: string
  onAvatarUpdate: (avatarUrl: string | null) => void
}

export function AvatarCustomizationModal({
  isOpen,
  onClose,
  childName,
  currentAvatar,
  onAvatarUpdate,
}: AvatarCustomizationModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(currentAvatar || null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file không được vượt quá 5MB")
      return
    }

    // Check file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      alert("Chỉ hỗ trợ file JPG và PNG")
      return
    }

    setIsUploading(true)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setSelectedImage(result)
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDeleteAvatar = () => {
    setSelectedImage(null)
    onAvatarUpdate(null)
  }

  const handleSave = () => {
    onAvatarUpdate(selectedImage)
    onClose()
  }

  const getAvatarDisplay = () => {
    if (selectedImage) {
      return <img src={selectedImage || "/placeholder.svg"} alt={childName} className="w-full h-full object-cover" />
    }

    // Default emoji avatar
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
        <span className="text-6xl">😊</span>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🎨</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Tùy chỉnh Avatar</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Avatar Preview */}
        <div className="bg-gradient-to-br from-orange-50 to-purple-50 rounded-2xl p-8 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 ring-4 ring-white shadow-lg">
              {getAvatarDisplay()}
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">{childName}</h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-4">
          <Button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <UploadIcon className="w-4 h-4 mr-2" />
            {isUploading ? "Đang tải..." : "Tải ảnh lên"}
          </Button>

          {selectedImage && (
            <Button
              onClick={handleDeleteAvatar}
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Xóa ảnh
            </Button>
          )}
        </div>

        {/* File Info */}
        <p className="text-sm text-gray-500 text-center mb-6">Hỗ trợ JPG, PNG. Tối đa 5MB</p>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
        >
          Lưu thay đổi
        </Button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}
