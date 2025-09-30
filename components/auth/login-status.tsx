"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ENV_CONFIG, isDemoMode, isSupabaseEnabled } from "@/lib/env-config"
import { supabase } from "@/lib/supabase"

export function LoginStatus() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'demo' | 'error'>('checking')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (isSupabaseEnabled()) {
          // Test Supabase connection
          const { error } = await supabase.auth.getSession()
          if (error) {
            setConnectionStatus('demo')
            setStatusMessage('Supabase không khả dụng - Chạy demo mode')
          } else {
            setConnectionStatus('connected')
            setStatusMessage('Kết nối Supabase thành công')
          }
        } else {
          setConnectionStatus('demo')
          setStatusMessage('Chạy demo mode - Không cần cấu hình')
        }
      } catch (error) {
        setConnectionStatus('demo')
        setStatusMessage('Lỗi kết nối - Chuyển sang demo mode')
      }
    }

    checkConnection()
  }, [])

  if (connectionStatus === 'checking') {
    return (
      <div className="text-center mb-4">
        <Badge variant="secondary" className="text-xs">
          🔄 Đang kiểm tra kết nối...
        </Badge>
      </div>
    )
  }

  return (
    <div className="text-center mb-4">
      {connectionStatus === 'connected' && (
        <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
          ✅ {statusMessage}
        </Badge>
      )}
      {connectionStatus === 'demo' && (
        <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
          🎯 {statusMessage}
        </Badge>
      )}
      {connectionStatus === 'error' && (
        <Badge variant="destructive" className="text-xs">
          ❌ {statusMessage}
        </Badge>
      )}
    </div>
  )
}