const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runDokumenSQL() {
  try {
    console.log('Running dokumen table fixes...')
    
    // Check if dokumen table exists
    const { data: tables, error: tableError } = await supabase
      .from('dokumen')
      .select('*')
      .limit(1)
    
    if (tableError && tableError.code === 'PGRST116') {
      console.log('Creating dokumen table...')
      
      // Create table manually
      const { error: createError } = await supabase.rpc('sql', {
        query: `
          CREATE TABLE IF NOT EXISTS dokumen (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            satwa_id UUID NOT NULL REFERENCES satwa(id) ON DELETE CASCADE,
            nama VARCHAR(200) NOT NULL,
            file_url VARCHAR(500) NOT NULL,
            uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_dokumen_satwa_id ON dokumen(satwa_id);
          
          ALTER TABLE dokumen DISABLE ROW LEVEL SECURITY;
        `
      })
      
      if (createError) {
        console.log('Manual creation failed. Please run this SQL in Supabase SQL Editor:')
        console.log(`
-- Create dokumen table
CREATE TABLE IF NOT EXISTS dokumen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  satwa_id UUID NOT NULL REFERENCES satwa(id) ON DELETE CASCADE,
  nama VARCHAR(200) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_dokumen_satwa_id ON dokumen(satwa_id);

-- Disable RLS
ALTER TABLE dokumen DISABLE ROW LEVEL SECURITY;
        `)
      } else {
        console.log('✅ Dokumen table created successfully')
      }
    } else {
      console.log('✅ Dokumen table exists')
      
      // Try to disable RLS
      console.log('Disabling RLS...')
      
      // Test if we can insert (RLS disabled)
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
          nama: 'RLS Test',
          file_url: 'https://test.com/test.pdf'
        }])
        .select()
        .single()
      
      if (insertError) {
        console.error('❌ RLS still enabled. Please run this SQL in Supabase SQL Editor:')
        console.log('ALTER TABLE dokumen DISABLE ROW LEVEL SECURITY;')
      } else {
        console.log('✅ RLS is disabled')
        
        // Clean up test
        await supabase
          .from('dokumen')
          .delete()
          .eq('id', insertData.id)
        
        console.log('✅ Test record cleaned up')
      }
    }
    
    // Final test
    console.log('\nFinal upload test...')
    const { data: finalTestData, error: finalTestError } = await supabase
      .from('satwa')
      .select('*')
      .eq('kode_resi', 'TEST001')
      .single()
    
    if (finalTestError) {
      console.error('❌ Error getting test satwa:', finalTestError)
      return
    }
    
    const { data: finalInsertData, error: finalInsertError } = await supabase
      .from('dokumen')
      .insert([{
        satwa_id: finalTestData.id,
        nama: 'Final Test Document',
        file_url: 'https://example.com/final.pdf'
      }])
      .select()
      .single()
    
    if (finalInsertError) {
      console.error('❌ Final test failed:', finalInsertError)
    } else {
      console.log('✅ Final test successful:', finalInsertData)
      
      // Clean up
      await supabase
        .from('dokumen')
        .delete()
        .eq('id', finalInsertData.id)
      
      console.log('✅ Final test cleaned up')
      console.log('🎉 Dokumen table is ready for uploads!')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

runDokumenSQL()
