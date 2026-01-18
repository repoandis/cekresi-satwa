const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSatwaAPI() {
  try {
    console.log('Testing satwa tables and API...')
    
    // Check if satwa table exists
    console.log('\n1. Checking satwa table:')
    try {
      const { data, error } = await supabase
        .from('satwa')
        .select('*')
        .limit(1)
      
      if (error) {
        console.error('❌ Satwa table error:', error.message)
        console.log('Creating satwa table...')
        
        // Create table if not exists
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: `
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
            
            CREATE INDEX IF NOT EXISTS idx_satwa_kode_resi ON satwa(kode_resi);
          `
        })
        
        if (createError) {
          console.error('❌ Error creating table:', createError)
        } else {
          console.log('✅ Satwa table created successfully')
        }
      } else {
        console.log('✅ Satwa table exists')
      }
    } catch (err) {
      console.error('❌ Error checking satwa table:', err.message)
    }
    
    // Check if progress table exists
    console.log('\n2. Checking progress table:')
    try {
      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .limit(1)
      
      if (error) {
        console.error('❌ Progress table error:', error.message)
        console.log('Creating progress table...')
        
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS progress (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              satwa_id UUID NOT NULL REFERENCES satwa(id) ON DELETE CASCADE,
              status VARCHAR(100) NOT NULL,
              lokasi VARCHAR(200) NOT NULL,
              keterangan TEXT,
              tanggal TIMESTAMP WITH TIME ZONE NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_progress_satwa_id ON progress(satwa_id);
          `
        })
        
        if (createError) {
          console.error('❌ Error creating progress table:', createError)
        } else {
          console.log('✅ Progress table created successfully')
        }
      } else {
        console.log('✅ Progress table exists')
      }
    } catch (err) {
      console.error('❌ Error checking progress table:', err.message)
    }
    
    // Test creating a sample satwa
    console.log('\n3. Testing create satwa:')
    try {
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
        if (error.code === '23505') {
          console.log('✅ Test satwa already exists')
          // Get existing test satwa
          const { data: existing } = await supabase
            .from('satwa')
            .select('*')
            .eq('kode_resi', 'TEST001')
            .single()
          
          if (existing) {
            console.log('✅ Found existing test satwa:', existing.id)
            
            // Test status update
            console.log('\n4. Testing status update:')
            const { data: updateData, error: updateError } = await supabase
              .from('satwa')
              .update({
                status: 'IN_TRANSIT',
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id)
              .select()
              .single()
            
            if (updateError) {
              console.error('❌ Status update error:', updateError)
            } else {
              console.log('✅ Status update successful:', updateData.status)
            }
          }
        } else {
          console.error('❌ Create satwa error:', error)
        }
      } else {
        console.log('✅ Test satwa created successfully:', data.id)
      }
    } catch (err) {
      console.error('❌ Error creating test satwa:', err.message)
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testSatwaAPI()
