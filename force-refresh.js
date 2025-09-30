// Force refresh và clear cache script
console.log('🔄 Force Refresh Script')

// Function để clear tất cả cache và force reload
function forceRefreshAll() {
  console.log('🧹 Clearing all caches...')
  
  // Clear localStorage
  console.log('1️⃣ Clearing localStorage...')
  const userBackup = localStorage.getItem('adhd-dashboard-user')
  localStorage.clear()
  if (userBackup) {
    localStorage.setItem('adhd-dashboard-user', userBackup)
    console.log('✅ Preserved user auth data')
  }
  
  // Clear sessionStorage
  console.log('2️⃣ Clearing sessionStorage...')
  sessionStorage.clear()
  
  // Clear any cached API responses
  console.log('3️⃣ Clearing any cached data...')
  
  // Force reload page
  console.log('4️⃣ Force reloading page...')
  window.location.reload(true)
}

// Function để test current data state
function debugCurrentState() {
  console.log('🔍 Current State Debug:')
  
  // Check user data
  const user = localStorage.getItem('adhd-dashboard-user')
  if (user) {
    const userData = JSON.parse(user)
    console.log('👤 Current user:', userData)
    console.log('   - ID:', userData.id)
    console.log('   - Name:', userData.name)
    console.log('   - Role:', userData.role)
  }
  
  // Check URL
  console.log('🌐 Current URL:', window.location.href)
  
  // Check if we're on parent dashboard
  if (window.location.pathname.includes('/parent')) {
    console.log('✅ On parent dashboard')
  }
}

// Function để force re-login với correct parent
async function forceCorrectLogin() {
  console.log('🔑 Force login with correct parent...')
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nguyenvantuan@gmail.com',
        password: 'demo123',
        role: 'parent'
      })
    })
    
    const result = await response.json()
    console.log('Login result:', result)
    
    if (result.success && result.user) {
      localStorage.setItem('adhd-dashboard-user', JSON.stringify(result.user))
      console.log('✅ Login successful, stored user:', result.user)
      console.log('🔄 Reloading page...')
      window.location.reload()
    } else {
      console.log('❌ Login failed:', result)
    }
  } catch (error) {
    console.log('❌ Login error:', error)
  }
}

// Export functions
window.forceRefresh = forceRefreshAll
window.debugState = debugCurrentState  
window.forceLogin = forceCorrectLogin

console.log('📋 Available functions:')
console.log('- forceRefresh() - Clear cache and reload')
console.log('- debugState() - Check current state')
console.log('- forceLogin() - Force login with correct parent')

// Auto-run debug
debugCurrentState()