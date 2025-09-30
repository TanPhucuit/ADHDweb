// Test script để kiểm tra các fixes cho vấn đề timestamp
// Run này bằng cách mở browser console và paste code này

console.log('🧪 Testing timestamp fixes...')

// Test 1: Kiểm tra timestamp hiện tại
const currentTimestamp = new Date().toISOString()
console.log('🕐 Current timestamp:', currentTimestamp)
console.log('🕐 Current local time:', new Date().toLocaleTimeString('vi-VN'))

// Test 2: Test parent action API call
async function testParentAction() {
  try {
    console.log('🎯 Testing parent action API...')
    
    const response = await fetch('/api/parent/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parentId: '22', // Test parent ID
        actionLabel: 'test-action',
        actionName: 'Test Action',
        timestamp: new Date().toISOString()
      })
    })
    
    const result = await response.json()
    console.log('✅ Parent action response:', result)
    
    if (response.ok) {
      console.log('✅ Parent action API works correctly')
    } else {
      console.error('❌ Parent action API failed:', result)
    }
  } catch (error) {
    console.error('❌ Parent action test failed:', error)
  }
}

// Test 3: Test break request API call
async function testBreakRequest() {
  try {
    console.log('💤 Testing break request API...')
    
    const response = await fetch('/api/break-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId: 'test-child',
        childName: 'Test Child',
        parentId: '22',
        duration: 5,
        timestamp: new Date().toISOString()
      })
    })
    
    const result = await response.json()
    console.log('✅ Break request response:', result)
    
    if (response.ok) {
      console.log('✅ Break request API works correctly')
    } else {
      console.error('❌ Break request API failed:', result)
    }
  } catch (error) {
    console.error('❌ Break request test failed:', error)
  }
}

// Run tests
console.log('🚀 Running tests...')
testParentAction()
testBreakRequest()

console.log('✅ All tests completed!')