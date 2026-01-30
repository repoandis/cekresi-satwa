import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; progressId: string }> }
) {
  try {
    const { id, progressId } = await params
    const body = await request.json()
    const { status, lokasi, keterangan, tanggal } = body

    const result = await db.query(
      'UPDATE progress SET status = $1, lokasi = $2, keterangan = $3, tanggal = $4 WHERE id = $5 AND satwa_id = $6 RETURNING *',
      [status, lokasi, keterangan, tanggal, progressId, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Progress not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; progressId: string }> }
) {
  try {
    const { id, progressId } = await params
    const result = await db.query(
      'DELETE FROM progress WHERE id = $1 AND satwa_id = $2 RETURNING *',
      [progressId, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Progress not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Progress deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting progress:', error)
    return NextResponse.json(
      { error: 'Failed to delete progress' },
      { status: 500 }
    )
  }
}
