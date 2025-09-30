// Environment Variables for demo/production
export const ENV_CONFIG = {
  // Supabase (nếu có)
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // API Backend
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  
  // Feature flags
  ENABLE_SUPABASE: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  ENABLE_DEMO_MODE: true, // Always enable demo mode as fallback
  
  // Demo credentials
  DEMO_ACCOUNTS: {
    parent: {
      email: 'demo@parent.com',
      password: 'demo123',
      name: 'Nguyễn Thị Lan'
    },
    child: {
      email: 'minhan@child.com', 
      password: 'demo123',
      name: 'Nguyễn Minh An'
    }
  }
}

export const isDemoMode = () => !ENV_CONFIG.ENABLE_SUPABASE
export const isSupabaseEnabled = () => ENV_CONFIG.ENABLE_SUPABASE