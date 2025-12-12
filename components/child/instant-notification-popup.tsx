"use client"

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { InstantNotification } from '@/lib/instant-notification-service'

interface InstantNotificationPopupProps {
  notification: InstantNotification
  onClose: () => void
}

export function InstantNotificationPopup({ notification, onClose }: InstantNotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10)

    // Auto close after 8 seconds
    const timer = setTimeout(() => {
      handleClose()
    }, 8000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation to finish
  }

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ maxWidth: '400px' }}
    >
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl shadow-2xl p-6 relative animate-bounce-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex items-start gap-4">
          <div className="text-4xl animate-pulse">
            📢
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-2">
              {notification.title}
            </h3>
            <p className="text-white/90 text-base">
              {notification.message}
            </p>
            <p className="text-white/70 text-xs mt-2">
              {new Date(notification.timestamp).toLocaleTimeString('vi-VN')}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white/60 animate-progress"
            style={{ animationDuration: '8s' }}
          />
        </div>
      </div>
    </div>
  )
}
