// Test script để verify tất cả fixes
console.log('🧪 Testing all 3 fixes...')

// Test 1: Action API với constraint handling
async function testActionAPI() {
  console.log('\n1️⃣ Testing Action API...')
  try {
    const response = await fetch('/api/parent/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parentId: '23',
        actionLabel: 'nghi-ngoi',
        actionName: 'Nghỉ giải lao'
      })
    })
    
    const result = await response.json()
    console.log('Action API result:', response.status, result)
  } catch (error) {
    console.log('Action API error:', error)
  }
}

// Test 2: Rewards API với child ID mapping
async function testRewardsAPI() {
  console.log('\n2️⃣ Testing Rewards API...')
  try {
    const response = await fetch('/api/rewards/calculate?childId=30&parentId=23')
    const result = await response.json()
    console.log('Rewards API result:', response.status, result)
  } catch (error) {
    console.log('Rewards API error:', error)
  }
}

// Test 3: Debug comprehensive test
async function testDebugAPI() {
  console.log('\n3️⃣ Testing Debug API...')
  try {
    const response = await fetch('/api/debug/comprehensive-test')
    const result = await response.json()
    console.log('Debug API result:', response.status, result)
  } catch (error) {
    console.log('Debug API error:', error)
  }
}

// Test 4: Check localStorage user data
function testUserData() {
  console.log('\n4️⃣ Testing User Data...')
  const userData = localStorage.getItem('adhd-dashboard-user')
  console.log('Stored user data:', userData)
  
  if (userData) {
    try {
      const parsed = JSON.parse(userData)
      console.log('Parsed user:', parsed)
      console.log('User ID:', parsed.id, 'Role:', parsed.role, 'Name:', parsed.name)
    } catch (e) {
      console.log('Parse error:', e)
    }
  }
}

// Run all tests
async function runAllTests() {
  testUserData()
  await testActionAPI()
  await testRewardsAPI()
  await testDebugAPI()
  
  console.log('\n✅ All tests completed! Check results above.')
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  runAllTests()
}

// Export for manual use
if (typeof module !== 'undefined') {
  module.exports = { testActionAPI, testRewardsAPI, testDebugAPI, testUserData, runAllTests }
}