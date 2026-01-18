const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createStorageBucket() {
  try {
    console.log('Creating dokumen storage bucket...')
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return
    }
    
    const dokumenBucket = buckets.find(bucket => bucket.name === 'dokumen')
    
    if (dokumenBucket) {
      console.log('✅ Dokumen bucket already exists')
    } else {
      // Create the bucket
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
    }
    
    // Set up bucket policies
    const { error: policyError } = await supabase.storage.from('dokumen').createPolicy('public-read', {
      roles: ['anon', 'authenticated'],
      permissions: ['read']
    })
    
    if (policyError) {
      console.log('Policy might already exist or error:', policyError.message)
    } else {
      console.log('✅ Bucket policy created')
    }
    
  } catch (error) {
    console.error('Error creating storage bucket:', error)
  }
}

createStorageBucket()
