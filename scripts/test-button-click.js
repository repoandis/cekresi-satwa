// Test script to debug button click issues
console.log('Testing button click functionality...')

// Test 1: Check if AllResiList component is loaded
setTimeout(() => {
  console.log('Checking for AllResiList component...')
  
  // Look for buttons in the DOM
  const buttons = document.querySelectorAll('button')
  console.log('Found buttons:', buttons.length)
  
  buttons.forEach((button, index) => {
    console.log(`Button ${index}:`, {
      text: button.textContent,
      hasOnClick: !!button.onclick,
      hasEventListener: button.hasAttribute('data-testid') || button.textContent.includes('Eye')
    })
  })
  
  // Test 2: Check if event listeners are working
  const testButton = document.querySelector('button[title*="View detail"]')
  if (testButton) {
    console.log('Found test button:', testButton)
    
    // Simulate click
    console.log('Simulating click...')
    testButton.click()
    
    // Check for events
    setTimeout(() => {
      console.log('Checking for viewResiDetail events...')
      const events = window.getEventListeners ? window.getEventListeners() : []
      console.log('Active event listeners:', events.length)
    }, 1000)
  }
  
  // Test 3: Check if useResiDetail hook is working
  console.log('Checking for custom events...')
  
  // Listen for custom events
  window.addEventListener('viewResiDetail', (event) => {
    console.log('✅ viewResiDetail event received:', event.detail)
  })
  
  // Test 4: Manual event dispatch
  setTimeout(() => {
    console.log('Testing manual event dispatch...')
    const testEvent = new CustomEvent('viewResiDetail', {
      detail: { kodeResi: 'TEST001', satwa: { id: 'test', nama: 'Test Satwa' } }
    })
    window.dispatchEvent(testEvent)
  }, 2000)
  
}, 1000)
