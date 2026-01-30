import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.query(
      'SELECT * FROM progress WHERE satwa_id = $1 ORDER BY created_at ASC',
      [id]
    )

    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
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
    const body = await request.json()
    const { status, lokasi, keterangan } = body

    const result = await db.query(
      'INSERT INTO progress (satwa_id, status, lokasi, keterangan, tanggal) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [id, status, lokasi, keterangan]
    )

    // Update satwa status
    await db.query(
      'UPDATE satwa SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error creating progress:', error)
    return NextResponse.json(
      { error: 'Failed to create progress' },
      { status: 500 }
    )
  }
}
