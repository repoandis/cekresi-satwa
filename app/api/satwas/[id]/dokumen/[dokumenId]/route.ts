import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { storage } from '@/lib/storage'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dokumenId: string }> }
) {
  try {
    const { id, dokumenId } = await params
    
    // Get dokumen info first to delete file from storage
    const dokumenResult = await db.query(
      'SELECT file_url FROM dokumen WHERE id = $1 AND satwa_id = $2',
      [dokumenId, id]
    )

    if (dokumenResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Dokumen not found' },
        { status: 404 }
      )
    }

    const dokumen = dokumenResult.rows[0]
    
    // Delete file from MinIO
    if (dokumen.file_url) {
      const fileName = dokumen.file_url.split('/').pop()
      if (fileName) {
        await storage.deleteFile('cekresi-files', `${id}/${fileName}`)
      }
    }

    // Delete from database
    await db.query(
      'DELETE FROM dokumen WHERE id = $1 AND satwa_id = $2',
      [dokumenId, id]
    )

    return NextResponse.json({
      success: true,
      message: 'Dokumen deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting dokumen:', error)
    return NextResponse.json(
      { error: 'Failed to delete dokumen' },
      { status: 500 }
    )
  }
}
