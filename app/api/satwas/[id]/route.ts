import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.query(
      'SELECT * FROM satwa WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Satwa not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error fetching satwa:', error)
    return NextResponse.json(
      { error: 'Failed to fetch satwa' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { kodeResi, nama, spesies, asal, tujuan, status } = body

    const result = await db.query(
      'UPDATE satwa SET kode_resi = $1, nama = $2, spesies = $3, asal = $4, tujuan = $5, status = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [kodeResi, nama, spesies, asal, tujuan, status, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Satwa not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error updating satwa:', error)
    return NextResponse.json(
      { error: 'Failed to update satwa' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db.query(
      'DELETE FROM satwa WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Satwa not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Satwa deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting satwa:', error)
    return NextResponse.json(
      { error: 'Failed to delete satwa' },
      { status: 500 }
    )
  }
}
