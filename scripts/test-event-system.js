// Simple test for event system
console.log('🧪 Testing event system...')

// Test 1: Check if useResiDetail hook exists
if (typeof window !== 'undefined') {
  console.log('✅ Window object available')
  
  // Test 2: Create and dispatch a test event
  const testEvent = new CustomEvent('viewResiDetail', {
    detail: { 
      kodeResi: 'TEST001', 
      satwa: { 
        id: 'test-id', 
        nama: 'Test Satwa',
        spesies: 'Test Species'
      } 
    }
  })
  
  console.log('📤 Creating test event:', testEvent)
  
  // Test 3: Set up event listener
  const eventListener = (event) => {
    console.log('📥 Event received:', event.detail)
  }
  
  window.addEventListener('viewResiDetail', eventListener)
  
  // Test 4: Dispatch the event
  console.log('🚀 Dispatching test event...')
  window.dispatchEvent(testEvent)
  
  // Test 5: Wait and check
  setTimeout(() => {
    console.log('⏰ Test completed')
    
    // Clean up
    window.removeEventListener('viewResiDetail', eventListener)
    console.log('🧹 Event listener removed')
  }, 1000)
  
} else {
  console.log('❌ Window object not available')
}
