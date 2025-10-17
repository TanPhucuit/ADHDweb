"use client"

import { useEffect, useState } from "react"
import { X, AlertCircle, Info, CheckCircle2, Star, Trophy } from "lucide-react"

interface CustomToast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning' | 'action-success'
  duration?: number
}

interface CustomToastProps {
  toast: CustomToast
  onRemove: (id: string) => void
}

function CustomToastItem({ toast, onRemove }: CustomToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const enterTimer = setTimeout(() => setIsVisible(true), 10)
    const exitTimer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration || 4000)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
    }
  }, [toast.id, toast.duration, onRemove])

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle2 className="w-6 h-6" />
      case 'action-success': return <Trophy className="w-6 h-6" />
      case 'error': return <X className="w-6 h-6" />
      case 'warning': return <AlertCircle className="w-6 h-6" />
      case 'info': return <Info className="w-6 h-6" />
      default: return <Info className="w-6 h-6" />
    }
  }

  const getStyles = () => {
    switch (toast.type) {
      case 'success': 
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-300 shadow-green-200'
      case 'action-success': 
        return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-300 shadow-blue-200'
      case 'error': 
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-300 shadow-red-200'
      case 'warning': 
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-300 shadow-orange-200'
      case 'info': 
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300 shadow-blue-200'
      default: 
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300 shadow-blue-200'
    }
  }

  return (
    <div
      className={`
        transform transition-all duration-500 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${getStyles()}
        rounded-xl shadow-lg border p-4 mb-3 max-w-sm w-full
        backdrop-blur-sm relative overflow-hidden
      `}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
      
      <div className="flex items-center space-x-3 relative z-10">
        <div className="flex-shrink-0 p-1 bg-white/20 rounded-full">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={() => {
            setIsExiting(true)
            setTimeout(() => onRemove(toast.id), 300)
          }}
          className="flex-shrink-0 text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {toast.type === 'action-success' && (
        <div className="flex items-center justify-center mt-2 space-x-1">
          <Star className="w-3 h-3 text-yellow-300" />
          <span className="text-xs font-medium opacity-90">Hành động đã được ghi nhận</span>
          <Star className="w-3 h-3 text-yellow-300" />
        </div>
      )}
    </div>
  )
}

export function CustomToastContainer() {
  const [toasts, setToasts] = useState<CustomToast[]>([])

  const addToast = (message: string, type: CustomToast['type'] = 'info', duration?: number) => {
    const id = Date.now().toString()
    const newToast: CustomToast = { id, message, type, duration }
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  useEffect(() => {
    const showCustomToast = (event: CustomEvent) => {
      const { message, type, duration } = event.detail
      addToast(message, type, duration)
    }

    window.addEventListener('showCustomToast', showCustomToast as EventListener)
    return () => window.removeEventListener('showCustomToast', showCustomToast as EventListener)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3">
      {toasts.map(toast => (
        <CustomToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  )
}

export const showCustomToast = (
  message: string, 
  type: 'success' | 'error' | 'info' | 'warning' | 'action-success' = 'info',
  duration?: number
) => {
  window.dispatchEvent(new CustomEvent('showCustomToast', {
    detail: { message, type, duration }
  }))
}


