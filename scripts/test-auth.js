const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  try {
    console.log('Testing authentication...')
    
    // Test login with correct credentials
    console.log('\n1. Testing login with correct credentials:')
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .eq('password', 'admin123')
    
    if (error) {
      console.error('❌ Login failed:', error.message)
    } else if (!data || data.length === 0) {
      console.log('❌ No user found with these credentials')
    } else {
      console.log('✅ Login successful!')
      console.log('User data:', { username: data[0].username, role: data[0].role })
    }
    
    // Test login with wrong credentials
    console.log('\n2. Testing login with wrong credentials:')
    const { data: wrongData, error: wrongError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .eq('password', 'wrongpassword')
    
    if (wrongError) {
      console.log('❌ Query error:', wrongError.message)
    } else if (!wrongData || wrongData.length === 0) {
      console.log('✅ Wrong credentials correctly rejected (no user found)')
    } else {
      console.log('❌ Wrong credentials should have been rejected')
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testAuth()
