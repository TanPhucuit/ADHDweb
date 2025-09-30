// Auth Debug và Fix Script
console.log('🔍 Auth Debug & Fix Script')

// Function để check và fix localStorage auth data
function debugAndFixAuth() {
  console.log('\n🔍 Debugging Authentication...')
  
  // 1. Check current localStorage
  const storedUser = localStorage.getItem('adhd-dashboard-user')
  console.log('1️⃣ Current stored user:', storedUser)
  
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser)
      console.log('2️⃣ Parsed user data:', userData)
      console.log('   - ID:', userData.id)
      console.log('   - Role:', userData.role) 
      console.log('   - Name:', userData.name)
      console.log('   - Email:', userData.email)
      
      // Check if this looks like valid parent data
      if (userData.role === 'parent' && userData.id) {
        console.log('✅ User data looks valid for parent')
        return userData
      } else {
        console.log('❌ Invalid user data structure')
      }
    } catch (e) {
      console.log('❌ Error parsing user data:', e)
    }
  }
  
  // 2. If no valid data, try to re-authenticate
  console.log('\n3️⃣ No valid auth data found. Need to re-login.')
  console.log('Please login again with parent credentials:')
  console.log('Email: nguyenvantuan@gmail.com')
  console.log('Password: demo123')
  
  return null
}

// Function để test API với current auth
async function testAPIsWithCurrentAuth() {
  const user = debugAndFixAuth()
  
  if (!user) {
    console.log('❌ No valid user found. Please login first.')
    return
  }
  
  console.log(`\n🧪 Testing APIs with user ID: ${user.id}`)
  
  // Test children API
  try {
    console.log('\n1️⃣ Testing Children API...')
    const childrenResponse = await fetch(`/api/parent/children?parentId=${user.id}`)
    const childrenResult = await childrenResponse.json()
    console.log('Children API result:', childrenResponse.status, childrenResult)
    
    if (childrenResult.data && childrenResult.data.length > 0) {
      const firstChild = childrenResult.data[0]
      console.log('First child:', firstChild)
      
      // Test rewards API với first child
      console.log('\n2️⃣ Testing Rewards API...')
      const rewardsResponse = await fetch(`/api/rewards/calculate?childId=${firstChild.id}&parentId=${user.id}`)
      const rewardsResult = await rewardsResponse.json()
      console.log('Rewards API result:', rewardsResponse.status, rewardsResult)
      
      // Test action API
      console.log('\n3️⃣ Testing Action API...')
      const actionResponse = await fetch('/api/parent/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: user.id,
          actionLabel: 'nghi-ngoi',
          actionName: 'Test nghỉ giải lao'
        })
      })
      const actionResult = await actionResponse.json()
      console.log('Action API result:', actionResponse.status, actionResult)
    }
    
  } catch (error) {
    console.log('API test error:', error)
  }
}

// Function để force logout và clear cache
function forceLogout() {
  console.log('🔄 Force logout và clear cache...')
  localStorage.removeItem('adhd-dashboard-user')
  localStorage.clear()
  sessionStorage.clear()
  console.log('✅ Auth data cleared. Please refresh page and login again.')
}

// Auto-run debug
debugAndFixAuth()

// Export functions for manual use
window.debugAuth = debugAndFixAuth
window.testAPIs = testAPIsWithCurrentAuth  
window.forceLogout = forceLogout

console.log('\n📋 Available functions:')
console.log('- debugAuth() - Check current auth status')
console.log('- testAPIs() - Test all APIs with current user')
console.log('- forceLogout() - Clear auth and force re-login')