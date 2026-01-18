import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create service role client for RLS bypass
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabaseService
      .from('dokumen')
      .select('*')
      .eq('satwa_id', id)
      .order('uploaded_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching dokumen:', error)
    return NextResponse.json({
      error: 'Failed to fetch dokumen'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Starting dokumen upload for satwa:', id)
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const nama = formData.get('nama') as string

    console.log('Form data:', { fileName: file?.name, nama, fileSize: file?.size })

    if (!file || !nama) {
      console.error('Missing file or nama')
      return NextResponse.json({
        error: 'Missing file or nama'
      }, { status: 400 })
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size)
      return NextResponse.json({
        error: 'File too large. Maximum size is 10MB'
      }, { status: 400 })
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${id}/${Date.now()}.${fileExt}`
    
    console.log('Uploading file to storage:', fileName)
    
    const { data: uploadData, error: uploadError } = await supabaseService.storage
      .from('dokumen')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw uploadError
    }

    console.log('File uploaded successfully:', uploadData)

    // Get public URL
    const { data: urlData } = supabaseService.storage
      .from('dokumen')
      .getPublicUrl(fileName)

    console.log('Public URL generated:', urlData.publicUrl)

    // Save to database using service role (bypasses RLS)
    const { data, error } = await supabaseService
      .from('dokumen')
      .insert([{
        satwa_id: id,
        nama,
        file_url: urlData.publicUrl
      }])
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      throw error
    }

    console.log('Dokumen saved to database:', data)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error uploading dokumen:', error)
    return NextResponse.json({
      error: 'Failed to upload dokumen: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
