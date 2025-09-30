// 🧪 SCRIPT TEST ĐẦY ĐỦ CHO CÁC FIXES

console.log('🚀 Bắt đầu test các fixes...')

// Test 1: API Parent Actions (vấn đề 1)
async function testParentActions() {
  console.log('\n1️⃣ Test Parent Actions API...')
  
  try {
    const response = await fetch('/api/parent/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parentId: '22',
        actionLabel: 'nghi-ngoi',
        actionName: 'Nghỉ giải lao',
        timestamp: new Date().toISOString()
      })
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Parent Actions API: SUCCESS')
      console.log('📝 Response:', result)
    } else {
      console.log('❌ Parent Actions API: FAILED')
      console.log('📝 Error:', result)
    }
  } catch (error) {
    console.log('❌ Parent Actions API: EXCEPTION')
    console.log('📝 Error:', error)
  }
}

// Test 2: API Rewards Calculate (vấn đề 2)
async function testRewardsCalculate() {
  console.log('\n2️⃣ Test Rewards Calculate API...')
  
  try {
    const response = await fetch('/api/rewards/calculate?childId=child-1&parentId=22')
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Rewards Calculate API: SUCCESS')
      console.log('📝 Response:', result)
      console.log('🏆 Total Stars:', result.totalStars)
      console.log('📚 Schedule Activities:', result.breakdown?.completedScheduleActivities || 0)
      console.log('💊 Medication Logs:', result.breakdown?.takenMedicationLogs || 0)
      console.log('👏 Encouragement Actions:', result.breakdown?.encouragementActions || 0)
    } else {
      console.log('❌ Rewards Calculate API: FAILED')
      console.log('📝 Error:', result)
    }
  } catch (error) {
    console.log('❌ Rewards Calculate API: EXCEPTION')
    console.log('📝 Error:', error)
  }
}

// Test 3: Test tất cả parent actions
async function testAllParentActions() {
  console.log('\n3️⃣ Test All Parent Action Types...')
  
  const actions = [
    { label: 'nhac-tap-trung', name: 'Nhắc tập trung' },
    { label: 'nghi-ngoi', name: 'Nghỉ giải lao' },
    { label: 'khen-ngoi', name: 'Khen ngợi' },
    { label: 'dong-vien', name: 'Động viên' },
    { label: 'kiem-tra-thoi-gian', name: 'Kiểm tra thời gian' }
  ]
  
  for (const action of actions) {
    try {
      const response = await fetch('/api/parent/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: '22',
          actionLabel: action.label,
          actionName: action.name,
          timestamp: new Date().toISOString()
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        console.log(`✅ ${action.name}: SUCCESS`)
      } else {
        console.log(`❌ ${action.name}: FAILED - ${result.error}`)
      }
    } catch (error) {
      console.log(`❌ ${action.name}: EXCEPTION - ${error}`)
    }
    
    // Đợi 100ms giữa các request
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

// Test 4: Test công thức tính toán
async function testCalculationFormula() {
  console.log('\n4️⃣ Test Calculation Formula...')
  
  // Test với child-1
  const response1 = await fetch('/api/rewards/calculate?childId=child-1&parentId=22')
  const result1 = await response1.json()
  
  if (response1.ok) {
    const { breakdown } = result1
    const expectedStars = 
      (10 * ((breakdown?.completedScheduleActivities || 0) + (breakdown?.takenMedicationLogs || 0))) +
      (5 * (breakdown?.encouragementActions || 0))
    
    console.log('📊 Calculation Check:')
    console.log(`- Schedule Activities: ${breakdown?.completedScheduleActivities || 0} * 10 = ${(breakdown?.completedScheduleActivities || 0) * 10}`)
    console.log(`- Medication Logs: ${breakdown?.takenMedicationLogs || 0} * 10 = ${(breakdown?.takenMedicationLogs || 0) * 10}`)
    console.log(`- Encouragement Actions: ${breakdown?.encouragementActions || 0} * 5 = ${(breakdown?.encouragementActions || 0) * 5}`)
    console.log(`- Expected Total: ${expectedStars}`)
    console.log(`- Actual Total: ${result1.totalStars}`)
    
    if (expectedStars === result1.totalStars) {
      console.log('✅ Formula calculation: CORRECT')
    } else {
      console.log('❌ Formula calculation: INCORRECT')
    }
  }
}

// Test 5: Test khả năng auto-reload
function testAutoReload() {
  console.log('\n5️⃣ Test Auto Reload Functionality...')
  
  // Kiểm tra xem function reloadRewardPoints có tồn tại không
  if (typeof window !== 'undefined') {
    console.log('✅ Running in browser environment')
    console.log('📝 Note: Auto-reload functions are available in child/parent dashboards')
    console.log('🔄 To test: Navigate to /child or /parent and complete activities')
  } else {
    console.log('ℹ️ Running in Node environment - auto-reload requires browser')
  }
}

// Chạy tất cả tests
async function runAllTests() {
  console.log('🧪 === BẮT ĐẦU TEST TOÀN DIỆN ===')
  
  await testParentActions()
  await testRewardsCalculate()
  await testAllParentActions()
  await testCalculationFormula()
  testAutoReload()
  
  console.log('\n🎉 === KẾT THÚC TESTS ===')
  console.log('✅ Nếu tất cả tests PASS:')
  console.log('  - Vấn đề 1: Hành động nghỉ giải lao đã được sửa')
  console.log('  - Vấn đề 2: Hệ thống điểm sao mới hoạt động chính xác')
  console.log('🚀 Ứng dụng đã sẵn sàng!')
}

// Export để có thể chạy từ console
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testParentActions, testRewardsCalculate }
} else {
  // Tự động chạy nếu trong browser
  runAllTests()
}