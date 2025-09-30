"use client"

import type { Child } from "@/lib/types"
import { ChevronDown, User } from "lucide-react"
import { useState } from "react"

interface ChildSelectorProps {
  children: Child[]
  selectedChild: Child | null
  onChildSelect: (child: Child) => void
}

export function ChildSelector({ children, selectedChild, onChildSelect }: ChildSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (children.length <= 1) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow w-full md:w-auto"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm text-gray-500">Đang theo dõi</p>
          <p className="font-semibold text-gray-900">{selectedChild?.name || "Chọn con"}</p>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full md:w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => {
                onChildSelect(child)
                setIsOpen(false)
              }}
              className={`flex items-center space-x-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors ${
                selectedChild?.id === child.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">{child.name}</p>
                <p className="text-sm text-gray-500">{child.age} tuổi</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
