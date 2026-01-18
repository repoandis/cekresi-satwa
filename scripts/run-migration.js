const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runMigration() {
  try {
    console.log('Running satwa tables migration...')
    
    // Create satwa table
    console.log('Creating satwa table...')
    const { error: satwaError } = await supabase
      .from('satwa')
      .select('*')
      .limit(1)
    
    if (satwaError && satwaError.code === 'PGRST116') {
      // Table doesn't exist, create it using direct SQL
      console.log('Table does not exist, please run this SQL manually in Supabase SQL Editor:')
      console.log(`
-- Create satwa table
CREATE TABLE IF NOT EXISTS satwa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kode_resi VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(100) NOT NULL,
  spesies VARCHAR(100) NOT NULL,
  asal VARCHAR(200) NOT NULL,
  tujuan VARCHAR(200) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_TRANSIT', 'COMPLETED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create progress table
CREATE TABLE IF NOT EXISTS progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  satwa_id UUID NOT NULL REFERENCES satwa(id) ON DELETE CASCADE,
  status VARCHAR(100) NOT NULL,
  lokasi VARCHAR(200) NOT NULL,
  keterangan TEXT,
  tanggal TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dokumen table
CREATE TABLE IF NOT EXISTS dokumen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  satwa_id UUID NOT NULL REFERENCES satwa(id) ON DELETE CASCADE,
  nama VARCHAR(200) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_satwa_kode_resi ON satwa(kode_resi);
CREATE INDEX IF NOT EXISTS idx_progress_satwa_id ON progress(satwa_id);
CREATE INDEX IF NOT EXISTS idx_dokumen_satwa_id ON dokumen(satwa_id);
      `)
    } else {
      console.log('✅ Satwa table exists')
    }
    
    // Test status update
    console.log('\nTesting status update...')
    const { data: testData, error: testError } = await supabase
      .from('satwa')
      .select('*')
      .eq('kode_resi', 'TEST001')
      .single()
    
    if (testError && testError.code === 'PGRST116') {
      console.log('Creating test satwa...')
      const { data, error } = await supabase
        .from('satwa')
        .insert([{
          kode_resi: 'TEST001',
          nama: 'Test Satwa',
          spesies: 'Test Species',
          asal: 'Jakarta',
          tujuan: 'Surabaya',
          status: 'PENDING'
        }])
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error creating test satwa:', error)
      } else {
        console.log('✅ Test satwa created:', data.id)
      }
    } else {
      console.log('✅ Test satwa exists:', testData?.id)
      
      // Test status update
      const { data: updateData, error: updateError } = await supabase
        .from('satwa')
        .update({
          status: 'IN_TRANSIT',
          updated_at: new Date().toISOString()
        })
        .eq('id', testData.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('❌ Status update error:', updateError)
        console.error('Error details:', JSON.stringify(updateError, null, 2))
      } else {
        console.log('✅ Status update successful:', updateData.status)
      }
    }
    
  } catch (error) {
    console.error('Migration error:', error)
  }
}

runMigration()
