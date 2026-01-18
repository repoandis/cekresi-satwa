// Test script to simulate the exact dokumen upload API call
const testDokumenUpload = async () => {
  try {
    console.log('Testing dokumen upload API...')
    
    // Get test satwa
    const { createClient } = require('@supabase/supabase-js')
    require('dotenv').config({ path: '.env.local' })
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    const { data: testData, error: testError } = await supabase
      .from('satwa')
      .select('*')
      .eq('kode_resi', 'TEST001')
      .single()
    
    if (testError) {
      console.error('❌ Error getting test satwa:', testError)
      return
    }
    
    console.log('✅ Found test satwa:', testData.id)
    
    // Create a test file
    const testFile = new Blob(['This is a test document content'], { type: 'text/plain' })
    const formData = new FormData()
    formData.append('file', testFile, 'test-document.txt')
    formData.append('nama', 'Test Document')
    
    console.log('Making API call to:', `/api/satwas/${testData.id}/dokumen`)
    console.log('FormData:', { 
      fileName: 'test-document.txt',
      nama: 'Test Document',
      fileSize: testFile.size
    })
    
    const response = await fetch(`http://localhost:3001/api/satwas/${testData.id}/dokumen`, {
      method: 'POST',
      body: formData,
    })
    
    console.log('Response status:', response.status)
    const responseText = await response.text()
    console.log('Response body:', responseText)
    
    if (response.ok) {
      const data = JSON.parse(responseText)
      console.log('✅ Dokumen upload successful:', data)
      
      // Test getting the dokumen list
      const listResponse = await fetch(`http://localhost:3001/api/satwas/${testData.id}/dokumen`)
      if (listResponse.ok) {
        const dokumenList = await listResponse.json()
        console.log('✅ Dokumen list:', dokumenList.length, 'documents')
      }
    } else {
      console.error('❌ Dokumen upload failed:', responseText)
    }
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

// Run the test
testDokumenUpload()
