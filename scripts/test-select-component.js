// Test script to verify Select component fix
console.log('Testing Select component fix...')

// Test the API endpoint with status filter
const testSelectAPI = async () => {
  try {
    console.log('\n1. Testing status filter with "all"...')
    const response = await fetch('http://localhost:3001/api/resi/all?status=all')
    const data = await response.json()
    console.log('Response:', data)
    
    console.log('\n2. Testing status filter with "PENDING"...')
    const pendingResponse = await fetch('http://localhost:3001/api/resi/all?status=PENDING')
    const pendingData = await pendingResponse.json()
    console.log('Pending response:', pendingData)
    
    console.log('\n3. Testing without status filter...')
    const noFilterResponse = await fetch('http://localhost:3001/api/resi/all')
    const noFilterData = await noFilterResponse.json()
    console.log('No filter response:', noFilterData)
    
  } catch (error) {
    console.error('Test error:', error)
  }
}

// Run test
testSelectAPI()
