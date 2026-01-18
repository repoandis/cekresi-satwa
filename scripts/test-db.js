const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Connection test failed:', error)
      return
    }
    
    console.log('✅ Supabase connection successful!')
    
    // Test if admin user exists
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .single()
    
    if (adminError) {
      if (adminError.code === 'PGRST116') {
        console.log('❌ Admin user not found. Please run the SQL migration.')
      } else {
        console.error('Error checking admin user:', adminError)
      }
    } else {
      console.log('✅ Admin user found:', adminUser.username)
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testConnection()
