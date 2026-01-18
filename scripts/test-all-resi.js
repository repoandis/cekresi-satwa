// Test script to simulate all resi API call
const testAllResi = async () => {
  try {
    console.log('Testing all resi API...')
    
    // Test basic fetch
    console.log('\n1. Testing basic fetch...')
    const response = await fetch('http://localhost:3001/api/resi/all')
    console.log('Response status:', response.status)
    const responseText = await response.text()
    console.log('Response body:', responseText)
    
    if (response.ok) {
      const data = JSON.parse(responseText)
      console.log('✅ Basic fetch successful:', data.data.length, 'resi')
      
      // Test with pagination
      console.log('\n2. Testing pagination...')
      const page2Response = await fetch('http://localhost:3001/api/resi/all?page=2&limit=5')
      const page2Data = await page2Response.json()
      console.log('✅ Pagination test:', page2Data.pagination)
      
      // Test with search
      console.log('\n3. Testing search...')
      const searchResponse = await fetch('http://localhost:3001/api/resi/all?search=TEST')
      const searchData = await searchResponse.json()
      console.log('✅ Search test:', searchData.data.length, 'results')
      
      // Test with status filter
      console.log('\n4. Testing status filter...')
      const statusResponse = await fetch('http://localhost:3001/api/resi/all?status=PENDING')
      const statusData = await statusResponse.json()
      console.log('✅ Status filter test:', statusData.data.length, 'pending resi')
      
    } else {
      console.error('❌ Basic fetch failed:', responseText)
    }
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

// Run test
testAllResi()
