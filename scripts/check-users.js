const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkUsers() {
  try {
    console.log('Checking all users in database...')
    
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
    
    if (error) {
      console.error('Error fetching users:', error)
      return
    }
    
    console.log(`Found ${users.length} users:`)
    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: "${user.username}", Password: "${user.password}", Role: "${user.role}"`)
    })
    
    // Try to find admin specifically
    console.log('\nLooking for admin user specifically:')
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
    
    if (adminError) {
      console.error('Error finding admin:', adminError)
    } else {
      console.log(`Found ${adminUsers.length} admin users:`)
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. Username: "${user.username}", Password: "${user.password}"`)
      })
    }
    
  } catch (error) {
    console.error('Check failed:', error)
  }
}

checkUsers()
