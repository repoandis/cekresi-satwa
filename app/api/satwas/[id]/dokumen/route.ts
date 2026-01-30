import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { storage } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.query(
      'SELECT * FROM dokumen WHERE satwa_id = $1 ORDER BY uploaded_at DESC',
      [id]
    )

    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error fetching dokumen:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dokumen' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File
    const nama = formData.get('nama') as string

    if (!file || !nama) {
      return NextResponse.json(
        { error: 'File and nama are required' },
        { status: 400 }
      )
    }

    // Upload file to MinIO
    const fileExt = file.name.split('.').pop()
    const fileName = `${id}/${Date.now()}.${fileExt}`
    
    console.log('Uploading file to storage:', fileName)
    
    const buffer = Buffer.from(await file.arrayBuffer())
    await storage.uploadFile('cekresi-files', fileName, buffer, {
      'Content-Type': file.type
    })

    console.log('File uploaded successfully')

    // Get file URL
    const fileUrl = storage.getFileUrl('cekresi-files', fileName)

    // Save to database
    const result = await db.query(
      'INSERT INTO dokumen (satwa_id, nama, file_url, uploaded_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [id, nama, fileUrl]
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error uploading dokumen:', error)
    return NextResponse.json(
      { error: 'Failed to upload dokumen' },
      { status: 500 }
    )
  }
}
