// Test script to simulate the exact API call
const testStatusUpdate = async () => {
  try {
    console.log('Testing status update API call...')
    
    // Simulate the API call
    const satwaId = '6139bde2-4914-4932-86af-1ff0e433cf23' // Test satwa ID
    const newStatus = 'COMPLETED'
    
    console.log('Making API call to:', `/api/satwas/${satwaId}/progress/status`)
    console.log('Request body:', JSON.stringify({ status: newStatus }))
    
    const response = await fetch(`http://localhost:3001/api/satwas/${satwaId}/progress/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    })
    
    console.log('Response status:', response.status)
    const responseText = await response.text()
    console.log('Response body:', responseText)
    
    if (response.ok) {
      const data = JSON.parse(responseText)
      console.log('✅ Status update successful:', data.data.status)
    } else {
      console.error('❌ Status update failed:', responseText)
    }
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

// Run the test
testStatusUpdate()
