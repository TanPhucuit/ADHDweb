"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "./types"
import { dataStore } from "./data-store"
import { supabase } from "./supabase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Demo mode: only check localStorage
    const checkSession = () => {
      try {
        const storedUser = localStorage.getItem("adhd-dashboard-user")
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        localStorage.removeItem("adhd-dashboard-user")
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      console.log('🔐 Attempting database authentication for:', email)
      
      // Call real authentication API
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log('✅ Database authentication successful:', result.user)
        
        setUser(result.user)
        localStorage.setItem("adhd-dashboard-user", JSON.stringify(result.user))
        return true
      } else {
        console.log('❌ Database authentication failed:', result.error)
        return false
      }
    } catch (error) {
      console.error("❌ Login error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    
    // Notify parent if child is logging out
    if (user && user.role === "child") {
      dataStore.notifyChildLogout(user.id)
    }
    
    // Clean up local state (demo mode only)
    setUser(null)
    localStorage.removeItem("adhd-dashboard-user")
    setLoading(false)
    router.replace("/")
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
