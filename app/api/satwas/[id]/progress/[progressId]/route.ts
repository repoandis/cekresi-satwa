import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; progressId: string }> }
) {
  try {
    const { id, progressId } = await params
    const body = await request.json()
    const { status, lokasi, keterangan, tanggal } = body

    const { data, error } = await supabase
      .from('progress')
      .update({
        status,
        lokasi,
        keterangan,
        tanggal: new Date(tanggal).toISOString()
      })
      .eq('id', progressId)
      .eq('satwa_id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json({
      error: 'Failed to update progress'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; progressId: string }> }
) {
  try {
    const { id, progressId } = await params
    const { error } = await supabase
      .from('progress')
      .delete()
      .eq('id', progressId)
      .eq('satwa_id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting progress:', error)
    return NextResponse.json({
      error: 'Failed to delete progress'
    }, { status: 500 })
  }
}
