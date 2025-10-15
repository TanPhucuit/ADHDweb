// Supabase client configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Create client with fallback for build time
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side API helper with better error handling
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL is not set, using fallback')
    return createClient('https://placeholder.supabase.co', 'placeholder-key')
  }

  if (!key) {
    console.warn('⚠️ Supabase key is not set, using fallback')
    return createClient(url, 'placeholder-key')
  }

  return createClient(url, key)
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'parent' | 'child'
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          role: 'parent' | 'child'
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'parent' | 'child'
          avatar_url?: string
          updated_at?: string
        }
      }
      children: {
        Row: {
          id: string
          parent_id: string
          name: string
          age: number
          grade: string
          avatar_url?: string
          device_id?: string
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          name: string
          age: number
          grade: string
          avatar_url?: string
          device_id?: string
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          name?: string
          age?: number
          grade?: string
          avatar_url?: string
          device_id?: string
          settings?: any
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'parent' | 'child'
    }
  }
}