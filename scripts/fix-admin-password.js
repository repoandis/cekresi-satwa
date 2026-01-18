const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAdminPassword() {
  try {
    console.log('Updating admin password...')
    
    // Update admin password to plain text for development
    const { data, error } = await supabase
      .from('users')
      .update({ password: 'admin123' })
      .eq('username', 'admin')
      .select()
    
    if (error) {
      console.error('Error updating password:', error)
      return
    }
    
    console.log('✅ Admin password updated successfully!')
    console.log('Updated user:', { username: data[0].username, role: data[0].role })
    
  } catch (error) {
    console.error('Update failed:', error)
  }
}

fixAdminPassword()
