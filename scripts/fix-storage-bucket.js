const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixStorageBucket() {
  try {
    console.log('Fixing dokumen storage bucket...')
    
    // Delete existing bucket to recreate with correct settings
    const { error: deleteError } = await supabase.storage.deleteBucket('dokumen')
    
    if (deleteError) {
      console.log('Bucket might not exist or already deleted:', deleteError.message)
    } else {
      console.log('✅ Old bucket deleted')
    }
    
    // Create new bucket with permissive settings
    const { data, error } = await supabase.storage.createBucket('dokumen', {
      public: true,
      fileSizeLimit: 52428800 // 50MB
    })
    
    if (error) {
      console.error('Error creating bucket:', error)
      return
    }
    
    console.log('✅ New dokumen bucket created successfully')
    
    // Test upload with different file types
    const testFiles = [
      { name: 'test.txt', content: 'test content', type: 'text/plain' },
      { name: 'test.pdf', content: '%PDF-1.4', type: 'application/pdf' },
      { name: 'test.jpg', content: 'fake-image-data', type: 'image/jpeg' }
    ]
    
    for (const file of testFiles) {
      try {
        const testFile = new Blob([file.content], { type: file.type })
        const testFileName = `test/${Date.now()}-${file.name}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('dokumen')
          .upload(testFileName, testFile)
        
        if (uploadError) {
          console.log(`❌ ${file.name} upload failed:`, uploadError.message)
        } else {
          console.log(`✅ ${file.name} upload successful`)
          
          // Clean up
          await supabase.storage
            .from('dokumen')
            .remove([testFileName])
        }
      } catch (err) {
        console.log(`❌ ${file.name} test error:`, err.message)
      }
    }
    
    console.log('\n✅ Storage bucket is ready for file uploads!')
    
  } catch (error) {
    console.error('Error fixing storage bucket:', error)
  }
}

fixStorageBucket()
