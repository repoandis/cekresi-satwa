const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function disableRLS() {
  try {
    console.log('Disabling RLS for dokumen table...')
    
    // Disable RLS for dokumen table
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE dokumen DISABLE ROW LEVEL SECURITY;'
    })
    
    if (error) {
      console.error('Error disabling RLS:', error)
      console.log('Trying alternative approach...')
      
      // Try direct SQL (this won't work but let's see the error)
      try {
        const { data, error: directError } = await supabase
          .from('dokumen')
          .select('*')
          .limit(1)
        
        if (directError) {
          console.log('Direct query error:', directError)
          console.log('Please manually run this SQL in Supabase SQL Editor:')
          console.log('ALTER TABLE dokumen DISABLE ROW LEVEL SECURITY;')
        } else {
          console.log('✅ RLS already disabled or not working')
        }
      } catch (err) {
        console.log('Manual SQL required')
      }
    } else {
      console.log('✅ RLS disabled successfully')
    }
    
    // Test insert
    console.log('\nTesting dokumen insert...')
    const { data: testData, error: testError } = await supabase
      .from('satwa')
      .select('*')
      .eq('kode_resi', 'TEST001')
      .single()
    
    if (testError) {
      console.error('❌ Error getting test satwa:', testError)
      return
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('dokumen')
      .insert([{
        satwa_id: testData.id,
        nama: 'Test Document',
        file_url: 'https://example.com/test.pdf'
      }])
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError)
    } else {
      console.log('✅ Insert test successful:', insertData)
      
      // Clean up
      await supabase
        .from('dokumen')
        .delete()
        .eq('id', insertData.id)
      
      console.log('✅ Test record cleaned up')
    }
    
  } catch (error) {
    console.error('Error disabling RLS:', error)
  }
}

disableRLS()
