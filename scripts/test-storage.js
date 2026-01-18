const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testStorage() {
  try {
    console.log('Testing Supabase Storage...')
    
    // List buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return
    }
    
    console.log('Available buckets:', buckets.map(b => b.name))
    
    const dokumenBucket = buckets.find(bucket => bucket.name === 'dokumen')
    
    if (!dokumenBucket) {
      console.log('❌ Dokumen bucket not found. Creating...')
      
      const { data, error } = await supabase.storage.createBucket('dokumen', {
        public: true,
        allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        fileSizeLimit: 52428800 // 50MB
      })
      
      if (error) {
        console.error('Error creating bucket:', error)
      } else {
        console.log('✅ Dokumen bucket created successfully')
      }
    } else {
      console.log('✅ Dokumen bucket exists')
      console.log('Bucket details:', {
        name: dokumenBucket.name,
        public: dokumenBucket.public,
        file_size_limit: dokumenBucket.file_size_limit,
        allowed_mime_types: dokumenBucket.allowed_mime_types
      })
    }
    
    // Test upload a small file
    console.log('\nTesting file upload...')
    const testFile = new Blob(['test content'], { type: 'text/plain' })
    const testFileName = `test/${Date.now()}.txt`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('dokumen')
      .upload(testFileName, testFile)
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError)
    } else {
      console.log('✅ Upload test successful:', uploadData)
      
      // Test public URL
      const { data: urlData } = supabase.storage
        .from('dokumen')
        .getPublicUrl(testFileName)
      
      console.log('✅ Public URL:', urlData.publicUrl)
      
      // Clean up test file
      await supabase.storage
        .from('dokumen')
        .remove([testFileName])
      
      console.log('✅ Test file cleaned up')
    }
    
  } catch (error) {
    console.error('Storage test error:', error)
  }
}

testStorage()
