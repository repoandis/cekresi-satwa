import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dokumenId: string }> }
) {
  try {
    const { id, dokumenId } = await params
    // Get dokumen info first to delete file from storage
    const { data: dokumen, error: fetchError } = await supabase
      .from('dokumen')
      .select('file_url')
      .eq('id', dokumenId)
      .eq('satwa_id', id)
      .single()

    if (fetchError) throw fetchError

    // Delete file from storage
    if (dokumen?.file_url) {
      const fileName = dokumen.file_url.split('/').pop()
      if (fileName) {
        await supabase.storage
          .from('dokumen')
          .remove([`${id}/${fileName}`])
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('dokumen')
      .delete()
      .eq('id', dokumenId)
      .eq('satwa_id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting dokumen:', error)
    return NextResponse.json({
      error: 'Failed to delete dokumen'
    }, { status: 500 })
  }
}
