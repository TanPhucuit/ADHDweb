"use client"

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { InstantNotification } from '@/lib/instant-notification-service'

interface InstantNotificationPopupProps {
  notification: InstantNotification
  onClose: () => void
}

type ActionStyle = {
  gradient: string
  emoji: string
  title: string
  message: string
}

function getActionStyle(actionType?: string, fallbackTitle?: string, fallbackMessage?: string): ActionStyle {
  switch (actionType) {
    case 'nhac-tap-trung':
      return {
        gradient: 'from-blue-500 to-cyan-500',
        emoji: '💭',
        title: 'Ba mẹ nhắc nhở',
        message: 'Hãy tập trung vào việc học nhé con!',
      }
    case 'nghi-giai-lao':
      return {
        gradient: 'from-orange-400 to-amber-500',
        emoji: '☕',
        title: 'Nghỉ giải lao thôi!',
        message: 'Ba mẹ cho con nghỉ một chút, uống nước và thư giãn nhé!',
      }
    case 'khen-ngoi':
      return {
        gradient: 'from-green-500 to-emerald-500',
        emoji: '🏆',
        title: 'Ba mẹ khen con!',
        message: 'Con học rất giỏi! Ba mẹ rất tự hào về con!',
      }
    case 'dong-vien':
      return {
        gradient: 'from-pink-500 to-rose-500',
        emoji: '❤️',
        title: 'Ba mẹ động viên con',
        message: 'Cố lên con nhé! Con làm được mà, ba mẹ tin con!',
      }
    case 'kiem-tra-thoi-gian':
      return {
        gradient: 'from-indigo-500 to-violet-500',
        emoji: '⏰',
        title: 'Kiểm tra thời gian',
        message: 'Ba mẹ nhắc con để ý thời gian học nhé!',
      }
    default:
      return {
        gradient: 'from-blue-500 to-purple-500',
        emoji: '📢',
        title: fallbackTitle || 'Thông báo từ ba mẹ',
        message: fallbackMessage || 'Ba mẹ vừa gửi thông báo cho con',
      }
  }
}

export function InstantNotificationPopup({ notification, onClose }: InstantNotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const style = getActionStyle(notification.actionType, notification.title, notification.message)

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10)
    const timer = setTimeout(() => handleClose(), 8000)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ maxWidth: '400px' }}
    >
      <div className={`bg-gradient-to-r ${style.gradient} text-white rounded-2xl shadow-2xl p-6 relative`}>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="text-4xl animate-pulse">
            {style.emoji}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-2">{style.title}</h3>
            <p className="text-white/90 text-base">{style.message}</p>
            <p className="text-white/70 text-xs mt-2">
              {new Date(notification.timestamp).toLocaleTimeString('vi-VN')}
            </p>
          </div>
        </div>

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
