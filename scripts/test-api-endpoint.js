const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testAPIEndpoint() {
  try {
    console.log('Testing API endpoint logic...')
    
    // Get test satwa
    const { data: testData, error: testError } = await supabase
      .from('satwa')
      .select('*')
      .eq('kode_resi', 'TEST001')
      .single()
    
    if (testError) {
      console.error('❌ Error getting test satwa:', testError)
      return
    }
    
    console.log('✅ Found test satwa:', testData.id)
    
    // Simulate the API logic
    const satwaId = testData.id
    const newStatus = 'COMPLETED'
    
    console.log('\nTesting status update with API logic...')
    
    const { data, error } = await supabase
      .from('satwa')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', satwaId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Update error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ Update successful:', data.status)
    }
    
    // Test the exact same logic as the API route
    console.log('\nTesting exact API route logic...')
    
    try {
      const body = { status: 'PENDING' }
      const { status } = body
      
      if (!status) {
        console.log('❌ Missing status')
        return
      }
      
      const { data: apiData, error: apiError } = await supabase
        .from('satwa')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', satwaId)
        .select()
        .single()
      
      if (apiError) throw apiError
      
      console.log('✅ API logic successful:', apiData.status)
      
    } catch (apiErr) {
      console.error('❌ API logic error:', apiErr)
      console.error('Error details:', JSON.stringify(apiErr, null, 2))
    }
    
  } catch (error) {
    console.error('Test error:', error)
  }
}

testAPIEndpoint()
