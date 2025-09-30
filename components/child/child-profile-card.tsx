"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EditIcon } from "@/components/ui/icons"
import { AvatarCustomizationModal } from "./avatar-customization-modal"

interface ChildProfileCardProps {
  child: {
    id: string
    name: string
    avatar?: string
    age?: number
  }
  onAvatarUpdate?: (childId: string, avatarUrl: string | null) => void
}

export function ChildProfileCard({ child, onAvatarUpdate }: ChildProfileCardProps) {
  const [showAvatarModal, setShowAvatarModal] = useState(false)

  const handleAvatarUpdate = (avatarUrl: string | null) => {
    onAvatarUpdate?.(child.id, avatarUrl)
  }

  const getAvatarDisplay = () => {
    if (child.avatar) {
      return <img src={child.avatar || "/placeholder.svg"} alt={child.name} className="w-full h-full object-cover" />
    }

    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
        <span className="text-2xl">😊</span>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden">{getAvatarDisplay()}</div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAvatarModal(true)}
              className="absolute -bottom-1 -right-1 w-6 h-6 p-0 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50"
            >
              <EditIcon className="w-3 h-3 text-gray-600" />
            </Button>
          </div>

          <div>
            <h3 className="font-medium text-gray-800">{child.name}</h3>
            {child.age && <p className="text-sm text-gray-500">{child.age} tuổi</p>}
          </div>
        </div>
      </div>

      <AvatarCustomizationModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        childName={child.name}
        currentAvatar={child.avatar}
        onAvatarUpdate={handleAvatarUpdate}
      />
    </>
  )
}
