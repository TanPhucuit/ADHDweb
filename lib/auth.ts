// Authentication và authorization utilities
import React from 'react'
import { apiClient } from './api-client'
import { useAppStore } from './store'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  userType: 'parent' | 'child'
}

interface LoginResponse {
  token: string
  user: any
}

class AuthService {
  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    
    const token = localStorage.getItem('auth_token')
    return !!token
  }

  // Get current auth token
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    
    return localStorage.getItem('auth_token')
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.login(credentials.email, credentials.password)
      
      if (response.error) {
        return { success: false, error: response.error }
      }

      if (response.data && 'token' in response.data) {
        const loginData = response.data as LoginResponse
        apiClient.setToken(loginData.token)
        
        // Update store
        const { setUser, refreshUserData } = useAppStore.getState()
        if (loginData.user) {
          setUser(loginData.user)
        }
        
        // Load additional user data
        await refreshUserData()
        
        return { success: true }
      }

      return { success: false, error: 'Invalid response from server' }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }
    }
  }

  // Register new user  
  async register(userData: RegisterData): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.register({
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        user_type: userData.userType
      })
      
      if (response.error) {
        return { success: false, error: response.error }
      }

      if (response.data && 'token' in response.data) {
        const registerData = response.data as LoginResponse
        apiClient.setToken(registerData.token)
        
        // Update store
        const { setUser, refreshUserData } = useAppStore.getState()
        if (registerData.user) {
          setUser(registerData.user)
        }
        
        await refreshUserData()
        
        return { success: true }
      }

      return { success: false, error: 'Invalid response from server' }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      }
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Clear local data
      apiClient.clearToken()
      
      // Clear store
      const { setUser } = useAppStore.getState()
      setUser(null)
      
      // Clear localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_preferences')
      localStorage.removeItem('selected_child')
      
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Refresh user session
  async refreshSession(): Promise<boolean> {
    try {
      if (!this.isAuthenticated()) {
        return false
      }

      const response = await apiClient.getProfile()
      
      if (response.error) {
        // Token might be expired
        await this.logout()
        return false
      }

      // Update store with fresh user data
      const { setUser, refreshUserData } = useAppStore.getState()
      if (response.data) {
        setUser(response.data)
        await refreshUserData()
      }

      return true
    } catch (error) {
      console.error('Session refresh error:', error)
      await this.logout()
      return false
    }
  }

  // Check user permissions
  hasPermission(permission: string): boolean {
    const { user } = useAppStore.getState()
    
    if (!user) return false

    // Basic permission system
    switch (permission) {
      case 'manage_children':
        return user.role === 'parent'
      
      case 'view_reports':
        return user.role === 'parent'
      
      case 'modify_settings':
        return user.role === 'parent'
      
      case 'focus_sessions':
        return true // Both parent and child can access
      
      case 'medication_logs':
        return true // Both can access
      
      case 'rewards':
        return true // Both can access
        
      default:
        return false
    }
  }

  // Check if user can access child data
  canAccessChild(childId: string): boolean {
    const { user, children } = useAppStore.getState()
    
    if (!user) return false

    // Parents can access all their children
    if (user.role === 'parent') {
      return children.some((child: any) => child.id === childId)
    }

    // Children can only access their own data
    return user.id === childId
  }
}

// Export singleton instance
export const authService = new AuthService()

// Auth guard hook for components
export function useAuthGuard(requiredPermission?: string) {
  const { user, isAuthenticated } = useAppStore()
  
  const hasAccess = () => {
    if (!isAuthenticated || !user) return false
    
    if (requiredPermission) {
      return authService.hasPermission(requiredPermission)
    }
    
    return true
  }

  return {
    isAuthenticated,
    user,
    hasAccess: hasAccess(),
    requiredPermission
  }
}

// Route protection wrapper
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  requiredPermission?: string
) {
  return function AuthenticatedComponent(props: T) {
    const { isAuthenticated, hasAccess } = useAuthGuard(requiredPermission)
    
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return null
    }
    
    if (!hasAccess) {
      // Show access denied
      return React.createElement('div', {}, 'Access Denied')
    }
    
    return React.createElement(Component, props)
  }
}