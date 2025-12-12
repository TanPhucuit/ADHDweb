// Test environment variables setup
console.log('🔧 Environment Variables Check:')
console.log('================================')

// Supabase
console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log('✅ SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

// OpenAI
console.log('✅ NEXT_PUBLIC_OPENAI_API_KEY:', !!process.env.NEXT_PUBLIC_OPENAI_API_KEY)
console.log('✅ OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY)
console.log('✅ OPENAI_MODEL:', process.env.OPENAI_MODEL || 'not set')

console.log('================================')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ CRITICAL: Supabase environment variables missing!')
  console.error('   Add them to Vercel Dashboard or .env.local file')
  process.exit(1)
}

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY && !process.env.OPENAI_API_KEY) {
  console.warn('⚠️  WARNING: OpenAI API key missing - Dr.AI will not work')
}

console.log('✅ All required environment variables are set!')
